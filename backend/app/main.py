import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import HOST, PORT, CORS_ORIGINS
from app.websocket_manager import manager
from app.gesture_engine import gesture_engine
from app.youtube_resolver import resolve_playlist

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Gesture Music Player")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/resolve")
async def resolve_youtube(body: dict):
    urls = body.get("urls", [])
    if not urls:
        raise HTTPException(status_code=400, detail="No URLs provided")

    songs = resolve_playlist(urls)

    if not songs:
        raise HTTPException(status_code=400, detail="Failed to resolve any URLs")

    failed_urls = [url for url in urls if not any(s["youtubeUrl"] == url for s in songs)]

    return {
        "songs": [
            {
                "id": idx + 1,
                "title": s["title"],
                "artist": s["artist"],
                "thumbnail": s["thumbnail"],
                "youtubeUrl": s["youtubeUrl"],
                "audioUrl": s["audioUrl"],
            }
            for idx, s in enumerate(songs)
        ],
        "failed": failed_urls,
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "gesture":
                gesture = msg.get("gesture")
                hand_x = msg.get("handX", 0.5)
                hand_y = msg.get("handY", 0.5)
                timestamp = msg.get("timestamp", 0)

                command = gesture_engine.process_gesture(gesture, hand_x, hand_y, timestamp)

                if command:
                    logger.info(f"Command: {command} (from gesture: {gesture})")
                    await manager.broadcast({
                        "type": "command",
                        "action": command,
                    })

            elif msg.get("type") == "state":
                await manager.broadcast({
                    "type": "state",
                    **msg.get("state", {}),
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)

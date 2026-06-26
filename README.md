<p align="center">
  <img src="https://img.icons8.com/fluency/96/000000/music--v1.png" width="64" />
  <h1 align="center">MusicCam</h1>
  <p align="center">Gesture-Controlled Music Player via Webcam</p>
  <p align="center">
    🎵 Play music from YouTube URLs · ✋ Control with hand gestures · 📖 3D Book playlist
  </p>
</p>

---

## Features

| Gesture | Action      | Emoji |
|---------|-------------|-------|
| Thumbs Up   | Play        | 👍    |
| Open Palm   | Pause       | ✋    |
| Peace Sign  | Next Song   | ✌️    |
| ILY Sign    | Previous    | 🤟    |
| Thumb-Index Apart | Volume Up   | 🔊    |
| Thumb-Index Close  | Volume Down | 🔉    |

- **Client-side gesture detection** via MediaPipe (zero latency, no frame upload)
- **YouTube as music source** — paste any YouTube URL, auto-extract audio via yt-dlp
- **3D Book carousel** — song cards fan out in 3D perspective like book pages
- **Calibration screen** — train each gesture before playing
- **Persistent playlist** — saved to localStorage

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite, TailwindCSS, Framer Motion, Howler.js |
| Backend  | FastAPI, WebSockets, yt-dlp |
| CV/AI    | MediaPipe Hands (client-side) |

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** — installed and available in PATH

## Installation

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/MusicCam.git
cd MusicCam

# --- Backend ---
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt

# --- Frontend ---
cd ../frontend
npm install
```

## Usage

### 1. Start Backend

```bash
cd backend
venv\Scripts\activate    # Windows
python -m app.main
```

Backend runs on `http://localhost:8000`.

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in Chrome/Edge (camera required).

### 3. Calibrate

Each gesture must be performed **3 times** to pass calibration. The calibration screen shows real-time finger curl feedback.

### 4. Add Songs

Paste YouTube URLs (one per line) in the Playlist Setup screen. Thumbnails, titles, and artists are auto-resolved.

### 5. Play with Gestures

Stand in front of the camera and use the gestures above. A floating overlay confirms each detected gesture.

## Project Structure

```
MusicCam/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI server, /api/resolve, /ws
│   │   ├── youtube_resolver.py   # yt-dlp extraction + cache
│   │   ├── websocket_manager.py  # WebSocket connection manager
│   │   ├── gesture_engine.py     # Gesture-to-command mapping
│   │   └── config.py             # App configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Camera.jsx        # Webcam + hand skeleton overlay
│   │   │   ├── MusicCard.jsx     # 3D book carousel card
│   │   │   ├── MusicPlayer.jsx   # Howler.js audio player
│   │   │   ├── GestureCalibration.jsx  # 7-step training
│   │   │   └── GestureOverlay.jsx      # Animated feedback
│   │   ├── hooks/
│   │   │   └── useGesture.js     # MediaPipe + gesture classification
│   │   ├── pages/
│   │   │   └── Home.jsx          # Main player screen
│   │   └── App.jsx               # Calibrate → Setup → Play flow
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## How It Works

1. **MediaPipe** runs in the browser via WebAssembly — no video data is sent to the server.
2. **yt-dlp** on the backend resolves YouTube URLs to direct audio streams (expire after a few hours, re-resolved on restart).
3. **Howler.js** plays the audio stream directly in the browser.
4. **Gesture cooldown** (0.5s) prevents accidental repeated triggers.

## Browser Support

- Google Chrome (recommended)
- Microsoft Edge

Camera access required. GPU delegate preferred; falls back to CPU if unavailable.

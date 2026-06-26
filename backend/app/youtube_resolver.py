import time
import logging
from yt_dlp import YoutubeDL

logger = logging.getLogger(__name__)

_cache = {}
CACHE_TTL = 3600
MAX_PLAYLIST_ITEMS = 50


def _is_cache_valid(entry):
    return (time.time() - entry["cached_at"]) < CACHE_TTL


def extract_single(info: dict, url: str = None) -> dict:
    title = info.get("title", "Unknown")
    artist = info.get("uploader", "Unknown")
    thumbnail = info.get("thumbnail", "")

    audio_url = None
    for fmt in info.get("formats") or []:
        if not isinstance(fmt, dict):
            continue
        vcodec = fmt.get("vcodec", "none")
        acodec = fmt.get("acodec", "none")
        if acodec != "none" and vcodec == "none" and fmt.get("url"):
            audio_url = fmt["url"]
            if fmt.get("ext") in ("m4a",):
                break

    if not audio_url:
        audio_url = info.get("url")

    video_id = info.get("id") or info.get("display_id") or ""
    video_url = (
        url
        or f"https://youtube.com/watch?v={video_id}"
        or f"https://youtu.be/{video_id}"
    )

    return {
        "title": title,
        "artist": artist,
        "thumbnail": thumbnail,
        "youtubeUrl": video_url,
        "audioUrl": audio_url,
    }


def resolve_youtube_url(url: str) -> list[dict]:
    now = time.time()

    if url in _cache and _is_cache_valid(_cache[url]):
        logger.info(f"Cache hit: {url}")
        return _cache[url]["data"]

    try:
        logger.info(f"Resolving: {url}")
        ydl_opts = {
            "format": "bestaudio[ext=m4a]/bestaudio/best",
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
            "playlistend": MAX_PLAYLIST_ITEMS,
        }

        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            if info.get("_type") == "playlist" or info.get("entries"):
                entries = info.get("entries") or []
                results = []
                for i, entry in enumerate(entries):
                    if entry is None:
                        logger.warning(f"Skipping None entry #{i} in playlist")
                        continue
                    results.append(extract_single(entry))

                if not results:
                    logger.warning(f"No valid entries found in playlist: {url}")
                    return []

                logger.info(f"Resolved {len(results)} songs from playlist: {url}")
                _cache[url] = {"data": results, "cached_at": now}
                return results

            song = extract_single(info, url)
            _cache[url] = {"data": [song], "cached_at": now}
            return [song]

    except Exception as e:
        logger.error(f"Failed to resolve {url}: {e}")
        return []


def resolve_playlist(urls: list[str]) -> list[dict]:
    results = []
    for url in urls:
        songs = resolve_youtube_url(url)
        results.extend(songs)
    return results


def clear_cache():
    _cache.clear()

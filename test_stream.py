import httpx, urllib.parse, sys, time

yt_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
encoded = urllib.parse.quote(yt_url)
proxy_url = f"http://localhost:8000/api/audio-proxy?yt={encoded}"

print(f"Testing: {proxy_url[:100]}...")
sys.stdout.flush()

try:
    with httpx.Client(timeout=30) as client:
        start = time.time()
        r = client.get(proxy_url, follow_redirects=True)
        elapsed = time.time() - start
        print(f"Status: {r.status_code}")
        print(f"Content-Type: {r.headers.get('content-type', 'N/A')}")
        print(f"Content-Length: {r.headers.get('content-length', 'N/A')}")
        print(f"Elapsed: {elapsed:.1f}s")
        print(f"Bytes received: {len(r.content)}")

        if r.status_code == 200 and len(r.content) > 5000:
            print("\n=== SUCCESS: Audio streaming works ===")
        else:
            print(f"\n=== WARNING: Unexpected result ===")
except Exception as e:
    print(f"\n=== FAILED: {e} ===")

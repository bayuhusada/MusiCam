import subprocess, sys, os, time

cmd = [
    sys.executable, "-m", "yt_dlp",
    "-o", "-",
    "--format", "bestaudio[ext=m4a]/bestaudio/best",
    "--no-warnings",
    "--quiet",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
]

print(f"Running: {' '.join(cmd)}")
sys.stdout.flush()

proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
total = 0
start = time.time()

# Read first 5 seconds of audio
while time.time() - start < 5:
    chunk = proc.stdout.read(65536)
    if not chunk:
        break
    total += len(chunk)
    if total > 500000:  # 500KB is enough to test
        break

elapsed = time.time() - start
print(f"Time: {elapsed:.1f}s")
print(f"Bytes received: {total}")

proc.kill()
proc.wait()

if total > 10000:
    print("SUCCESS: yt-dlp outputs audio data to stdout")
else:
    stderr = proc.stderr.read().decode(errors="replace")
    print(f"FAILED: stderr: {stderr[:500]}")

param([string]$Action = "test")

if ($Action -eq "start") {
    $proc = Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m", "app.main" -PassThru
    Start-Sleep -Seconds 5
    Write-Host $proc.Id
    return
}

if ($Action -eq "test") {
    Write-Host "=== Testing /api/resolve ==="
    $body = '{"urls":["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]}'
    
    try {
        $resolve = Invoke-RestMethod -Uri "http://localhost:8000/api/resolve" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "OK - Title: $($resolve.songs[0].title)"
        Write-Host "OK - Artist: $($resolve.songs[0].artist)"
        Write-Host "OK - Thumbnail: $($resolve.songs[0].thumbnail)"
        
        $ytUrl = $resolve.songs[0].youtubeUrl
        $ytEncoded = [System.Web.HttpUtility]::UrlEncode($ytUrl)
        
        Write-Host "`n=== Testing /api/audio-proxy (first 10s) ==="
        $streamUrl = "http://localhost:8000/api/audio-proxy?yt=$ytEncoded"
        $audioReq = Invoke-WebRequest -Uri $streamUrl -TimeoutSec 25 -ErrorAction Stop
        Write-Host "OK - Status: $($audioReq.StatusCode)"
        Write-Host "OK - Content-Type: $($audioReq.Headers['Content-Type'])"
        Write-Host "OK - Bytes received: $($audioReq.Content.Length)"
        
        if ($audioReq.Content.Length -gt 1000) {
            Write-Host "`nSUCCESS: Audio stream works!"
        } else {
            Write-Host "`nWARNING: Audio stream too small"
        }
    }
    catch {
        Write-Host "FAILED: $_"
    }
}

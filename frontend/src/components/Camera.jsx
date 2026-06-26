import { useEffect, useRef } from 'react'

const CONNECTION_PAIRS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],
  [9,13],[13,14],[14,15],
  [0,17],[17,18],[18,19],[19,20],
  [5,13],[13,17],
]

export default function Camera({ onLandmarks, mirrored = true, videoRef: externalRef, onError }) {
  const internalRef = useRef(null)
  const videoRef = externalRef || internalRef
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarksRef = useRef(null)

  // Keep ref in sync so draw loop always has latest landmarks
  landmarksRef.current = onLandmarks

  useEffect(() => {
    let mounted = true

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        })

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
        }
      } catch (err) {
        console.error('Camera access denied:', err)
        if (onError) onError(err)
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [videoRef])

  // Draw hand skeleton on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const video = videoRef.current
      if (video && video.videoWidth) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      const lm = landmarksRef.current
      if (lm && lm.length > 0) {
        const w = canvas.width
        const h = canvas.height

        // Draw connections
        ctx.strokeStyle = 'rgba(0, 255, 150, 0.5)'
        ctx.lineWidth = 2
        for (const [i, j] of CONNECTION_PAIRS) {
          ctx.beginPath()
          ctx.moveTo(lm[i].x * w, lm[i].y * h)
          ctx.lineTo(lm[j].x * w, lm[j].y * h)
          ctx.stroke()
        }

        // Draw landmarks
        for (const p of lm) {
          ctx.beginPath()
          ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0, 255, 150, 0.8)'
          ctx.fill()
        }
      }

      requestAnimationFrame(draw)
    }

    const raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
    </div>
  )
}

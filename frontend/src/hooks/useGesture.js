import { useEffect, useRef, useState, useCallback } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

const CURL_TH = 1.2
const THUMB_EXT_TH = 1.15
const THUMB_SIDE_TH = 1.1
const VOLUME_UP_DIST = 0.12
const VOLUME_DOWN_DIST = 0.07

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function fingerCurlRatio(landmarks, tip, pip, mcp) {
  const tipToMcp = distance(landmarks[tip], landmarks[mcp])
  const pipToMcp = distance(landmarks[pip], landmarks[mcp])
  return tipToMcp / (pipToMcp || 0.001)
}

function getFingerStates(landmarks) {
  return {
    thumbExt: distance(landmarks[4], landmarks[5]) > distance(landmarks[3], landmarks[5]) * THUMB_EXT_TH,
    thumbSide: distance(landmarks[4], landmarks[5]) > distance(landmarks[2], landmarks[5]) * THUMB_SIDE_TH,
    thumbUp: landmarks[4].y < landmarks[3].y,
    indexCurl: fingerCurlRatio(landmarks, 8, 6, 5),
    middleCurl: fingerCurlRatio(landmarks, 12, 10, 9),
    ringCurl: fingerCurlRatio(landmarks, 16, 14, 13),
    pinkyCurl: fingerCurlRatio(landmarks, 20, 18, 17),
    thumbIndexDist: distance(landmarks[4], landmarks[8]),
  }
}

function isThumbsUp(landmarks) {
  const f = getFingerStates(landmarks)
  const curled = f.indexCurl < CURL_TH && f.middleCurl < CURL_TH && f.ringCurl < CURL_TH && f.pinkyCurl < CURL_TH
  return f.thumbExt && f.thumbUp && curled
}

function isPeaceSign(landmarks) {
  const f = getFingerStates(landmarks)
  return f.indexCurl > CURL_TH && f.middleCurl > CURL_TH && f.ringCurl < CURL_TH && f.pinkyCurl < CURL_TH
}

function isOpenPalm(landmarks) {
  const f = getFingerStates(landmarks)
  const extended = f.indexCurl > CURL_TH && f.middleCurl > CURL_TH && f.ringCurl > CURL_TH && f.pinkyCurl > CURL_TH
  return extended && f.thumbSide
}

function isILYSign(landmarks) {
  const f = getFingerStates(landmarks)
  if (!f.thumbExt) return false
  if (f.indexCurl < CURL_TH) return false
  if (f.middleCurl > CURL_TH) return false
  if (f.ringCurl > CURL_TH) return false
  if (f.pinkyCurl < CURL_TH) return false
  return true
}

function isVolumeUp(landmarks) {
  const f = getFingerStates(landmarks)
  if (!f.thumbExt) return false
  if (f.indexCurl < CURL_TH) return false
  if (f.middleCurl > CURL_TH || f.ringCurl > CURL_TH || f.pinkyCurl > CURL_TH) return false
  return f.thumbIndexDist > VOLUME_UP_DIST
}

function isVolumeDown(landmarks) {
  const f = getFingerStates(landmarks)
  if (!f.thumbExt) return false
  if (f.indexCurl < CURL_TH) return false
  if (f.middleCurl > CURL_TH || f.ringCurl > CURL_TH || f.pinkyCurl > CURL_TH) return false
  return f.thumbIndexDist < VOLUME_DOWN_DIST
}

function matchGesture(landmarks) {
  return {
    thumbs_up: isThumbsUp(landmarks),
    peace: isPeaceSign(landmarks),
    open_palm: isOpenPalm(landmarks),
    ily: isILYSign(landmarks),
    volume_up: isVolumeUp(landmarks),
    volume_down: isVolumeDown(landmarks),
  }
}

let gestureLogCount = 0

function classifyGesture(landmarks, cooldownRef) {
  const now = Date.now() / 1000
  if (now - cooldownRef.current < 0.5) return null

  const hx = landmarks[9].x
  const hy = landmarks[9].y

  if (isOpenPalm(landmarks)) {
    if (gestureLogCount++ % 4 === 0) console.log('Gesture: open_palm')
    cooldownRef.current = now
    return { gesture: 'open_palm', handX: hx, handY: hy }
  }

  if (isThumbsUp(landmarks)) {
    if (gestureLogCount++ % 4 === 0) console.log('Gesture: thumbs_up')
    cooldownRef.current = now
    return { gesture: 'thumbs_up', handX: hx, handY: hy }
  }

  if (isPeaceSign(landmarks)) {
    if (gestureLogCount++ % 4 === 0) console.log('Gesture: peace')
    cooldownRef.current = now
    return { gesture: 'peace', handX: hx, handY: hy }
  }

  if (isILYSign(landmarks)) {
    if (gestureLogCount++ % 4 === 0) console.log('Gesture: ily')
    cooldownRef.current = now
    return { gesture: 'ily', handX: hx, handY: hy }
  }

  if (isVolumeUp(landmarks)) {
    if (gestureLogCount++ % 4 === 0) console.log('Gesture: volume_up')
    cooldownRef.current = now
    return { gesture: 'volume_up', handX: hx, handY: hy }
  }

  if (isVolumeDown(landmarks)) {
    if (gestureLogCount++ % 4 === 0) console.log('Gesture: volume_down')
    cooldownRef.current = now
    return { gesture: 'volume_down', handX: hx, handY: hy }
  }

  return null
}

export { getFingerStates, isThumbsUp, isPeaceSign, isOpenPalm, isILYSign, isVolumeUp, isVolumeDown, matchGesture }

export function useGesture(videoRef) {
  const [gesture, setGesture] = useState(null)
  const [landmarks, setLandmarks] = useState(null)
  const [status, setStatus] = useState('loading')
  const landmarkerRef = useRef(null)
  const cooldownRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )
        if (!mounted) return

        const delegates = ['GPU', 'CPU']
        for (const delegate of delegates) {
          try {
            landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                delegate,
              },
              runningMode: 'VIDEO',
              numHands: 1,
              minHandDetectionConfidence: 0.3,
              minTrackingConfidence: 0.3,
            })
            console.log('MediaPipe initialized with delegate: ' + delegate)
            break
          } catch (e) {
            console.warn('MediaPipe delegate ' + delegate + ' failed:', e)
          }
        }

        if (!landmarkerRef.current) {
          setStatus('error')
          console.error('MediaPipe: all delegates failed')
          return
        }

        setStatus('ready')
        if (mounted) detectLoop()
      } catch (err) {
        setStatus('error')
        console.error('Failed to initialize MediaPipe:', err)
      }
    }

    function detectLoop() {
      const video = videoRef.current
      if (!video || !landmarkerRef.current || !video.videoWidth || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detectLoop)
        return
      }

      try {
        const result = landmarkerRef.current.detectForVideo(video, performance.now())

        if (result.landmarks.length > 0) {
          const lm = result.landmarks[0]
          setLandmarks(lm)

          const detected = classifyGesture(lm, cooldownRef)
          if (detected) {
            setGesture(detected)
          }
        } else {
          setLandmarks(null)
        }
      } catch (e) {
        // frame skip
      }

      rafRef.current = requestAnimationFrame(detectLoop)
    }

    init()

    return () => {
      mounted = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      landmarkerRef.current?.close()
    }
  }, [videoRef])

  const clearGesture = useCallback(() => setGesture(null), [])

  return { gesture, landmarks, clearGesture, status }
}

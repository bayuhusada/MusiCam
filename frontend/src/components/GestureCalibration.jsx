import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Camera from './Camera'
import { useGesture, getFingerStates, matchGesture } from '../hooks/useGesture'

const STEPS = [
  { gesture: null, label: 'Pastikan tangan terlihat di kamera', icon: '👋' },
  { gesture: 'thumbs_up', label: 'Acungkan jempol 👍', icon: '👍' },
  { gesture: 'open_palm', label: 'Buka telapak tangan ✋', icon: '✋' },
  { gesture: 'peace', label: 'Peace / Victory ✌️', icon: '✌️' },
  { gesture: 'ily', label: 'Bentuk ILY/sayang 🤟', icon: '🤟' },
  { gesture: 'volume_up', label: 'Renggangkan jempol & telunjuk 🔊', icon: '🔊' },
  { gesture: 'volume_down', label: 'Rapatkan jempol & telunjuk 🔉', icon: '🔉' },
]

const REQUIRED_COUNT = 3
const CURL_TH = 1.2

const FINGER_ITEMS = [
  { key: 'indexCurl', label: 'Telunjuk' },
  { key: 'middleCurl', label: 'Tengah' },
  { key: 'ringCurl', label: 'Manis' },
  { key: 'pinkyCurl', label: 'Kelingking' },
]

const GESTURE_ICONS_MAP = {
  thumbs_up: '👍', open_palm: '✋', peace: '✌️',
  ily: '🤟', volume_up: '🔊', volume_down: '🔉',
}

function getGestureConditions(gesture, f) {
  switch (gesture) {
    case 'thumbs_up':
      return [
        { label: 'Jempol naik (ke atas)', pass: f.thumbExt && f.thumbUp, val: f.thumbUp ? '↑' : '↓' },
        { label: 'Telunjuk tekuk', pass: f.indexCurl < CURL_TH, val: f.indexCurl.toFixed(1) },
        { label: 'Tengah tekuk', pass: f.middleCurl < CURL_TH, val: f.middleCurl.toFixed(1) },
        { label: 'Manis tekuk', pass: f.ringCurl < CURL_TH, val: f.ringCurl.toFixed(1) },
        { label: 'Kelingking tekuk', pass: f.pinkyCurl < CURL_TH, val: f.pinkyCurl.toFixed(1) },
      ]
    case 'peace':
      return [
        { label: 'Telunjuk lurus', pass: f.indexCurl > CURL_TH, val: f.indexCurl.toFixed(1) },
        { label: 'Tengah lurus', pass: f.middleCurl > CURL_TH, val: f.middleCurl.toFixed(1) },
        { label: 'Manis tekuk', pass: f.ringCurl < CURL_TH, val: f.ringCurl.toFixed(1) },
        { label: 'Kelingking tekuk', pass: f.pinkyCurl < CURL_TH, val: f.pinkyCurl.toFixed(1) },
      ]
    case 'open_palm':
      return [
        { label: 'Jempol ke samping', pass: f.thumbSide },
        { label: 'Telunjuk lurus', pass: f.indexCurl > CURL_TH, val: f.indexCurl.toFixed(1) },
        { label: 'Tengah lurus', pass: f.middleCurl > CURL_TH, val: f.middleCurl.toFixed(1) },
        { label: 'Manis lurus', pass: f.ringCurl > CURL_TH, val: f.ringCurl.toFixed(1) },
        { label: 'Kelingking lurus', pass: f.pinkyCurl > CURL_TH, val: f.pinkyCurl.toFixed(1) },
      ]
    case 'ily':
      return [
        { label: 'Jempol ke samping', pass: f.thumbSide },
        { label: 'Telunjuk lurus', pass: f.indexCurl > CURL_TH, val: f.indexCurl.toFixed(1) },
        { label: 'Tengah tekuk', pass: f.middleCurl < CURL_TH, val: f.middleCurl.toFixed(1) },
        { label: 'Manis tekuk', pass: f.ringCurl < CURL_TH, val: f.ringCurl.toFixed(1) },
        { label: 'Kelingking lurus', pass: f.pinkyCurl > CURL_TH, val: f.pinkyCurl.toFixed(1) },
      ]
    case 'volume_up':
      return [
        { label: 'Jempol naik', pass: f.thumbExt },
        { label: 'Telunjuk lurus', pass: f.indexCurl > CURL_TH, val: f.indexCurl.toFixed(1) },
        { label: 'Tengah tekuk', pass: f.middleCurl < CURL_TH, val: f.middleCurl.toFixed(1) },
        { label: 'Manis tekuk', pass: f.ringCurl < CURL_TH, val: f.ringCurl.toFixed(1) },
        { label: 'Kelingking tekuk', pass: f.pinkyCurl < CURL_TH, val: f.pinkyCurl.toFixed(1) },
        { label: 'Jempol-Telp renggang', pass: f.thumbIndexDist > 0.12, val: f.thumbIndexDist.toFixed(2) },
      ]
    case 'volume_down':
      return [
        { label: 'Jempol naik', pass: f.thumbExt },
        { label: 'Telunjuk lurus', pass: f.indexCurl > CURL_TH, val: f.indexCurl.toFixed(1) },
        { label: 'Tengah tekuk', pass: f.middleCurl < CURL_TH, val: f.middleCurl.toFixed(1) },
        { label: 'Manis tekuk', pass: f.ringCurl < CURL_TH, val: f.ringCurl.toFixed(1) },
        { label: 'Kelingking tekuk', pass: f.pinkyCurl < CURL_TH, val: f.pinkyCurl.toFixed(1) },
        { label: 'Jempol-Telp rapat', pass: f.thumbIndexDist < 0.07, val: f.thumbIndexDist.toFixed(2) },
      ]
    default:
      return []
  }
}

export default function GestureCalibration({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [counts, setCounts] = useState({})
  const [lastGesture, setLastGesture] = useState(null)
  const videoRef = useRef(null)

  const { gesture, landmarks, clearGesture, status } = useGesture(videoRef)

  const f = landmarks ? getFingerStates(landmarks) : null
  const match = landmarks ? matchGesture(landmarks) : null
  const currentStepData = STEPS[currentStep]
  const conditions = f && currentStepData?.gesture ? getGestureConditions(currentStepData.gesture, f) : []

  useEffect(() => {
    if (!gesture) return
    setLastGesture(gesture)

    const step = STEPS[currentStep]
    if (!step?.gesture) return

    if (gesture.gesture === step.gesture) {
      const key = step.gesture
      const newCount = (counts[key] || 0) + 1
      setCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
      if (newCount >= REQUIRED_COUNT && currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }

    clearGesture()
  }, [gesture, currentStep, clearGesture, counts])

  useEffect(() => {
    if (currentStep === 0 && landmarks) {
      setCurrentStep(1)
    }
  }, [landmarks, currentStep])

  const gestureSteps = STEPS.filter(s => s.gesture)
  const allDone = gestureSteps.every(s => (counts[s.gesture] || 0) >= REQUIRED_COUNT)

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <Camera videoRef={videoRef} onLandmarks={landmarks} mirrored />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-8" style={{ pointerEvents: 'none' }}>
        <div className="flex flex-col items-center gap-3 px-6" style={{ pointerEvents: 'auto' }}>
          {/* Step header */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-md rounded-2xl p-6 max-w-md w-full text-center"
          >
            <span className="text-5xl block mb-2">{currentStepData?.icon}</span>
            <h2 className="text-white text-lg font-semibold">{currentStepData?.label}</h2>

            {currentStep > 0 && currentStepData?.gesture && (
              <div className="mt-3">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {Array.from({ length: REQUIRED_COUNT }, (_, i) => (
                    <span key={i} className={'w-2.5 h-2.5 rounded-full transition-colors ' + (i < (counts[currentStepData.gesture] || 0) ? 'bg-green-400' : 'bg-white/20')} />
                  ))}
                </div>
                <p className="text-white/40 text-xs">
                  {counts[currentStepData.gesture] || 0}/{REQUIRED_COUNT}
                </p>
              </div>
            )}

            {currentStep === 0 && (
              <p className="text-white/40 text-xs mt-2">
                {status === 'loading' ? 'Memuat MediaPipe...' :
                 status === 'error' ? 'Gagal memuat MediaPipe. Coba refresh.' :
                 landmarks ? '✓ Tangan terdeteksi!' : 'Angkat tangan ke kamera...'}
              </p>
            )}
          </motion.div>

          {/* Conditions checklist */}
          {conditions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-3 mt-1 w-full max-w-sm"
            >
              <div className="space-y-1">
                {conditions.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className={c.pass ? 'text-green-300' : 'text-red-300'}>
                      {c.pass ? '✓' : '✗'} {c.label}
                    </span>
                    {c.val && <span className="text-white/30 font-mono ml-2">{c.val}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Gesture match status */}
          {landmarks && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 flex gap-2 text-[11px]"
            >
              {Object.entries(match || {}).map(([key, val]) => (
                <span key={key} className={val ? 'text-green-400' : 'text-white/20'}>
                  {GESTURE_ICONS_MAP[key] || '?'} {val ? '✓' : '✗'}
                </span>
              ))}
            </motion.div>
          )}

          {/* Finger state bars */}
          {f && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-3 w-full max-w-sm"
            >
              <div className="flex gap-2 text-[10px] mb-2">
                <span className={'px-2 py-0.5 rounded-full ' + (f.thumbExt ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300')}>
                  Jempol {f.thumbExt ? '✓' : '✗'}
                </span>
                <span className={'px-2 py-0.5 rounded-full ' + (f.thumbSide ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300')}>
                  Samping {f.thumbSide ? '✓' : '✗'}
                </span>
                <span className={'px-2 py-0.5 rounded-full ' + (f.thumbUp ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300')}>
                  {f.thumbUp ? 'Atas ✓' : 'Bawah ✗'}
                </span>
              </div>

              <div className="space-y-1.5">
                {FINGER_ITEMS.map(({ key, label }) => {
                  const ratio = f[key]
                  const isExtended = ratio > CURL_TH
                  const pct = Math.min(ratio / 2 * 100, 100)
                  return (
                    <div key={key} className="flex items-center gap-2 text-[10px]">
                      <span className="text-white/50 w-14 text-right">{label}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative">
                        <div className={'h-full rounded-full transition-all ' + (isExtended ? 'bg-green-400/60' : 'bg-red-400/60')} style={{ width: pct + '%' }} />
                        <div className="absolute top-0 w-0.5 h-full bg-white/40" style={{ left: (CURL_TH / 2 * 100) + '%' }} />
                      </div>
                      <span className="text-white/40 w-7 font-mono">{ratio.toFixed(1)}</span>
                    </div>
                  )
                })}

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-white/50 w-14 text-right">Jempol-Telp</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative">
                    <div className={'h-full rounded-full transition-all ' + (
                      f.thumbIndexDist > 0.12 ? 'bg-green-400/60' :
                      f.thumbIndexDist < 0.07 ? 'bg-red-400/60' : 'bg-yellow-400/60'
                    )} style={{ width: Math.min(f.thumbIndexDist / 0.3 * 100, 100) + '%' }} />
                    <div className="absolute top-0 w-0.5 h-full bg-white/20" style={{ left: (0.07 / 0.3 * 100) + '%' }} />
                    <div className="absolute top-0 w-0.5 h-full bg-white/60" style={{ left: (0.12 / 0.3 * 100) + '%' }} />
                  </div>
                  <span className="text-white/40 w-7 font-mono">{f.thumbIndexDist.toFixed(2)}</span>
                </div>
              </div>

              {lastGesture && (
                <p className="text-white/20 text-[9px] mt-1.5 text-center font-mono">Last: {lastGesture.gesture}</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-2" style={{ pointerEvents: 'auto' }}>
          <div className="flex gap-1.5">
            {STEPS.map((step, i) => (
              <div key={i} className={'w-1.5 h-1.5 rounded-full transition-colors ' + (
                i < currentStep ? 'bg-green-400' : i === currentStep ? 'bg-white' : 'bg-white/20'
              )} />
            ))}
          </div>

          {allDone ? (
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-10 py-3 rounded-full text-base transition-all"
            >
              Start Music 🎵
            </motion.button>
          ) : (
            <button
              onClick={onComplete}
              className="text-white/30 hover:text-white/60 text-xs transition-colors underline underline-offset-2"
            >
              Skip to Music
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GESTURE_ICONS = {
  thumbs_up: '👍',
  open_palm: '✋',
  peace: '✌️',
  ily: '🤟',
  volume_up: '🔊',
  volume_down: '🔉',
}

const GESTURE_LABELS = {
  thumbs_up: 'Play',
  open_palm: 'Pause',
  peace: 'Next',
  ily: 'Previous',
  volume_up: 'Volume Up',
  volume_down: 'Volume Down',
}

export default function GestureOverlay({ gesture }) {
  const [show, setShow] = useState(false)
  const [currentGesture, setCurrentGesture] = useState(null)

  useEffect(() => {
    if (gesture) {
      setCurrentGesture(gesture)
      setShow(true)
      const timer = setTimeout(() => setShow(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [gesture])

  return (
    <AnimatePresence>
      {show && currentGesture && (
        <motion.div
          key={currentGesture + Date.now()}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.5, y: -40 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-7xl gesture-indicator">
            {GESTURE_ICONS[currentGesture]}
          </span>
          <span className="text-white/90 text-lg font-semibold tracking-wider uppercase bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
            {GESTURE_LABELS[currentGesture]}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

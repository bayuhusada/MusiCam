import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import Camera from '../components/Camera'
import GestureOverlay from '../components/GestureOverlay'
import MusicCard from '../components/MusicCard'
import MusicPlayer from '../components/MusicPlayer'
import { useGesture } from '../hooks/useGesture'
import { useWebSocket } from '../hooks/useWebSocket'

export default function Home({ songs, onEditPlaylist, onRecalibrate }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [cameraError, setCameraError] = useState(false)
  const prevVolumeRef = useRef(volume)

  const videoRef = useRef(null)

  const { sendGesture, on } = useWebSocket()
  const { gesture, landmarks, clearGesture, status: gestureStatus } = useGesture(videoRef)

  // Reset to first song if playlist changes
  useEffect(() => {
    setCurrentIndex(0)
    setIsPlaying(false)
  }, [songs])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % songs.length)
  }, [songs])

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + songs.length) % songs.length)
  }, [songs])

  const handleVolumeChange = useCallback((val) => {
    setVolume(val)
  }, [])

  // Listen for WebSocket commands
  useEffect(() => {
    const unsub = on('command', (data) => {
      switch (data.action) {
        case 'play':
          setIsPlaying(true)
          break
        case 'pause':
          setIsPlaying(false)
          break
        case 'next':
          handleNext()
          setIsPlaying(true)
          break
        case 'previous':
          handlePrev()
          setIsPlaying(true)
          break
      }
    })
    return unsub
  }, [on, handleNext, handlePrev])

  // Process detected gestures
  useEffect(() => {
    if (!gesture) return

    prevVolumeRef.current = volume
    sendGesture(gesture.gesture, gesture.handX, gesture.handY)
    clearGesture()

    switch (gesture.gesture) {
      case 'thumbs_up':
        setIsPlaying(true)
        break
      case 'open_palm':
        setIsPlaying(false)
        break
      case 'peace':
        handleNext()
        setIsPlaying(true)
        break
      case 'ily':
        handlePrev()
        setIsPlaying(true)
        break
      case 'volume_up':
        setVolume(prev => Math.min(1, +(prev + 0.1).toFixed(1)))
        break
      case 'volume_down':
        setVolume(prev => Math.max(0, +(prev - 0.1).toFixed(1)))
        break
    }
  }, [gesture, sendGesture, clearGesture, volume])

  if (!songs || songs.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <p className="text-white/40">No songs in playlist</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Camera Background */}
      <Camera
        videoRef={videoRef}
        onLandmarks={landmarks}
        onError={() => setCameraError(true)}
      />

      {/* Gesture Feedback Overlay */}
      <GestureOverlay gesture={gesture?.gesture} />

      {/* Camera Error State */}
      {cameraError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">Camera access denied</p>
            <p className="text-white/50 text-sm">Please allow camera access and refresh</p>
          </div>
        </div>
      )}

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-12">
        {/* Top Buttons */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          <button
            onClick={onEditPlaylist}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/60 hover:text-white
              text-xs px-4 py-2 rounded-full transition-all"
          >
            Edit Playlist
          </button>
          {onRecalibrate && (
            <button
              onClick={onRecalibrate}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/60 hover:text-white
                text-xs px-4 py-2 rounded-full transition-all"
            >
              Recalibrate
            </button>
          )}
        </div>

        {/* Song Cards - 3D Book */}
        <div className="relative h-96 mb-6" style={{ perspective: '1000px' }}>
          {songs.map((song, idx) => (
            <MusicCard
              key={song.id}
              song={song}
              index={idx}
              diff={idx - currentIndex}
            />
          ))}
        </div>

        {/* Music Player */}
        <MusicPlayer
          songs={songs}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          volume={volume}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          onVolumeChange={handleVolumeChange}
        />
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={'w-2 h-2 rounded-full animate-pulse ' + (cameraError ? 'bg-red-400' : 'bg-green-400')} />
          <span className="text-white/50 text-xs uppercase tracking-widest">
            {cameraError ? 'Camera Error' : 'Camera'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={'w-2 h-2 rounded-full ' + (
            gestureStatus === 'ready' ? 'bg-green-400 animate-pulse' :
            gestureStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
          )} />
          <span className="text-white/50 text-xs uppercase tracking-widest">
            {gestureStatus === 'ready' ? 'Gestures Ready' :
             gestureStatus === 'error' ? 'Gesture Error' : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Gesture Guide + Debug */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-sm rounded-xl p-3 text-xs text-white/60 space-y-1"
        >
          <p>👍 Play</p>
          <p>✋ Pause</p>
          <p>✌️ Next</p>
          <p>🤟 Previous</p>
          <p>🔊 Volume Up</p>
          <p>🔉 Volume Down</p>
        </motion.div>
        {gesture && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            key={gesture.gesture + Date.now()}
            className="bg-green-500/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs text-green-300 font-mono"
          >
            {gesture.gesture}
          </motion.div>
        )}
      </div>
    </div>
  )
}

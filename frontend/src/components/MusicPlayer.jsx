import { useEffect, useRef, useState, useCallback } from 'react'
import { Howl } from 'howler'
import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar'

export default function MusicPlayer({ songs, currentIndex, isPlaying, volume, onPlayPause, onNext, onPrev, onVolumeChange }) {
  const howlRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seek, setSeek] = useState(0)

  const [loadError, setLoadError] = useState(null)

  const currentSong = songs[currentIndex]

  // Create/destroy Howl instance when song changes
  useEffect(() => {
    if (!currentSong) return

    setLoadError(null)
    setProgress(0)
    setSeek(0)
    setDuration(0)

    const src = currentSong.audioUrl || currentSong.audio

    const howl = new Howl({
      src: [src],
      format: ['m4a', 'webm', 'mp3', 'aac'],
      html5: true,
      volume: volume,
      onload: () => {
        setDuration(howl.duration())
      },
      onplay: () => {
        setDuration(howl.duration())
      },
      onend: () => {
        onNext()
      },
      onloaderror: (_id, err) => {
        console.error('Failed to load audio:', err)
        setLoadError('Audio failed to load. URL may have expired.')
      },
    })

    howlRef.current = howl

    if (isPlaying) {
      howl.play()
    }

    return () => {
      howl.unload()
      howlRef.current = null
    }
  }, [currentIndex])

  // Handle play/pause
  useEffect(() => {
    const howl = howlRef.current
    if (!howl) return

    if (isPlaying) {
      howl.play()
    } else {
      howl.pause()
    }
  }, [isPlaying])

  // Handle volume changes
  useEffect(() => {
    howlRef.current?.volume(volume)
  }, [volume])

  // Progress tracking
  useEffect(() => {
    if (!howlRef.current || !isPlaying) return

    const interval = setInterval(() => {
      const howl = howlRef.current
      if (howl && howl.playing()) {
        const s = howl.seek()
        const d = howl.duration()
        setSeek(s)
        setProgress(d > 0 ? s / d : 0)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [isPlaying, currentIndex])

  const formatTime = useCallback((t) => {
    if (!t || isNaN(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  if (!currentSong) {
    return (
      <div className="text-center text-white/40 py-8">
        No songs available
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-red-400 text-sm mb-2">{loadError}</p>
        <p className="text-white/40 text-xs">Try re-adding this song or skip to the next one</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-2xl mx-auto px-6"
    >
      {/* Song Info */}
      <div className="text-center mb-4">
        <motion.p
          key={currentSong.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-xl font-bold truncate"
        >
          {currentSong.title}
        </motion.p>
        <p className="text-white/50 text-sm mt-0.5">
          {currentSong.artist}
        </p>
      </div>

      {/* Progress */}
      <ProgressBar progress={progress} />
      <div className="flex justify-between text-white/40 text-xs mt-1.5 mb-4">
        <span>{formatTime(seek)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={onPrev}
          className="text-white/70 hover:text-white transition-colors p-2"
          title="Previous"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={onPlayPause}
          className="bg-green-400 hover:bg-green-300 text-black rounded-full p-4 transition-all hover:scale-105 active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={onNext}
          className="text-white/70 hover:text-white transition-colors p-2"
          title="Next"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-32 h-1 appearance-none bg-white/20 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400"
        />
        <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM16 3v18c3.64-.71 6.5-3.66 6.5-7.5S19.64 3.71 16 3z" />
        </svg>
      </div>
    </motion.div>
  )
}

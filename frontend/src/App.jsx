import { useState } from 'react'
import PlaylistSetup from './components/PlaylistSetup'
import GestureCalibration from './components/GestureCalibration'
import Home from './pages/Home'

const STORAGE_KEY = 'gesture-music-playlist'

export default function App() {
  const [step, setStep] = useState('calibrate')
  const [songs, setSongs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const handleCalibrationDone = () => {
    if (songs && songs.length > 0) {
      setStep('play')
    } else {
      setStep('setup')
    }
  }

  const handlePlaylistReady = (resolvedSongs) => {
    const songsWithId = resolvedSongs.map((s, i) => ({ ...s, id: i + 1 }))
    setSongs(songsWithId)
    try {
      const toStore = songsWithId.map(({ audioUrl, ...rest }) => rest)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch {
      // localStorage full or unavailable
    }
    setStep('play')
  }

  const handleEditPlaylist = () => {
    setStep('setup')
  }

  if (step === 'calibrate') {
    return <GestureCalibration onComplete={handleCalibrationDone} />
  }

  if (step === 'setup') {
    return (
      <PlaylistSetup
        onReady={handlePlaylistReady}
        existingUrls={songs?.map(s => s.youtubeUrl) || []}
      />
    )
  }

  return <Home songs={songs} onEditPlaylist={handleEditPlaylist} onRecalibrate={() => setStep('calibrate')} />
}

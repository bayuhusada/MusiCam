import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i
const PLAYLIST_REGEX = /[?&]list=/i

export default function PlaylistSetup({ onReady, existingUrls }) {
  const [input, setInput] = useState(existingUrls?.join('\n') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)

  const urls = input
    .split('\n')
    .map(u => u.trim())
    .filter(u => u.length > 0)

  const validUrls = urls.filter(u => YT_REGEX.test(u))
  const invalidUrls = urls.filter(u => !YT_REGEX.test(u))

  const handleLoad = async () => {
    if (validUrls.length === 0) return

    setLoading(true)
    setError(null)
    setPreview(null)

    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to resolve')
      }

      const data = await res.json()
      if (data.songs?.length === 0) {
        throw new Error('No songs could be resolved')
      }

      onReady(data.songs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleLoad()
    }
  }

  const hasPlaylistUrl = validUrls.some(u => PLAYLIST_REGEX.test(u))

  const isValidInput = validUrls.length > 0

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            Gesture Music Player
          </motion.h1>
          <p className="text-white/40 mt-2 text-sm">
            Paste YouTube links to build your playlist
          </p>
        </div>

        {/* Input */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <label className="block text-white/60 text-xs uppercase tracking-widest mb-3">
            YouTube URLs (one per line)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://youtube.com/watch?v=... or paste a playlist URL"
            rows={6}
            className="w-full bg-white/5 text-white rounded-xl p-4 text-sm resize-none
              border border-white/10 focus:border-green-400/50 outline-none
              placeholder-white/20 transition-colors"
          />

          {/* Validation feedback */}
          <AnimatePresence>
            {invalidUrls.length > 0 && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs mt-2"
              >
                {invalidUrls.length} invalid URL{invalidUrls.length > 1 ? 's' : ''} ignored
              </motion.p>
            )}
          </AnimatePresence>

          {/* Preview */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-1"
              >
                <p className="text-white/40 text-xs uppercase tracking-widest">Preview</p>
                {preview.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                    <img src={s.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                    <span className="truncate">{s.title}</span>
                    <span className="text-white/40 truncate">{s.artist}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 mt-4 text-white/60 text-sm">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {hasPlaylistUrl ? 'Extracting playlist...' : `Resolving ${validUrls.length} URL${validUrls.length > 1 ? 's' : ''}...`}
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <p className="text-red-400 text-xs">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load Button */}
          <motion.button
            whileHover={isValidInput ? { scale: 1.02 } : {}}
            whileTap={isValidInput ? { scale: 0.98 } : {}}
            onClick={handleLoad}
            disabled={!isValidInput || loading}
            className={`
              w-full mt-4 py-3 rounded-xl font-semibold text-sm tracking-wider
              transition-all duration-200
              ${isValidInput && !loading
                ? 'bg-green-500 hover:bg-green-400 text-black'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
              }
            `}
          >
            {loading ? 'Loading...' : existingUrls?.length ? 'Update Playlist' : 'Load Playlist'}
          </motion.button>
        </div>

        {/* Tips */}
        <div className="mt-6 text-center text-white/20 text-xs space-y-1">
          <p>Ctrl+Enter to load &bull; Supports single videos and playlists</p>
          <p>Hold your hand up to the camera and use gestures to control music</p>
        </div>
      </motion.div>
    </div>
  )
}

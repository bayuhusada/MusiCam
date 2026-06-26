import { motion } from 'framer-motion'

const X_MAP = { '-2': -300, '-1': -150, '0': 0, '1': 150, '2': 300 }
const SCALE_MAP = { '-2': 0.55, '-1': 0.85, '0': 1.1, '1': 0.85, '2': 0.55 }
const ROTATE_MAP = { '-2': 35, '-1': 20, '0': 0, '1': -20, '2': -35 }
const OPACITY_MAP = { '-2': 0.15, '-1': 0.6, '0': 1, '1': 0.6, '2': 0.15 }
const Z_MAP = { '-2': 0, '-1': 5, '0': 20, '1': 5, '2': 0 }

export default function MusicCard({ song, diff }) {
  const isActive = diff === 0
  const isHidden = Math.abs(diff) > 2

  if (isHidden) return null

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-64"
      style={{
        marginLeft: -128,
        marginTop: -128,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
      animate={{
        x: X_MAP[diff],
        y: '-50%',
        scale: SCALE_MAP[diff],
        rotateY: ROTATE_MAP[diff],
        opacity: OPACITY_MAP[diff],
        zIndex: Z_MAP[diff],
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        className={'relative aspect-square rounded-2xl overflow-hidden transition-all ' + (isActive ? 'ring-2 ring-green-400 shadow-xl shadow-green-400/20' : '')}
      >
        <img
          src={song.thumbnail || song.cover}
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isActive && (
          <div className="absolute inset-0 border-2 border-green-400/50 rounded-2xl" />
        )}
      </div>
      <div className="p-3 bg-black/70 backdrop-blur-md rounded-b-2xl">
        <p className="text-white font-semibold text-sm truncate">
          {song.title}
        </p>
        <p className="text-white/50 text-xs truncate mt-0.5">
          {song.artist}
        </p>
      </div>
    </motion.div>
  )
}

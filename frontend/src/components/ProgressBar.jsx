import { motion } from 'framer-motion'

export default function ProgressBar({ progress = 0 }) {
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full"
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
        transition={{ duration: 0.2, ease: 'linear' }}
      />
    </div>
  )
}

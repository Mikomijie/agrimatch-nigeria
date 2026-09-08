import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <p className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)] mb-6">
          AgriMatch
        </p>
        <h1 className="font-[var(--font-heading)] text-8xl font-bold text-[var(--color-charcoal)]/10 mb-4">
          404
        </h1>
        <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)] mb-3">
          Page not found
        </h2>
        <p className="text-[var(--color-charcoal)]/60 text-sm mb-8">
          This page doesn't exist or was moved. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/"
            className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-bold hover:brightness-95 transition-all"
          >
            Go Home
          </Link>
          <Link
            to="/marketplace"
            className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-lg font-bold hover:bg-[var(--color-primary)]/5 transition-all"
          >
            Browse Marketplace
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
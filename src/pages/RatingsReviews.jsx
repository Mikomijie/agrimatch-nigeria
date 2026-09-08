import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

function Stars({ count }) {
  return (
    <span className="text-sm">
      <span className="text-[var(--color-secondary)]">{'★'.repeat(count)}</span>
      <span className="text-black/20">{'★'.repeat(5 - count)}</span>
    </span>
  )
}

function RatingsReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from('ratings')
        .select('*, buyer:buyer_id(full_name), farmer:farmer_id(full_name)')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setReviews(data || [])
      }
      setLoading(false)
    }
    fetchReviews()
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      <header className="bg-[var(--color-primary-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
              AgriMatch
            </Link>
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <button
                onClick={() => window.history.back()}
                className="text-white/80 hover:text-white transition-colors font-semibold"
              >
                ← Back
              </button>
              <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-white text-white">Reviews</span>
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>
            <Link
              to="/auth"
              className="text-xs sm:text-sm font-semibold text-white border-2 border-white/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap hover:border-white/80 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        <motion.div
          className="mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-3 sm:mb-4">
            Reputation & <span className="italic text-[var(--color-primary)]">Community</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md">
            Transparency drives the AgriMatch ecosystem. Honest feedback from our network of farmers and buyers.
          </p>
        </motion.div>

        {loading && <p className="mt-12 text-center text-[var(--color-charcoal)]/60">Loading reviews...</p>}
        {error && <p className="mt-12 text-center text-red-600">Error: {error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-[var(--color-charcoal)]/60 mb-2">No reviews yet.</p>
            <p className="text-sm text-[var(--color-charcoal)]/40">Reviews appear after buyers confirm delivery.</p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white border border-black/10 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {review.buyer?.full_name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-[var(--color-charcoal)] text-base sm:text-lg">
                          {review.buyer?.full_name}
                        </p>
                        <p className="text-xs text-[var(--color-charcoal)]/60 mt-0.5">
                          reviewed <span className="font-semibold">{review.farmer?.full_name}</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Stars count={review.stars} />
                      </div>
                    </div>

                    {review.review && (
                      <p className="text-sm text-[var(--color-charcoal)]/70 leading-relaxed">
                        {review.review}
                      </p>
                    )}

                    <p className="text-xs text-[var(--color-charcoal)]/40 mt-3">
                      {new Date(review.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-[var(--color-charcoal)]/60 mt-12 sm:mt-16">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Benin City, Edo State.</p>
      </footer>
    </div>
  )
}

export default RatingsReviews
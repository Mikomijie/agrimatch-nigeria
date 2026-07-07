import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

function Stars({ count }) {
  return (
    <span className="text-[var(--color-secondary)] text-sm">
      {'★'.repeat(count)}
      <span className="text-gray-300">{'★'.repeat(5 - count)}</span>
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
        .from('reviews')
        .select('*, reviewer:reviewer_id(name), reviewed:reviewed_id(name, role)')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setReviews(data)
      }
      setLoading(false)
    }

    fetchReviews()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/logistics">Logistics</Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">
          Reputation & Community Insights
        </h1>
        <p className="mt-2 text-gray-600 text-sm max-w-md">
          Transparency drives the AgriMatch ecosystem. Honest feedback from our network of
          farmers, buyers, and logistics partners.
        </p>

        {loading && <p className="mt-12 text-center text-gray-500">Loading reviews...</p>}
        {error && <p className="mt-12 text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="mt-8 space-y-8">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex gap-4 pb-8 border-b border-gray-100 last:border-0"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center font-[var(--font-heading)] text-[var(--color-primary-dark)] flex-shrink-0">
                  {review.reviewer?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{review.reviewer?.name}</p>
                      <p className="text-xs text-gray-500">
                        reviewed {review.reviewed?.name} ({review.reviewed?.role})
                      </p>
                    </div>
                    <Stars count={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <p className="mt-12 text-center text-gray-500">No reviews yet.</p>
        )}
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default RatingsReviews
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'

const REVIEWS = [
  {
    id: 1,
    name: 'Kwame Mensah',
    role: 'Plantain Producer · Techiman Hub',
    rating: 5,
    text: 'The transparency of the logistics partner was exceptional. My harvest reached the Accra market three hours ahead of schedule, and the moisture control in the vehicle was perfect.',
    date: 'October 14, 2026',
    helpful: 12,
    type: 'Farmers',
  },
  {
    id: 2,
    name: 'Abena Osei',
    role: 'Bulk Buyer · Organic Retailers Group',
    rating: 4,
    text: 'Consistent quality from this farm. Every crate of mangoes was uniformly ripened and arrived without bruising. A minor delay in documentation was the only small hiccup.',
    date: 'September 28, 2026',
    helpful: 8,
    type: 'Buyers',
  },
  {
    id: 3,
    name: 'Kofi Badu',
    role: 'Logistics Provider · Techiman Express',
    rating: 5,
    text: 'The buyer was ready at the offloading bay exactly as scheduled. Payment was released instantly via the AgriMatch escrow system the moment delivery was confirmed.',
    date: 'August 12, 2026',
    helpful: 24,
    type: 'Transporters',
  },
]

const FILTERS = ['All Reviews', 'Farmers', 'Buyers', 'Transporters']

function Stars({ count }) {
  return (
    <span className="text-[var(--color-secondary)] text-sm">
      {'★'.repeat(count)}
      <span className="text-gray-300">{'★'.repeat(5 - count)}</span>
    </span>
  )
}

function RatingsReviews() {
  const [filter, setFilter] = useState('All Reviews')

  const filtered = REVIEWS.filter((r) => filter === 'All Reviews' || r.type === filter)

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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">
              Reputation & Community Insights
            </h1>
            <p className="mt-2 text-gray-600 text-sm max-w-md">
              Transparency drives the AgriMatch ecosystem. We curate honest feedback from our
              network of farmers, buyers, and logistics partners.
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="flex items-center gap-2 text-xs text-gray-500 md:justify-end">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              VERIFIED IDENTITY
            </p>
            <p className="font-[var(--font-heading)] text-lg mt-1">4.9 / 5.0 Global Rating</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                filter === f
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-8">
          {filtered.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex gap-4 pb-8 border-b border-gray-100 last:border-0"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center font-[var(--font-heading)] text-[var(--color-primary-dark)] flex-shrink-0">
                {review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.role}</p>
                  </div>
                  <Stars count={review.rating} />
                </div>
                <p className="text-sm text-gray-600 mt-2">{review.text}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{review.date}</span>
                  <span>👍 Helpful ({review.helpful})</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-12">No reviews in this category yet.</p>
        )}

        <div className="text-center mt-8">
          <button className="border border-gray-300 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Load More Reviews
          </button>
        </div>
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default RatingsReviews
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { notify } from '../lib/notifications'

const MAX_CHARS = 500

function ReviewModal({ order, buyer, farmerName, onClose, onSuccess }) {
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [hoveredStar, setHoveredStar] = useState(0)

  const charsLeft = MAX_CHARS - review.length
  const charsUsed = review.length

  const getStarLabel = (count) => {
    switch (count) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Select a rating'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (stars === 0) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError(null)

    const { data: orderData } = await supabase
      .from('orders')
      .select('farmer_id')
      .eq('id', order.id)
      .single()

    const farmer_id = orderData?.farmer_id

    if (!farmer_id) {
      setError('Could not find farmer information')
      setSubmitting(false)
      return
    }

    const { error: reviewError } = await supabase.from('ratings').insert({
      order_id: order.id,
      buyer_id: buyer.id,
      farmer_id: farmer_id,
      stars: stars,
      review: review.trim() || null,
    })

    setSubmitting(false)

    if (reviewError) {
      notify.error('Failed to submit review')
      setError(reviewError.message)
    } else {
      notify.success('Review submitted! Thank you.')
      onSuccess()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)]">
              Rate Your Experience
            </h2>
            <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">
              How was your experience with <span className="font-semibold">{farmerName}</span>?
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-charcoal)]/40 hover:text-[var(--color-charcoal)] transition-colors ml-4 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="text-xs font-semibold text-[var(--color-charcoal)]/50 uppercase tracking-wide">
              Rating
            </label>
            <div className="mt-3 flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-4xl transition-all focus:outline-none"
                >
                  <span className={
                    (hoveredStar || stars) >= star
                      ? 'text-yellow-400'
                      : 'text-black/10'
                  }>
                    ★
                  </span>
                </motion.button>
              ))}
            </div>
            <motion.p
              key={hoveredStar || stars}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm font-semibold mt-2 ${
                (hoveredStar || stars) > 0
                  ? 'text-[var(--color-secondary-dark)]'
                  : 'text-[var(--color-charcoal)]/40'
              }`}
            >
              {getStarLabel(hoveredStar || stars)}
            </motion.p>
          </div>

          {/* Review Text with character counter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[var(--color-charcoal)]/50 uppercase tracking-wide">
                Comment <span className="font-normal normal-case">(Optional)</span>
              </label>
              <span className={`text-xs font-medium ${
                charsLeft < 50
                  ? 'text-red-500'
                  : charsLeft < 100
                  ? 'text-[var(--color-secondary-dark)]'
                  : 'text-[var(--color-charcoal)]/40'
              }`}>
                {charsUsed}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              value={review}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setReview(e.target.value)
                }
              }}
              placeholder="Share your experience — quality of produce, communication, delivery speed..."
              className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-none h-24"
            />
            {/* Character progress bar */}
            <div className="mt-1.5 h-1 bg-black/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-colors ${
                  charsLeft < 50
                    ? 'bg-red-500'
                    : charsLeft < 100
                    ? 'bg-[var(--color-secondary)]'
                    : 'bg-[var(--color-primary)]'
                }`}
                animate={{ width: `${(charsUsed / MAX_CHARS) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-black/10 text-[var(--color-charcoal)]/70 py-3 rounded-lg font-semibold hover:bg-black/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || stars === 0}
              className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default ReviewModal
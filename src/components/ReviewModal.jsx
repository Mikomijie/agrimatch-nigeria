import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { notify } from '../lib/notifications'

function ReviewModal({ order, buyer, farmerName, onClose, onSuccess }) {
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

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
      review: review || null,
    })

    setSubmitting(false)

    if (reviewError) {
      notify.error('Failed to submit review')
      setError(reviewError.message)
    } else {
      notify.success('Review submitted! Thank you!')
      onSuccess()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-6 max-w-md w-full"
      >
        <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)]">
          Rate Your Experience
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          How was your experience with {farmerName}?
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Rating</label>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  className={`text-4xl transition-all ${
                    stars >= star ? 'text-yellow-400' : 'text-gray-300'
                  } hover:scale-110`}
                >
                  ★
                </button>
              ))}
            </div>
            {stars > 0 && (
              <p className="mt-2 text-sm text-gray-600">{stars} out of 5 stars</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Comment (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your feedback..."
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/40 transition-all resize-none h-20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#1B5E20] text-white py-2 rounded-md font-medium hover:brightness-95 transition-all disabled:opacity-60"
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
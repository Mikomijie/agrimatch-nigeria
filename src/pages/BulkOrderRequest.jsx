import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrentUser } from '../lib/useCurrentUser'
import { findFulfillment, createPooledOrder } from '../lib/pooling'
import { notify } from '../lib/notifications'
import { supabase } from '../lib/supabaseClient'

const CROP_TYPES = ['Tomatoes', 'Peppers', 'Garden Eggs', 'Okra']

function BulkOrderRequest() {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [cropType, setCropType] = useState('Tomatoes')
  const [quantity, setQuantity] = useState('')
  const [deadline, setDeadline] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setSearching(true)

    const res = await findFulfillment(cropType, Number(quantity), deadline)

    setSearching(false)

    if (res.error) {
      setError(res.error)
    } else if (res.fulfillment.length === 0) {
      setError('No farmers currently have this crop available. Try a different crop or check back soon.')
    } else {
      setResult(res)
    }
  }

  const handleConfirm = async () => {
    if (!result || !user) return
    setConfirming(true)

    const { error: confirmError, orders } = await createPooledOrder(
      user.id,
      cropType,
      Number(quantity),
      deadline,
      result.fulfillment
    )

    setConfirming(false)

    if (confirmError) {
      notify.error('Failed to create pooled order')
      setError(confirmError)
    } else {
      notify.success(`Pooled order created! ${orders.length} farmer(s) will fulfill your request.`)
      navigate('/buyer-orders')
    }
  }

  if (userLoading) return (
    <div className="p-10 text-center text-gray-500">Loading...</div>
  )

  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Please log in to place a bulk order.</p>
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block font-semibold">
        Go to Login
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      <header className="bg-[var(--color-primary-dark)] sticky top-0 z-50 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
              AgriMatch
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium flex-1 justify-center">
              <button
                onClick={() => navigate('/marketplace')}
                className="text-white/80 hover:text-white transition-colors font-semibold"
              >
                ← Back
              </button>
              <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-white text-white">Bulk Order</span>
            </nav>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-white/60 hidden sm:inline">{user?.full_name}</span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-xs font-semibold text-white border-2 border-white/40 px-3 py-1.5 rounded-lg hover:border-white/80 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16">
        <div className="mb-10">
          <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl md:text-6xl text-[var(--color-charcoal)] mb-4">
            Bulk Order <span className="italic text-[var(--color-primary)]">Request</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-xl">
            Need more than one farmer can supply? Tell us what you need and we'll automatically pool it across multiple verified farmers.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-3">
                Crop Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CROP_TYPES.map((crop) => (
                  <button
                    type="button"
                    key={crop}
                    onClick={() => setCropType(crop)}
                    className={`py-2.5 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                      cropType === crop
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'border-gray-200 text-[var(--color-charcoal)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-3">
                  Total Quantity Needed (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-3">
                  Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={searching || !quantity}
              className="w-full bg-[var(--color-primary)] text-white py-3 px-6 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
            >
              {searching ? 'Searching farmers...' : 'Find Available Farmers'}
            </button>
          </form>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 sm:p-8"
          >
            <div className="mb-6">
              <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)] mb-2">
                Fulfillment Plan
              </h2>
              {result.fullyFulfilled ? (
                <p className="text-sm text-[var(--color-primary)] font-semibold">
                  ✓ Your full order of {quantity}kg can be fulfilled across {result.fulfillment.length} farmer(s).
                </p>
              ) : (
                <p className="text-sm text-orange-600 font-semibold">
                  ⚠ We can only fulfill {result.totalAllocated}kg of your {quantity}kg request right now. {result.shortfall}kg shortfall.
                </p>
              )}
            </div>

            <div className="space-y-3 mb-8">
              {result.fulfillment.map((item, i) => (
                <div key={item.listing.id} className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-charcoal)]">
                        {item.listing.profiles?.full_name}
                      </p>
                      <p className="text-xs text-[var(--color-charcoal)]/60">
                        {item.listing.location} · ₦{Number(item.listing.price_per_unit).toLocaleString()}/kg
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-charcoal)]">{item.quantityAllocated}kg</p>
                    <p className="text-xs text-[var(--color-charcoal)]/60">
                      ₦{(item.quantityAllocated * item.listing.price_per_unit).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6 flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-1">Total Cost</p>
                <p className="font-[var(--font-heading)] text-3xl text-[var(--color-primary)]">
                  ₦{result.fulfillment.reduce((sum, item) => sum + (item.quantityAllocated * item.listing.price_per_unit), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-1">Total Quantity</p>
                <p className="font-[var(--font-heading)] text-3xl text-[var(--color-charcoal)]">
                  {result.totalAllocated}kg
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-[var(--color-primary)] text-white py-3 px-6 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
            >
              {confirming ? 'Creating orders...' : `Confirm Pooled Order — ${result.fulfillment.length} Farmer(s)`}
            </button>
          </motion.div>
        )}
      </main>

      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 text-center text-sm text-[var(--color-charcoal)]/60 mt-12">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Jos Regional Hub, Plateau State.</p>
      </footer>
    </div>
  )
}

export default BulkOrderRequest
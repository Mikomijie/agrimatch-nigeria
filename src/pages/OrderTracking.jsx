import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { notify } from '../lib/notifications'
import ReviewModal from '../components/ReviewModal'

const STATUS_STEPS = ['pending', 'confirmed', 'in_transit', 'delivered']

const STATUS_LABELS = {
  pending: 'Order Confirmed',
  confirmed: 'Harvest & Inspection',
  in_transit: 'Departed Hub',
  delivered: 'Arriving at Destination',
}

const STATUS_COLORS = {
  pending: 'text-[var(--color-secondary-dark)]',
  confirmed: 'text-[var(--color-secondary-dark)]',
  in_transit: 'text-[var(--color-secondary)]',
  delivered: 'text-[var(--color-primary)]',
  completed: 'text-[var(--color-primary)]',
}

const STATUS_DOT = {
  pending: 'bg-[var(--color-secondary-dark)] animate-pulse',
  confirmed: 'bg-[var(--color-secondary-dark)] animate-pulse',
  in_transit: 'bg-[var(--color-secondary)] animate-pulse',
  delivered: 'bg-[var(--color-primary)]',
  completed: 'bg-[var(--color-primary)]',
}

const STATUS_BG = {
  pending: 'bg-[var(--color-secondary-dark)]',
  confirmed: 'bg-[var(--color-secondary)]',
  in_transit: 'bg-blue-500',
  delivered: 'bg-[var(--color-primary)]',
  completed: 'bg-[var(--color-primary)]',
}

function OrderTracking() {
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [transporter, setTransporter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchOrder = async () => {
    if (!orderId) return

    const { data, error } = await supabase
      .from('orders')
      .select('*, listings(crop_type, location, quantity, price_per_unit, image_url, profiles(full_name))')
      .eq('id', orderId)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setOrder(data)

    if (data.transporter_id) {
      const { data: tData } = await supabase
        .from('transporters')
        .select('vehicle_type, capacity_kg, is_verified_agent, profiles(full_name)')
        .eq('user_id', data.transporter_id)
        .maybeSingle()
      setTransporter(tData)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOrder()

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        () => fetchOrder()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [orderId])

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading order...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-red-500">Error: {error}</p>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-charcoal)]/60 mb-4">Order not found.</p>
        <Link to="/buyer-orders" className="text-[var(--color-primary)] underline font-semibold">Back to orders →</Link>
      </div>
    </div>
  )

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)
  const progressPercent = Math.round(((currentStepIndex + 1) / STATUS_STEPS.length) * 100)

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">

      {/* Sticky status bar — appears when user scrolls down */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: scrolled ? 0 : -60, opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-black/10 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[order.status] || 'bg-gray-400'}`} />
            <span className="text-sm font-bold text-[var(--color-charcoal)] capitalize">{order.status.replace('_', ' ')}</span>
            <span className="text-xs text-[var(--color-charcoal)]/50">·</span>
            <span className="text-xs text-[var(--color-charcoal)]/60">{order.listings?.crop_type} · {order.quantity}kg</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-24 h-1.5 bg-black/10 rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full rounded-full transition-all duration-500 ${STATUS_BG[order.status] || 'bg-gray-400'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[var(--color-charcoal)]/60">{progressPercent}%</span>
          </div>
        </div>
      </motion.div>

      <header className="bg-[var(--color-primary-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
              AgriMatch
            </Link>
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <Link to="/buyer-orders" className="text-white/80 hover:text-white transition-colors font-semibold">
                ← Back to Orders
              </Link>
              <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-white text-white">Tracking</span>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="text-xs sm:text-sm text-white/60 hidden sm:inline">{user?.full_name}</span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-xs sm:text-sm font-semibold text-white hover:text-white/80 transition-colors border-2 border-white/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-3">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-2">
                Tracking your <span className="italic text-[var(--color-primary)]">harvest.</span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-lg">
                {order.quantity}kg {order.listings?.crop_type} from {order.listings?.profiles?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[order.status] || 'bg-gray-400'}`} />
              <span className={`text-sm font-bold uppercase ${STATUS_COLORS[order.status] || 'text-[var(--color-charcoal)]/60'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${STATUS_BG[order.status] || 'bg-gray-400'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-[var(--color-charcoal)]/50 mt-2">{progressPercent}% complete</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {/* Status Timeline */}
          <div className="md:col-span-2 space-y-6 relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-black/10" />
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStepIndex
              const active = i === currentStepIndex
              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative flex gap-4"
                >
                  <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white ${
                    done
                      ? 'bg-[var(--color-primary)]'
                      : active
                      ? 'bg-[var(--color-secondary)] animate-pulse'
                      : 'bg-black/10 text-[var(--color-charcoal)]/30'
                  }`}>
                    {done ? '✓' : active ? '→' : ''}
                  </div>
                  <div className={`pt-1 ${done || active ? '' : 'opacity-40'}`}>
                    <p className="font-bold text-lg text-[var(--color-charcoal)]">{STATUS_LABELS[step]}</p>
                    {active && (
                      <p className="text-sm text-[var(--color-charcoal)]/60 mt-1">Currently in progress</p>
                    )}
                    {done && (
                      <p className="text-sm text-[var(--color-primary)] mt-1">Completed ✓</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Order Details Card */}
          <motion.div
            className="bg-white border border-black/10 rounded-lg sm:rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-6">Shipment Details</h2>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-1">Farmer</p>
                <p className="font-bold text-lg text-[var(--color-charcoal)]">{order.listings?.profiles?.full_name}</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-1">Quantity</p>
                <p className="font-bold text-lg text-[var(--color-charcoal)]">{order.quantity} kg</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-1">Pickup Location</p>
                <p className="font-bold text-lg text-[var(--color-charcoal)]">{order.listings?.location}</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-1">Total Paid</p>
                <p className="font-[var(--font-heading)] text-2xl text-[var(--color-primary)]">₦{Number(order.total_price).toLocaleString()}</p>
              </div>

              {transporter && (
                <div className="pt-4 border-t border-black/10">
                  <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Transporter</p>
                  <p className="font-bold text-[var(--color-charcoal)]">{transporter.profiles?.full_name}</p>
                  <p className="text-sm text-[var(--color-charcoal)]/60">{transporter.vehicle_type}</p>
                  {transporter.is_verified_agent && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-white bg-[var(--color-primary)] px-2 py-0.5 rounded">
                      CERTIFIED AGENT
                    </span>
                  )}
                </div>
              )}

              {(order.pickup_photo_url || order.delivery_photo_url) && (
                <div className="pt-4 border-t border-black/10">
                  <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-3">Verification Photos</p>
                  <div className="flex gap-2">
                    {order.pickup_photo_url && (
                      <div>
                        <p className="text-xs text-[var(--color-charcoal)]/50 mb-1">Pickup</p>
                        <a href={order.pickup_photo_url} target="_blank" rel="noopener noreferrer">
                          <img loading="lazy" src={order.pickup_photo_url} alt="Pickup" className="w-20 h-20 rounded-lg object-cover border border-black/10 hover:opacity-90 transition-opacity" />
                        </a>
                      </div>
                    )}
                    {order.delivery_photo_url && (
                      <div>
                        <p className="text-xs text-[var(--color-charcoal)]/50 mb-1">Delivery</p>
                        <a href={order.delivery_photo_url} target="_blank" rel="noopener noreferrer">
                          <img loading="lazy" src={order.delivery_photo_url} alt="Delivery" className="w-20 h-20 rounded-lg object-cover border border-black/10 hover:opacity-90 transition-opacity" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-black/10">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    loading="lazy"
                    src={order.listings?.image_url}
                    alt={order.listings?.crop_type}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-bold text-[var(--color-charcoal)]">{order.listings?.crop_type}</p>
                    <p className="text-xs text-[var(--color-charcoal)]/60 capitalize">Status: {order.status.replace('_', ' ')}</p>
                  </div>
                </div>

                {order.status === 'delivered' && (
                  <button
                    onClick={async () => {
                      await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id)
                      notify.success('Delivery confirmed!')
                      setShowReviewModal(true)
                    }}
                    className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 transition-all"
                  >
                    ✓ Confirm Delivery Received
                  </button>
                )}

                {order.status === 'completed' && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] py-3 rounded-lg font-bold hover:bg-[var(--color-primary)]/5 transition-all"
                  >
                    Leave a Review
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {showReviewModal && (
        <ReviewModal
          order={order}
          buyer={user}
          farmerName={order.listings?.profiles?.full_name}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false)
            notify.success('Review submitted! Thank you.')
            fetchOrder()
          }}
        />
      )}

      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-[var(--color-charcoal)]/60 mt-12 sm:mt-16">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Benin City, Edo State.</p>
      </footer>
    </div>
  )
}

export default OrderTracking
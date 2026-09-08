import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import ReviewModal from '../components/ReviewModal'
import ConfirmModal from '../components/ConfirmModal'
import { cancelOrder } from '../lib/orderHelpers'
import { notify } from '../lib/notifications'

const STATUS_COLORS = {
  pending: 'text-[var(--color-secondary-dark)]',
  confirmed: 'text-[var(--color-secondary-dark)]',
  in_transit: 'text-[var(--color-secondary)]',
  delivered: 'text-[var(--color-primary)]',
  completed: 'text-[var(--color-primary)]',
  cancelled: 'text-red-600',
}

const STATUS_DOT = {
  pending: 'bg-[var(--color-secondary-dark)] animate-pulse',
  confirmed: 'bg-[var(--color-secondary-dark)] animate-pulse',
  in_transit: 'bg-[var(--color-secondary)] animate-pulse',
  delivered: 'bg-[var(--color-primary)]',
  completed: 'bg-[var(--color-primary)]',
  cancelled: 'bg-red-600',
}

function BuyerOrderHistory() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: userLoading } = useCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [pullStart, setPullStart] = useState(null)
  const [pulling, setPulling] = useState(false)

  const fetchMyOrders = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, listings(crop_type, location, quantity, image_url, profiles(full_name))')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        notify.error('Failed to load orders')
        setError(error.message)
      } else {
        setOrders(data || [])
        setError(null)
      }
    } catch (err) {
      notify.error('Something went wrong')
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    fetchMyOrders()
  }, [fetchMyOrders])

  const handleCancel = async (order) => {
    setCancellingId(order.id)
    const { error } = await cancelOrder(order)
    setCancellingId(null)
    setConfirmCancel(null)
    if (error) {
      notify.error('Failed to cancel order: ' + error)
    } else {
      notify.success('Order cancelled successfully')
      fetchMyOrders()
    }
  }

  // Pull to refresh
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) setPullStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (!pullStart) return
    const diff = e.touches[0].clientY - pullStart
    if (diff > 60) setPulling(true)
  }

  const handleTouchEnd = () => {
    if (pulling) {
      setRefreshing(true)
      fetchMyOrders()
      notify.info('Refreshing orders...')
    }
    setPullStart(null)
    setPulling(false)
  }

  if (userLoading) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-charcoal)]/60 mb-4">Please log in to see your orders.</p>
        <Link to="/auth" className="text-[var(--color-primary)] underline font-semibold">Go to Login</Link>
      </div>
    </div>
  )

  return (
    <div
      className="min-h-screen bg-[var(--color-background-warm)]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pulling && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
          <div className="bg-[var(--color-primary)] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
            Release to refresh ↓
          </div>
        </div>
      )}

      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
          <div className="bg-[var(--color-primary)] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-pulse">
            Refreshing...
          </div>
        </div>
      )}

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
              <span className="pb-2 border-b-2 border-white text-white">My Orders</span>
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="text-xs sm:text-sm text-white/60 hidden sm:inline">
                {user?.full_name}
              </span>
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

        {/* Mobile bottom nav with active states */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 z-40 flex items-center justify-around px-2 py-3">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/dashboard' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
          >
            <span className="text-lg">🏠</span>Dashboard
          </Link>
          <Link
            to="/marketplace"
            className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/marketplace' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
          >
            <span className="text-lg">🛒</span>Market
          </Link>
          <Link
            to="/buyer-orders"
            className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/buyer-orders' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
          >
            <span className="text-lg">📦</span>Orders
          </Link>
          <Link
            to="/logistics"
            className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/logistics' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
          >
            <span className="text-lg">🚛</span>Logistics
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12 pb-24 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-3 sm:mb-4">
            Your Orders
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md">
            Track all your produce orders and their delivery status.
          </p>
        </motion.div>

        {loading && (
          <div className="mt-10 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[var(--color-surface)] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--color-surface)] rounded w-1/3" />
                    <div className="h-3 bg-[var(--color-surface)] rounded w-1/2" />
                    <div className="h-3 bg-[var(--color-surface)] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-12 text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-[var(--color-charcoal)]/60 mb-4">Failed to load orders.</p>
            <button
              onClick={() => { setLoading(true); fetchMyOrders() }}
              className="text-[var(--color-primary)] font-semibold underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-12 text-center py-12">
            <p className="text-5xl mb-4">📦</p>
            <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-2">
              No orders yet
            </h3>
            <p className="text-[var(--color-charcoal)]/60 mb-6 text-sm">
              You haven't placed any orders. Browse the marketplace to find fresh produce.
            </p>
            <Link
              to="/marketplace"
              className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-bold hover:brightness-95 transition-all"
            >
              Browse Marketplace →
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-10 space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      loading="lazy"
                      src={order.listings?.image_url}
                      alt={order.listings?.crop_type}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)] truncate">
                        {order.listings?.crop_type}
                      </h3>
                      <p className="text-sm text-[var(--color-charcoal)]/60 mt-1">
                        {order.quantity}kg · ₦{Number(order.total_price).toLocaleString()} · From {order.listings?.profiles?.full_name}
                      </p>
                      <p className="text-xs text-[var(--color-charcoal)]/40 mt-1">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[order.status] || 'bg-[var(--color-charcoal)]/30'}`} />
                        <span className={`text-sm font-medium capitalize ${STATUS_COLORS[order.status] || 'text-[var(--color-charcoal)]/60'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex gap-2 justify-end flex-wrap">
                        <Link
                          to={`/tracking/${order.id}`}
                          className="text-xs text-[var(--color-primary)] underline hover:no-underline"
                        >
                          View details
                        </Link>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => setConfirmCancel(order)}
                            disabled={cancellingId === order.id}
                            className="text-xs text-red-600 underline hover:no-underline disabled:opacity-50"
                          >
                            {cancellingId === order.id ? 'Cancelling...' : 'Cancel order'}
                          </button>
                        )}
                        {(order.status === 'delivered' || order.status === 'completed') && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowReviewModal(true)
                            }}
                            className="text-xs text-[var(--color-secondary)] underline hover:no-underline"
                          >
                            Leave review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showReviewModal && selectedOrder && (
          <ReviewModal
            order={selectedOrder}
            buyer={user}
            farmerName={selectedOrder.listings?.profiles?.full_name}
            onClose={() => {
              setShowReviewModal(false)
              setSelectedOrder(null)
            }}
            onSuccess={() => {
              setShowReviewModal(false)
              setSelectedOrder(null)
              fetchMyOrders()
            }}
          />
        )}

        {confirmCancel && (
          <ConfirmModal
            title="Cancel Order?"
            message="Are you sure you want to cancel this order? The quantity will be returned to the farmer's listing."
            confirmLabel="Yes, Cancel Order"
            onConfirm={() => handleCancel(confirmCancel)}
            onCancel={() => setConfirmCancel(null)}
          />
        )}
      </main>

      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-[var(--color-charcoal)]/60 mt-12 sm:mt-16">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Benin City, Edo State.</p>
      </footer>
    </div>
  )
}

export default BuyerOrderHistory
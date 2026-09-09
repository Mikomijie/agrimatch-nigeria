import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useFlutterwave } from 'flutterwave-react-v3'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { notify } from '../lib/notifications'
import { isListingExpired } from '../lib/listingHelpers'
import { getTransportCost } from '../lib/transportCost'

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(50)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [moreListings, setMoreListings] = useState([])
  const [timeLeft, setTimeLeft] = useState(null)
  const pendingOrderRef = useRef(null)

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single()
      if (error) {
        setError(error.message)
      } else {
        setProduct(data)
        setQuantity((q) => Math.min(q, data.quantity || q))
      }
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    async function fetchMoreListings() {
      if (!product?.farmer_id) return
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('farmer_id', product.farmer_id)
        .neq('id', product.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(4)
      setMoreListings(data || [])
    }
    fetchMoreListings()
  }, [product])

  useEffect(() => {
    if (!product || product.freshness === 'Harvesting Tomorrow' || product.freshness === 'Future Harvest') return
    const getDeadline = () => {
      const harvestTime = new Date(product.created_at)
      if (product.freshness === 'Harvested Yesterday') {
        harvestTime.setHours(harvestTime.getHours() - 24)
      }
      return new Date(harvestTime.getTime() + 12 * 60 * 60 * 1000)
    }
    const update = () => {
      const diff = getDeadline() - new Date()
      if (diff <= 0) {
        setTimeLeft('closed')
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft({ hours, minutes })
      }
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [product])

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )
  if (error) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-red-500">Error: {error}</p>
    </div>
  )
  if (!product) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Product not found.</p>
    </div>
  )
  if (userLoading) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )
  if (!user) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-charcoal)]/60 mb-4">Please log in to place an order.</p>
        <Link to="/auth" className="text-[var(--color-primary)] underline font-semibold">Go to Login</Link>
      </div>
    </div>
  )

  const expired = isListingExpired(product)
  const subtotal = quantity * product.price_per_unit
  const logisticsFee = getTransportCost(product.location)
  const total = subtotal + logisticsFee

  const flutterConfig = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `AGRIMATCH-PLACEHOLDER`,
    amount: total,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    redirect_url: `${window.location.origin}/payment-callback`,
    customer: {
      email: user?.email || 'buyer@agrimatch.ng',
      phonenumber: user?.phone || '08000000000',
      name: user?.full_name || 'AgriMatch Buyer',
    },
    customizations: {
      title: `AgriMatch - ${product.crop_type}`,
      description: `${quantity}kg of ${product.crop_type} from ${product.profiles?.full_name}`,
    },
  }

  const handleFlutterPayment = useFlutterwave(flutterConfig)

  const handlePaymentClick = async () => {
    try {
      setPaymentProcessing(true)
      setError(null)

      // Step 1: Create order in Supabase first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          listing_id: product.id,
          buyer_id: user.id,
          farmer_id: product.farmer_id,
          quantity: quantity,
          total_price: total,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) {
        notify.error('Failed to create order')
        setError(orderError.message)
        setPaymentProcessing(false)
        return
      }

      // Store order in ref so PaymentCallback can use it
      pendingOrderRef.current = orderData

      // Step 2: Open Flutterwave with the real order UUID as tx_ref
      handleFlutterPayment({
        tx_ref: `AGRIMATCH-${orderData.id}`,
        onSuccess: async (response) => {
          // Update order status
          await supabase
            .from('orders')
            .update({
              status: 'confirmed',
              payment_ref: String(response.transaction_id),
            })
            .eq('id', orderData.id)

          // Reduce listing quantity
          await supabase
            .from('listings')
            .update({ quantity: Math.max(0, product.quantity - quantity) })
            .eq('id', product.id)

          notify.success('Payment successful! Order confirmed.')
          setTimeout(() => navigate(`/tracking/${orderData.id}`), 1500)
        },
        onClose: () => {
          setPaymentProcessing(false)
          notify.info('Payment cancelled.')
        },
      })
    } catch (err) {
      notify.error(err.message)
      setError(err.message)
      setPaymentProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      <header className="bg-[var(--color-primary-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/marketplace')}
                className="md:hidden text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft />
              </button>
              <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
                AgriMatch
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors font-semibold"
              >
                <ChevronLeft /> Back
              </button>
              <Link to="/marketplace" className="pb-2 border-b-2 border-white text-white">
                Marketplace
              </Link>
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-10 sm:pt-16 pb-8 sm:pb-12">
        <motion.div
          className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-stretch"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col">
            <p className="text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-3 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] inline-block mr-2 animate-pulse" />
              {product.freshness}
            </p>
            <h1 className="font-[var(--font-heading)] font-bold text-5xl sm:text-6xl md:text-7xl text-[var(--color-charcoal)] mb-4 sm:mb-6 leading-none">
              {product.crop_type}
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md leading-relaxed">
              Freshly harvested produce from verified Nigerian farmers — direct to you, no middlemen.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8 sm:mt-10">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Available</p>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)]">{product.quantity} kg</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Location</p>
                <p className="flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-[var(--color-charcoal)]">
                  <PinIcon />{product.location}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Price per kg</p>
                <p className="font-[var(--font-heading)] text-2xl sm:text-4xl font-bold text-[var(--color-secondary)] truncate">
                  ₦{Number(product.price_per_unit).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Freshness</p>
                <p className="text-lg sm:text-xl font-bold text-[var(--color-charcoal)]">{product.freshness}</p>
              </div>
            </div>
          </div>

          <motion.div
            className="rounded-xl sm:rounded-2xl overflow-hidden border-2 border-black/10 shadow-sm h-full min-h-[320px] sm:min-h-[420px]"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <img loading="lazy" src={product.image_url} alt={product.crop_type} className="w-full h-full object-cover" />
          </motion.div>
        </motion.div>

        {/* Countdown Band */}
        <motion.div
          className="mt-8 sm:mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {product.freshness === 'Harvesting Tomorrow' || product.freshness === 'Future Harvest' ? (
            <div className="bg-[var(--color-surface)] rounded-lg p-4 sm:p-5">
              <p className="text-sm sm:text-base font-semibold text-[var(--color-charcoal)]/80">
                {product.freshness === 'Future Harvest' && product.expected_harvest_date
                  ? `Expected harvest: ${new Date(product.expected_harvest_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long' })} — order now to reserve.`
                  : 'This harvest is expected tomorrow — order now to reserve it.'}
              </p>
            </div>
          ) : timeLeft === 'closed' ? (
            <div className="bg-red-50 rounded-lg p-4 sm:p-5">
              <p className="text-sm sm:text-base font-semibold text-red-700">
                Pickup window has closed for this listing.
              </p>
            </div>
          ) : timeLeft ? (
            <div className={`rounded-lg p-4 sm:p-5 ${timeLeft.hours < 2 ? 'bg-red-50' : 'bg-[var(--color-secondary-light)]/25'}`}>
              <p className={`text-sm sm:text-base font-semibold ${timeLeft.hours < 2 ? 'text-red-700' : 'text-[var(--color-secondary-dark)]'}`}>
                ⏰ Pickup window closes in {timeLeft.hours}h {timeLeft.minutes}m — order soon.
              </p>
            </div>
          ) : null}
        </motion.div>

        {/* More from farmer + Order card */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 mt-10 sm:mt-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl text-[var(--color-charcoal)] mb-5">
              More from {product.profiles?.full_name}
            </h2>
            {moreListings.length === 0 ? (
              <p className="text-sm text-[var(--color-charcoal)]/50">No other active listings right now.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {moreListings.map((listing) => (
                  <motion.div key={listing.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Link
                      to={`/product/${listing.id}`}
                      className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-black/5 transition-all"
                    >
                      <div className="aspect-[4/3] bg-[var(--color-surface)] overflow-hidden">
                        <img
                          loading="lazy"
                          src={listing.image_url}
                          alt={listing.crop_type}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm text-[var(--color-charcoal)]">{listing.crop_type}</p>
                        <p className="text-xs text-[var(--color-charcoal)]/60 mt-1">
                          {listing.quantity}kg · ₦{Number(listing.price_per_unit).toLocaleString()}/kg
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div
              className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mt-6 border border-black/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-4">Verified Grower</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {product.profiles?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-charcoal)] text-base">{product.profiles?.full_name}</h3>
                  <p className="text-sm text-[var(--color-charcoal)]/60">Verified Nigerian Farmer</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8 border border-black/5">
              <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl text-[var(--color-charcoal)] mb-6">
                Select Order Details
              </h2>

              <div className="mb-8">
                <label className="block text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-4">
                  Quantity (kilograms)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 10))}
                    disabled={expired}
                    className="w-12 h-12 border-2 border-black/10 rounded-lg text-xl font-bold text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-[var(--color-charcoal)] min-w-[80px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.quantity, q + 10))}
                    disabled={expired || quantity >= product.quantity}
                    className="w-12 h-12 border-2 border-black/10 rounded-lg text-xl font-bold text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-8 pt-6 border-t border-black/10">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-charcoal)]/60">Subtotal</span>
                  <span className="font-bold text-[var(--color-charcoal)]">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-charcoal)]/60">Logistics Fee ({product.location})</span>
                  <span className="font-bold text-[var(--color-charcoal)]">₦{logisticsFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-black/10 pt-3 mt-3">
                  <span className="text-[var(--color-charcoal)]">Total Payable</span>
                  <span className="text-[var(--color-primary)]">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-[var(--color-primary-light)]/20 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-[var(--color-primary-dark)] mb-2">🔒 Escrow Guaranteed</p>
                <p className="text-xs text-[var(--color-charcoal)]/70 leading-relaxed">
                  Your payment is held securely. Funds are only released to the farmer once you confirm delivery.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {expired ? (
                <div className="bg-black/5 text-[var(--color-charcoal)]/50 py-3 px-6 rounded-lg text-center font-bold">
                  This listing has expired
                </div>
              ) : paymentProcessing ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[var(--color-primary)] text-white py-4 px-6 rounded-lg text-center"
                >
                  <p className="font-bold">Processing payment...</p>
                </motion.div>
              ) : (
                <motion.button
                  onClick={handlePaymentClick}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[var(--color-primary)] text-white py-3 px-6 rounded-lg font-bold hover:brightness-95 transition-all text-base"
                >
                  Pay ₦{total.toLocaleString()}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-[var(--color-charcoal)]/60 mt-12 sm:mt-16">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Benin City, Edo State.</p>
      </footer>
    </div>
  )
}

export default ProductDetail
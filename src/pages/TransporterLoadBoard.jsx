import { notify } from '../lib/notifications'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

function LoadCard({ order, onAccept, onUpdateStatus, isMyJob }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={order.listings?.image_url}
          alt={order.listings?.crop_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-gray-900">
          Awaiting Pickup
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-bold text-lg text-gray-900">{order.listings?.crop_type}</h3>
          <p className="font-bold text-xl text-[#1B5E20] whitespace-nowrap flex-shrink-0">
            ₦{Number(order.total_price).toLocaleString()}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-3">
          {order.listings?.location} · {order.quantity}kg
        </p>

        <p className="text-sm text-gray-700 mb-4">
          Order for <span className="font-semibold">{order.listings?.users?.name}</span>. Pickup and deliver to buyer's address.
        </p>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-mono">
            REF: {order.id.slice(0, 8).toUpperCase()}
          </p>

          {isMyJob ? (
            <div className="flex gap-2 flex-shrink-0">
              {order.status === 'confirmed' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'in_transit')}
                  className="bg-[#2E7D32] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  In Transit
                </button>
              )}
              {order.status === 'in_transit' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'delivered')}
                  className="bg-[#1B5E20] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  Delivered
                </button>
              )}
              {order.status === 'delivered' && (
                <span className="text-sm font-bold text-[#1B5E20]">✓ Completed</span>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAccept(order.id)}
              className="bg-[#1B5E20] text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap flex-shrink-0"
            >
              Accept Load
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TransporterLoadBoard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [transportRequests, setTransportRequests] = useState([])
  const [view, setView] = useState('available')
  const { user, loading: userLoading } = useCurrentUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchOrders() {
    let query = supabase
      .from('orders')
      .select('*, listings(crop_type, location, image_url, users(name))')
      .order('created_at', { ascending: false })

    if (view === 'available') {
      query = query.is('transporter_id', null)
    } else {
      query = query.eq('transporter_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      setError(error.message)
    } else {
      setOrders(data)
    }

    // Fetch transport requests
    const { data: requests } = await supabase
      .from('transport_requests')
      .select('*, orders(id, quantity, total_price, status, listings(crop_type, location, image_url)), users!transport_requests_farmer_id_fkey(name, phone)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (requests) {
      setTransportRequests(requests)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [view, user])
const handleAccept = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ transporter_id: user.id, status: 'confirmed' })
      .eq('id', orderId)

    if (error) {
      notify.error('Failed to accept load')
      setError(error.message)
    } else {
      notify.success('Load accepted! Check "My Jobs"')
      setView('myJobs')
      fetchOrders()
    }
  }
  

  const handleUpdateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      notify.error('Failed to update status')
      setError(error.message)
    } else {
      const statusText = newStatus === 'in_transit' ? 'In Transit' : 'Delivered'
      notify.success(`Order marked as ${statusText}`)
      fetchOrders()
    }
  }

  if (userLoading) return (
    <div className="p-10 text-center text-gray-500">
      <p>Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Please log in as a transporter to accept loads.</p>
      <Link to="/auth" className="text-[#1B5E20] underline mt-2 inline-block font-semibold">Go to Login</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F3F0]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-2xl sm:text-3xl font-bold text-[#1B5E20] flex-shrink-0">
              AgriMatch
            </Link>
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-[#1B5E20] transition-colors font-semibold"
              >
                ← Back
              </button>
              <Link to="/marketplace" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Marketplace
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Dashboard
              </Link>
              <span className="pb-2 border-b-2 border-[#1B5E20] text-[#1B5E20]">Logistics</span>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                {user?.name}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-xs sm:text-sm font-semibold text-[#1B5E20] hover:text-[#0d3a14] transition-colors border-2 border-[#1B5E20] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        {/* Hero & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
              {view === 'available' ? 'Available' : 'My Active'} <span className="text-[#2E7D32]">Loads</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-md">
              {view === 'available' 
                ? 'Discover and secure high-value delivery jobs across Edo State .'
                : 'Your accepted deliveries and their status.'}
            </p>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={() => setView('available')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                view === 'available'
                  ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                  : 'border-gray-300 text-gray-700 hover:border-[#1B5E20]'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setView('requests')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-bold border-2 transition-all relative ${
                view === 'requests'
                  ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                  : 'border-gray-300 text-gray-700 hover:border-[#1B5E20]'
              }`}
            >
              Requests
              {transportRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {transportRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setView('myJobs')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                view === 'myJobs'
                  ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                  : 'border-gray-300 text-gray-700 hover:border-[#1B5E20]'
              }`}
            >
              My Jobs
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {loading && <p className="text-center text-gray-600 py-12">Loading loads...</p>}
        {error && <p className="text-center text-red-600 py-12">Error: {error}</p>}

        {/* Loads Grid */}
        {!loading && !error && orders.length === 0 && (
          <p className="text-center text-gray-600 py-12">
            {view === 'available' ? 'No available loads right now.' : 'No active jobs yet.'}
          </p>
        )}

        {!loading && !error && view !== 'requests' && orders.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {orders.map((order) => (
              <LoadCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onUpdateStatus={handleUpdateStatus}
                isMyJob={view === 'myJobs'}
              />
            ))}
          </div>
        )}

        {!loading && view === 'requests' && (
          <div>
            {transportRequests.length === 0 ? (
              <p className="text-center text-gray-600 py-12">No transport requests yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {transportRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={req.orders?.listings?.image_url}
                        alt={req.orders?.listings?.crop_type}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-lg text-xs font-bold">
                        Transport Needed
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {req.orders?.listings?.crop_type}
                        </h3>
                        <p className="font-bold text-[#1B5E20] whitespace-nowrap">
                          GH₵{Number(req.orders?.total_price).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        📍 {req.pickup_location} · {req.orders?.quantity}kg
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        📅 Pickup: {req.pickup_date}
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        👨‍🌾 Farmer: {req.users?.name}
                      </p>
                      {req.notes && (
                        <p className="text-xs text-gray-500 italic mb-3">
                          "{req.notes}"
                        </p>
                      )}
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            .from('transport_requests')
                            .update({ status: 'accepted', transporter_id: user.id })
                            .eq('id', req.id)
                          if (!error) {
                            await supabase
                              .from('orders')
                              .update({ transporter_id: user.id, status: 'in_transit' })
                              .eq('id', req.orders?.id)
                            notify.success('Transport request accepted!')
                            fetchOrders()
                          } else {
                            notify.error('Failed to accept request')
                          }
                        }}
                        className="w-full bg-[#1B5E20] text-white py-2.5 rounded-lg text-sm font-bold hover:brightness-95 transition-all"
                      >
                        Accept Transport Request
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-gray-600 mt-12 sm:mt-16">
        <p className="font-bold text-gray-900 mb-2">AgriMatch</p>
       <p>© 2026 AgriMatch. Jos Regional Hub, Plateau State.</p>
      </footer>
    </div>
  )
}

export default TransporterLoadBoard
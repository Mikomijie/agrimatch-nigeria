import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

// Temporary: using a seeded transporter ID until real auth is wired up
const TEMP_TRANSPORTER_ID = '66666666-6666-6666-6666-666666666666'

function LoadCard({ order, onAccept }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        <img
          src={order.listings?.image_url}
          alt={order.listings?.crop_type}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-full text-xs font-medium">
          Awaiting Pickup
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-[var(--font-heading)] text-lg">{order.listings?.crop_type}</h3>
          <p className="font-[var(--font-heading)] text-lg text-[var(--color-secondary)] whitespace-nowrap">
            GH₵{Number(order.total_price).toLocaleString()}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {order.listings?.location} · {order.quantity}kg
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Order for {order.listings?.users?.name}. Pickup and deliver to buyer's address.
        </p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">ORDER REF: {order.id.slice(0, 8).toUpperCase()}</span>
          <button
            onClick={() => onAccept(order.id)}
            className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:brightness-95 active:scale-95 transition-all"
          >
            Accept Load
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function TransporterLoadBoard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchAvailableOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, listings(crop_type, location, image_url, users(name))')
      .is('transporter_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setOrders(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAvailableOrders()
  }, [])

  const handleAccept = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ transporter_id: TEMP_TRANSPORTER_ID, status: 'confirmed' })
      .eq('id', orderId)

    if (error) {
      setError(error.message)
    } else {
      // Refresh the list — accepted orders should disappear
      fetchAvailableOrders()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/dashboard">Dashboard</Link>
          <span className="pb-1 border-b-2 border-[var(--color-primary)]">Logistics</span>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">Transporter Load Board</h1>
            <p className="mt-2 text-gray-600 text-sm max-w-md">
              Discover and secure high-value delivery jobs across the Bono East region.
            </p>
          </div>
        </div>

        {loading && <p className="mt-12 text-center text-gray-500">Loading available loads...</p>}
        {error && <p className="mt-12 text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <LoadCard key={order.id} order={order} onAccept={handleAccept} />
            ))}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="mt-12 text-center text-gray-500">No pending loads right now.</p>
        )}
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default TransporterLoadBoard
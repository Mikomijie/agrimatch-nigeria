import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const LOADS = [
  {
    id: 1,
    name: 'Puna Yams (2.5 Tons)',
    price: 2450,
    location: 'Techiman Central Hub',
    distance: '112 km',
    description: 'Premium export-grade yams requiring moisture-controlled transport to Tema.',
    tag: 'Urgent Pickup',
    image: '/images/produce/tomatoes.jpg',
    ref: 'AM-3042',
  },
  {
    id: 2,
    name: "Bird's Eye Chilies",
    price: 1180,
    location: 'Tuobodom Junction',
    distance: '45 km',
    description: 'Lightweight high-volume cargo. Multiple pickup points within a 5km radius.',
    tag: null,
    image: '/images/produce/peppers.jpg',
    ref: 'AM-2918',
  },
  {
    id: 3,
    name: 'Plantain Bulk (4 Tons)',
    price: 3600,
    location: 'Nkoranza North',
    distance: '88 km',
    description: 'Bulk transit required for regional distribution. Reliable loading crew needed.',
    tag: 'Verified Vendor',
    image: '/images/produce/garden-eggs.jpg',
    ref: 'AM-3105',
  },
]

function LoadCard({ load }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        <img src={load.image} alt={load.name} className="w-full h-full object-cover" />
        {load.tag && (
          <span className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-full text-xs font-medium">
            {load.tag}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-[var(--font-heading)] text-lg">{load.name}</h3>
          <p className="font-[var(--font-heading)] text-lg text-[var(--color-secondary)] whitespace-nowrap">
            ₵{load.price.toLocaleString()}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">{load.location} · {load.distance}</p>
        <p className="text-sm text-gray-600 mt-2">{load.description}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">LOGISTICS REF: {load.ref}</span>
          <button className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:brightness-95 active:scale-95 transition-all">
            Accept Load
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function TransporterLoadBoard() {
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
              Optimized routes for local logistics partners.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="border border-gray-300 px-4 py-2 rounded-md text-sm">Filter Regions</button>
            <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md text-sm">Active Jobs</button>
          </div>
        </div>

        {/* Load-pooling bonus banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-[var(--color-background-warm)] border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
              🚚
            </span>
            <div>
              <p className="font-medium text-sm">Smart Load Pooling Available</p>
              <p className="text-xs text-gray-500 max-w-sm">
                Combine three nearby pickups in Techiman Central Market to increase your
                margins by up to 24%.
              </p>
            </div>
          </div>
          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md text-sm whitespace-nowrap">
            View Pooled Route
          </button>
        </motion.div>

        {/* Load grid */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LOADS.map((load) => (
            <LoadCard key={load.id} load={load} />
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default TransporterLoadBoard
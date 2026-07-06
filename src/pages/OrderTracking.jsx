import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const STAGES = [
  {
    id: 1,
    title: 'Order Confirmed',
    time: 'July 3, 2026 · 08:15 AM',
    description: 'Transaction verified and farmer notified at Techiman Hub.',
    done: true,
  },
  {
    id: 2,
    title: 'Harvest & Inspection',
    time: 'July 3, 2026 · 11:30 AM',
    description: 'Quality check completed. Produce packed in eco-friendly crates.',
    done: true,
  },
  {
    id: 3,
    title: 'Departed Hub',
    time: 'July 3, 2026 · 02:45 PM',
    description: 'Currently moving through the N8 Highway corridor.',
    done: false,
    active: true,
  },
  {
    id: 4,
    title: 'Arriving at Destination',
    time: 'Expected Today · 05:30 PM',
    description: '',
    done: false,
  },
]

function OrderTracking() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/dashboard" className="pb-1 border-b-2 border-[var(--color-primary)]">Dashboard</Link>
          <Link to="/logistics">Logistics</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <p className="text-xs text-gray-500">ORDER #AM-2026-8892</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2">
          <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">Tracking your harvest.</h1>
          <div className="text-left md:text-right">
            <p className="flex items-center gap-2 text-xs text-gray-500 md:justify-end">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              In Transit
            </p>
            <p className="font-[var(--font-heading)] text-lg">Estimated Delivery: Today, 17:30</p>
          </div>
        </div>
        <p className="mt-3 text-gray-600 text-sm max-w-lg">
          Your shipment of Grade-A Tomatoes is currently en route. Our logistics partner is
          navigating the Bono East regional hub to ensure delivery by sunset.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-10">
          {/* Timeline */}
          <div className="space-y-8 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex gap-4"
              >
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm ${
                    stage.done
                      ? 'bg-[var(--color-primary)]'
                      : stage.active
                      ? 'bg-[var(--color-primary)] animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {stage.done ? '✓' : stage.active ? '→' : ''}
                </div>
                <div className={stage.done || stage.active ? '' : 'opacity-50'}>
                  <p className="font-[var(--font-heading)] text-lg">{stage.title}</p>
                  <p className="text-xs text-gray-500">{stage.time}</p>
                  {stage.description && (
                    <p className="text-sm text-gray-600 mt-1 max-w-sm">{stage.description}</p>
                  )}
                </div>
              </motion.div>
            ))}

            <div className="ml-12 bg-[var(--color-background-warm)] rounded-md p-3 flex items-center justify-between max-w-sm">
              <div>
                <p className="text-sm font-medium">Kofi Mensah</p>
                <p className="text-xs text-gray-500">Logistics Specialist</p>
              </div>
              <span className="text-[var(--color-primary)]">📞</span>
            </div>
          </div>

          {/* Map + shipment details */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="absolute bg-[var(--color-primary)] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                12 mins away
              </div>
              <p className="text-gray-400 text-sm">Map view placeholder</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-5">
              <h2 className="font-[var(--font-heading)] text-xl">Shipment Details</h2>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">VENDOR</p>
                  <p className="font-medium">Kofi Mensah Farms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">WEIGHT</p>
                  <p className="font-medium">450 kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">DESTINATION</p>
                  <p className="font-medium">Accra Central Market</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/produce/tomatoes.jpg"
                    alt="Tomatoes"
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">Grade-A Tomatoes</p>
                    <p className="text-xs text-gray-500">Export Quality</p>
                  </div>
                </div>
                <button className="border border-gray-300 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors">
                  View Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default OrderTracking
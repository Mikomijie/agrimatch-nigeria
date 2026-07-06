import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'

const REGIONS = [
  'Bono East',
  'Ashanti',
  'Northern',
  'Eastern',
  'Volta',
  'Greater Accra',
]

function FarmerRegistration() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [region, setRegion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire up to Supabase once backend is ready
    console.log({ name, phone, region })
  }

  return (
    <div className="min-h-screen bg-white grid md:grid-cols-2">
      {/* Left: photo + quote */}
      <div className="relative hidden md:block">
        <img
          src="/images/farmers/farmer-portrait.jpg"
          alt="Farmer in field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-24 left-8 right-8 bg-black/40 backdrop-blur-sm text-white p-5 rounded-lg"
        >
          <p className="italic text-lg">
            "Digital tools are the new seeds. We plant them today to harvest efficiency
            tomorrow."
          </p>
          <p className="text-sm mt-3 text-white/80">— Kofi A., Bono East Region</p>
        </motion.div>
        <Link
          to="/"
          className="absolute bottom-8 left-8 font-[var(--font-heading)] italic text-2xl text-white"
        >
          AgriMatch
        </Link>
      </div>

      {/* Right: form */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center px-6 md:px-16 py-16"
      >
        <p className="text-xs font-semibold tracking-wide text-gray-500">STEP 01 / 04</p>
        <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl mt-2">
          Farmer Registration
        </h1>
        <p className="mt-3 text-gray-600 text-sm max-w-sm">
          Join Ghana's premium marketplace for agricultural excellence. Connect directly with
          logistics and institutional buyers.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 max-w-md">
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-500 mb-2">
              PROFILE IDENTITY
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                👤
              </div>
              <div>
                <p className="text-xs text-gray-500">Upload a clear portrait. This helps buyers recognize your brand.</p>
                <button type="button" className="text-sm font-medium text-[var(--color-primary)] mt-1">
                  Select Image
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              FULL LEGAL NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kwame Mensah"
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              PHONE NUMBER (MOBILE MONEY)
            </label>
            <div className="mt-2 flex">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm text-gray-600">
                +233
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024 XXX XXXX"
                className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              AGRICULTURAL REGION
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            >
              <option value="">Select your region</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <p className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            Active registration verified for 2026 harvest season
          </p>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-md font-medium hover:brightness-95 active:scale-[0.98] transition-all"
            >
              Continue Registration →
            </button>
            <button
              type="button"
              className="border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default FarmerRegistration
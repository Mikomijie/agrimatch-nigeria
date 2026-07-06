import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// Temporary: using a seeded farmer ID until real auth is wired up
const TEMP_FARMER_ID = '11111111-1111-1111-1111-111111111111'

const CROPS = [
  { id: 'Tomatoes', label: 'Tomatoes', image: '/images/produce/tomatoes.jpg' },
  { id: 'Peppers', label: 'Peppers', image: '/images/produce/peppers.jpg' },
  { id: 'Garden Eggs', label: 'Garden Eggs', image: '/images/produce/garden-eggs.jpg' },
  { id: 'Okra', label: 'Okra', image: '/images/produce/okra.jpg' },
]

const FRESHNESS_OPTIONS = [
  { id: 'Harvested Today', label: 'Harvested Today' },
  { id: 'Harvested Yesterday', label: 'Harvested Yesterday' },
  { id: 'Harvesting Tomorrow', label: 'Harvesting Tomorrow' },
]

function FarmerDashboard() {
  const navigate = useNavigate()
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes')
  const [freshness, setFreshness] = useState('Harvested Today')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handlePublish = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const cropImage = CROPS.find((c) => c.id === selectedCrop)?.image

    const { error } = await supabase.from('listings').insert({
      farmer_id: TEMP_FARMER_ID,
      crop_type: selectedCrop,
      quantity: Number(quantity),
      price_per_unit: Number(price),
      location,
      freshness,
      image_url: cropImage,
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setQuantity('')
      setPrice('')
      setLocation('')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)] border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace" className="text-gray-600 hover:text-[var(--color-charcoal)]">Marketplace</Link>
          <span className="pb-1 border-b-2 border-[var(--color-primary)]">Dashboard</span>
          <Link to="/logistics">Logistics</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-12 grid md:grid-cols-3 gap-12">
        <form onSubmit={handlePublish} className="md:col-span-2 space-y-8">
          <div>
            <h1 className="font-[var(--font-heading)] text-4xl md:text-5xl leading-tight">
              List your fresh <span className="italic text-[var(--color-secondary)]">harvest today.</span>
            </h1>
            <p className="mt-3 text-gray-600 max-w-md">
              Direct access to Ghanaian retailers and bulk buyers.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-500 mb-3">
              1. SELECT CROP TYPE
            </p>
            <div className="grid grid-cols-4 gap-3">
              {CROPS.map((crop) => (
                <button
                  type="button"
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`text-left rounded-lg overflow-hidden border transition-all ${
                    selectedCrop === crop.id
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
                      : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  <div className="aspect-[4/3] bg-gray-100">
                    <img src={crop.image} alt={crop.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-3 py-2 text-sm font-medium">{crop.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">
                2. TOTAL QUANTITY (KG)
              </label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">
                3. PRICE PER KG (GH₵)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              4. PICKUP LOCATION
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Town, Region (e.g. Techiman, Bono East)"
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              5. HARVEST &amp; FRESHNESS
            </label>
            <div className="mt-2 flex flex-wrap gap-3">
              {FRESHNESS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setFreshness(opt.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors ${
                    freshness === opt.id
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-[var(--color-primary)]">✓ Listing published successfully!</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[var(--color-secondary)] text-white px-6 py-3 rounded-md font-medium tracking-wide hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting ? 'PUBLISHING...' : 'PUBLISH LISTING'}
            </button>
            <Link
              to="/marketplace"
              className="border border-gray-300 px-6 py-3 rounded-md font-medium tracking-wide hover:bg-gray-50 transition-colors"
            >
              VIEW MARKETPLACE
            </Link>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-5 bg-[var(--color-background-warm)]">
            <h2 className="font-[var(--font-heading)] text-xl">Market Insight</h2>
            <p className="mt-2 text-sm text-gray-600">
              Current market prices in <strong>Techiman Hub</strong> are trending upward for
              grade-A tomatoes.
            </p>
            <div className="mt-4 aspect-[3/4] rounded-md overflow-hidden bg-gray-100">
              <img
                src="/images/farmers/farmer-portrait.jpg"
                alt="Farmer in field"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default FarmerDashboard
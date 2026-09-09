import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { notify } from '../lib/notifications'

const VEHICLE_TYPES = ['Motorbike', 'Pickup Truck', 'Van', 'Truck']

const COVERAGE_AREAS = [
  'Plateau', 'Lagos', 'Kano', 'Abuja', 'FCT Abuja', 'Kaduna',
  'Enugu', 'Oyo', 'Rivers', 'Delta', 'Edo', 'Anambra',
  'Nationwide', 'North Central', 'South West', 'South East', 'South South'
]

function TransporterRegistration() {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [vehicleType, setVehicleType] = useState('')
  const [capacity, setCapacity] = useState('')
  const [coverageArea, setCoverageArea] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function checkExisting() {
      if (!user) return
      const { data } = await supabase
        .from('transporters')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        navigate('/logistics')
      } else {
        setCheckingExisting(false)
      }
    }
    if (user) checkExisting()
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    if (!vehicleType) {
      setError('Please select a vehicle type')
      return
    }

    setSubmitting(true)

    const { error: insertError } = await supabase.from('transporters').insert({
      user_id: user.id,
      vehicle_type: vehicleType,
      capacity_kg: Number(capacity),
      coverage_area: coverageArea,
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      notify.success('Registration complete! Welcome to the network.')
      navigate('/logistics')
    }
  }

  if (userLoading || checkingExisting) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-charcoal)]/60 mb-4">Please log in to register as a transporter.</p>
        <Link to="/auth" className="text-[var(--color-primary)] underline font-semibold">Go to Login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      <header className="bg-[var(--color-primary-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
              AgriMatch
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium flex-1 justify-center">
              <button
                onClick={() => window.history.back()}
                className="text-white/80 hover:text-white transition-colors font-semibold"
              >
                ← Back
              </button>
              <span className="pb-2 border-b-2 border-white text-white">Transporter Registration</span>
            </nav>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-white/60 hidden sm:inline">{user?.full_name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div loading="lazy" className="w-16 h-16 bg-[var(--color-primary-light)]/30 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">🚛</span>
          </div>
          <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl text-[var(--color-charcoal)] mb-4">
            Join the <span className="italic text-[var(--color-primary)]">network.</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70">
            Register your vehicle and start accepting delivery jobs across Nigeria. Earn per load, work your own hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-black/5"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase mb-3">
                Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setVehicleType(type)}
                    className={`py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all text-left ${
                      vehicleType === type
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'border-black/10 text-[var(--color-charcoal)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    {type === 'Motorbike' && '🏍️ '}
                    {type === 'Pickup Truck' && '🛻 '}
                    {type === 'Van' && '🚐 '}
                    {type === 'Truck' && '🚛 '}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase mb-3">
                Carrying Capacity (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-charcoal)]/50 font-semibold text-sm">kg</span>
              </div>
            </div>

            {/* Coverage Area */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase mb-3">
                Coverage Area
              </label>
              <select
                required
                value={coverageArea}
                onChange={(e) => setCoverageArea(e.target.value)}
                className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
              >
                <option value="">Select coverage area</option>
                {COVERAGE_AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-[var(--color-primary-light)]/20 rounded-lg p-4">
              <p className="text-sm font-bold text-[var(--color-primary-dark)] mb-2">How it works</p>
              <ul className="space-y-1.5 text-xs text-[var(--color-charcoal)]/70">
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold flex-shrink-0">•</span>
                  Browse available loads from farmers in your area
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold flex-shrink-0">•</span>
                  Accept jobs and upload a pickup photo to start delivery
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold flex-shrink-0">•</span>
                  Upload a delivery photo to confirm completion
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold flex-shrink-0">•</span>
                  Payment is released once buyer confirms receipt
                </li>
              </ul>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[var(--color-primary)] flex-shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-[var(--color-charcoal)]/70">
                I agree to the{' '}
                <Link to="/terms" className="text-[var(--color-primary)] underline hover:no-underline">
                  terms and conditions
                </Link>{' '}
                and confirm that my vehicle details are accurate.
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !vehicleType || !capacity || !coverageArea || !agreeTerms}
              className="w-full bg-[var(--color-primary)] text-white py-3 px-6 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
            >
              {submitting ? 'Registering...' : 'Complete Registration →'}
            </button>
          </form>
        </motion.div>
      </main>

      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 text-center text-sm text-[var(--color-charcoal)]/60 mt-12">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Benin City, Edo State.</p>
      </footer>
    </div>
  )
}

export default TransporterRegistration
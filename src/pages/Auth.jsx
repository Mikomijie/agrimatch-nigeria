import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

const ROLES = ['farmer', 'buyer', 'transporter']
const REGIONS = ['Bono East', 'Ashanti', 'Northern', 'Eastern', 'Volta', 'Greater Accra']

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('farmer')
  const [region, setRegion] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    const { error: profileError } = await supabase.from('users').insert({
      auth_id: authData.user.id,
      role,
      name,
      phone: phone.startsWith('+233') ? phone : `+233${phone}`,
      region: role === 'farmer' ? region : null,
    })

    setSubmitting(false)

    if (profileError) {
      setError(profileError.message)
    } else {
      navigate(role === 'farmer' ? '/dashboard' : role === 'buyer' ? '/marketplace' : '/logistics')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SIDE - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex flex-col justify-center items-center px-10 py-16 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]"
      >
        {/* Plant/Leaf SVG Logo */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="mb-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="58" stroke="#1B5E20" strokeWidth="2" />
          <path
            d="M60 20 Q75 40 75 60 Q75 80 60 95 Q45 80 45 60 Q45 40 60 20Z"
            fill="#2E7D32"
          />
          <path
            d="M60 35 Q68 45 68 60 Q68 70 60 80 Q52 70 52 60 Q52 45 60 35Z"
            fill="#FFFFFF"
            opacity="0.4"
          />
        </svg>

        <h2 className="font-[var(--font-heading)] text-3xl text-[#1B5E20] text-center">
          AgriMatch
        </h2>

        <p className="mt-4 text-center text-[#2E7D32] max-w-xs leading-relaxed">
          Connecting Ghana's farmers, buyers, and transporters. Direct marketplace. Real prices. Fast logistics.
        </p>

        <div className="mt-8 space-y-3 text-sm text-[#1B5E20]">
          <div className="flex items-start gap-3">
            <span className="text-lg">✓</span>
            <span>No middlemen, fair pricing</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✓</span>
            <span>Verified farmers & buyers</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✓</span>
            <span>12-hour farm to delivery</span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT SIDE - Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center px-6 md:px-10 py-16"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
              AgriMatch
            </Link>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-md text-sm font-medium border transition-all ${
                mode === 'signup'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-md text-sm font-medium border transition-all ${
                mode === 'login'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
              }`}
            >
              Log In
            </button>
          </div>

          {mode === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">I am a</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-2 px-3 rounded-md text-xs font-medium border capitalize transition-all ${
                        role === r
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  placeholder="Your full name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="24XXXXXXX"
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                />
              </div>

              {/* Region (Farmers only) */}
              {role === 'farmer' && (
                <div>
                  <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Region</label>
                  <select
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-2 w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password with Toggle */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Password</label>
                <div className="mt-2 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-md font-medium hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 mt-6"
              >
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password with Toggle */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Password</label>
                <div className="mt-2 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-md font-medium hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 mt-6"
              >
                {submitting ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Auth
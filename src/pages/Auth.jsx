import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { notify } from '../lib/notifications'

const ROLES = [
  { id: 'farmer', label: 'Farmer' },
  { id: 'buyer', label: 'Buyer' },
  { id: 'transporter', label: 'Transporter' }
]

const REGIONS = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun',
  'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
]

function Auth() {
  const navigate = useNavigate()
  const [step, setStep] = useState('role')
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [role, setRole] = useState('farmer')
  const [region, setRegion] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)

  const firstInputRef = useRef(null)
  const emailInputRef = useRef(null)

  useEffect(() => {
    if (step === 'form') {
      setTimeout(() => {
        if (mode === 'signup' && firstInputRef.current) {
          firstInputRef.current.focus()
        } else if (mode === 'login' && emailInputRef.current) {
          emailInputRef.current.focus()
        }
      }, 100)
    }
  }, [step, mode])

  const validatePhone = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 0) {
      setPhoneError('')
      return
    }
    if (cleaned.length !== 10) {
      setPhoneError(`Need 10 digits (you have ${cleaned.length})`)
    } else {
      setPhoneError('Valid Nigerian number')
    }
  }

  const getFriendlyError = (errorMsg) => {
    if (errorMsg.includes('already registered')) return 'Email already in use - try logging in'
    if (errorMsg.includes('Invalid login')) return 'Wrong email or password'
    if (errorMsg.includes('password')) return 'Password must be at least 6 characters'
    if (errorMsg.includes('Email not confirmed')) return 'Check your email to confirm'
    return errorMsg
  }

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    setStep('form')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      setSubmitting(false)
      return
    }

    let formattedPhone = phone
    if (!phone.startsWith('+234')) {
      if (phone.startsWith('0')) {
        formattedPhone = '+234' + phone.slice(1)
      } else {
        formattedPhone = '+234' + phone
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(getFriendlyError(authError.message))
      setSubmitting(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name: name,
      phone: formattedPhone,
      role,
      region: region || null,
    })

    if (profileError) {
      notify.error('Failed to create account')
      setError(getFriendlyError(profileError.message))
      setSubmitting(false)
    } else {
      const roleRoutes = { farmer: '/dashboard', buyer: '/marketplace', transporter: '/logistics' }
      notify.success('Account created! Welcome to AgriMatch')
      setSuccess(`You're registered as a ${role.charAt(0).toUpperCase() + role.slice(1)}. Redirecting...`)
      setTimeout(() => {
        navigate(roleRoutes[role])
      }, 2500)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      notify.error('Login failed')
      setError(getFriendlyError(error.message))
      setSubmitting(false)
    } else {
      const { data: userData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      notify.success('Logged in successfully!')
      setSuccess('Logged in successfully! Redirecting...')
      setTimeout(() => {
        navigate('/role-switch')
      }, 2500)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setResetSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(getFriendlyError(error.message))
    } else {
      setSuccess('Password reset link sent to your email')
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetEmail('')
      }, 2000)
    }

    setResetSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center px-4 sm:px-6 py-12">
      <AnimatePresence mode="wait">
        {step === 'role' && mode === 'signup' ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md text-center"
          >
            <p className="font-[var(--font-heading)] italic text-3xl text-[var(--color-primary)] mb-2">AgriMatch</p>
            <h1 className="text-2xl font-bold text-[var(--color-charcoal)] mb-2">What brings you here?</h1>
            <p className="text-[var(--color-charcoal)]/60 text-sm mb-10">Choose your role to get started</p>

            <div className="space-y-3">
              {ROLES.map((r, index) => (
                <motion.button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 border-2 border-black/10 rounded-lg text-lg font-semibold text-[var(--color-charcoal)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all bg-white shadow-sm"
                >
                  {r.id === 'farmer' && '🌾 '}
                  {r.id === 'buyer' && '🛒 '}
                  {r.id === 'transporter' && '🚛 '}
                  {r.label}
                </motion.button>
              ))}
            </div>

            <p className="mt-8 text-sm text-[var(--color-charcoal)]/60">
              Already have an account?{' '}
              <button
                onClick={() => setStep('form')}
                className="text-[var(--color-primary)] font-bold hover:underline"
              >
                Log In
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <button
              onClick={() => {
                if (mode === 'signup') {
                  setStep('role')
                } else {
                  setMode('signup')
                  setStep('role')
                }
                setError(null)
                setSuccess(null)
                setEmailError('')
                setPhoneError('')
                setShowForgotPassword(false)
              }}
              className="mb-6 text-sm font-semibold text-[var(--color-charcoal)]/60 hover:text-[var(--color-primary)] transition-colors"
            >
              ← Back
            </button>

            {mode === 'signup' && (
              <div className="mb-6">
                <div className="h-1 rounded-full mb-3 bg-[var(--color-primary)]" />
                <p className="text-xs text-[var(--color-charcoal)]/60 font-semibold">
                  Signing up as: <span className="text-[var(--color-primary)] font-bold">{ROLES.find(r => r.id === role)?.label}</span>
                </p>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => { setMode('signup'); setStep('role'); setError(null); setSuccess(null) }}
                  className="flex-1 py-3 rounded-lg text-sm font-semibold border-2 border-black/10 text-[var(--color-charcoal)]/70"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                  className="flex-1 py-3 rounded-lg text-sm font-semibold border-2 bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                >
                  Log In
                </button>
              </div>
            )}

            {mode === 'signup' ? (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignup}
                className="space-y-5"
              >
                <div>
                  <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">Full Name</label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">Phone Number</label>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center px-3 py-3 border-2 border-black/10 rounded-lg bg-[var(--color-surface)]">
                      <span className="text-sm font-semibold text-[var(--color-charcoal)]/70">+234</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '')
                        setPhone(cleaned)
                        validatePhone(cleaned)
                      }}
                      className="flex-1 border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                      placeholder="8012345678"
                      maxLength="10"
                      autoComplete="tel"
                    />
                  </div>
                  {phoneError && (
                    <p className={`text-xs mt-1 font-medium ${phoneError.includes('Valid') ? 'text-[var(--color-primary)]' : 'text-orange-600'}`}>
                      {phoneError}
                    </p>
                  )}
                </div>

                {role === 'farmer' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">Harvest Region</label>
                    <select
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    >
                      <option value="">Select your region</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </motion.div>
                )}

                <div>
                  <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                  {emailError && (
                    <p className={`text-xs mt-1 font-medium ${emailError.includes('already') ? 'text-red-600' : 'text-[var(--color-charcoal)]/60'}`}>
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">Password</label>
                  <div className="mt-2 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-2 border-black/10 rounded-lg px-4 py-3 pr-14 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-charcoal)]/50 hover:text-[var(--color-primary)] transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-[var(--color-charcoal)]/60 leading-relaxed">
                    I agree to AgriMatch's{' '}
                    <Link to="/terms" className="text-[var(--color-primary)] font-bold hover:underline">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
                  >
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--color-primary-light)]/20 border-2 border-[var(--color-primary)]/30 rounded-lg p-4"
                  >
                    <p className="text-sm text-[var(--color-primary-dark)] font-medium">{success}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 mt-4 text-base"
                >
                  {submitting ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-[var(--color-charcoal)]/60">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[var(--color-primary)] font-bold hover:underline"
                  >
                    Log In
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {showForgotPassword ? (
                  <>
                    <h2 className="text-lg font-bold text-[var(--color-charcoal)] mb-4">Reset Password</h2>
                    <div>
                      <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">Email</label>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="bg-[var(--color-primary-light)]/20 border-2 border-[var(--color-primary)]/30 rounded-lg p-4">
                        <p className="text-sm text-[var(--color-primary-dark)] font-medium">{success}</p>
                      </div>
                    )}

                    <button
                      onClick={handleForgotPassword}
                      disabled={resetSubmitting}
                      className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
                    >
                      {resetSubmitting ? 'Sending link...' : 'Send Reset Link'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowForgotPassword(false); setError(null); setSuccess(null) }}
                      className="w-full text-center text-sm font-semibold text-[var(--color-charcoal)]/60 hover:text-[var(--color-primary)] transition-colors"
                    >
                      Back to login
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">Email</label>
                      <input
                        ref={emailInputRef}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">Password</label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border-2 border-black/10 rounded-lg px-4 py-3 pr-14 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                          placeholder="Your password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-charcoal)]/50 hover:text-[var(--color-primary)] transition-colors"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="bg-[var(--color-primary-light)]/20 border-2 border-[var(--color-primary)]/30 rounded-lg p-4">
                        <p className="text-sm text-[var(--color-primary-dark)] font-medium">{success}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 mt-4 text-base"
                    >
                      {submitting ? 'Logging in...' : 'Log In'}
                    </button>

                    <p className="text-center text-sm text-[var(--color-charcoal)]/60">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('signup'); setStep('role') }}
                        className="text-[var(--color-primary)] font-bold hover:underline"
                      >
                        Sign Up
                      </button>
                    </p>
                  </>
                )}
              </motion.form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Auth
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { notify } from '../lib/notifications'

function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (error) {
      notify.error(error.message)
    } else {
      notify.success('Password updated successfully!')
      setTimeout(() => navigate('/auth'), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)] block mb-6">
          AgriMatch
        </Link>
        <h1 className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)] mb-2">Set new password</h1>
        <p className="text-sm text-[var(--color-charcoal)]/60 mb-6">Enter your new password below.</p>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 disabled:opacity-60 transition-all"
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
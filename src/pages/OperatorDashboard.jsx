import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { notify } from '../lib/notifications'

const OPERATOR_EMAILS = [
  'omijiemichael435@gmail.com' // add more operator emails here
]

function OperatorDashboard() {
  const { user, loading: userLoading } = useCurrentUser()
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [declineReason, setDeclineReason] = useState('')
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [decisionHistory, setDecisionHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Access control — only operator emails allowed
  const isOperator = user && OPERATOR_EMAILS.includes(user.email)

  const fetchApplications = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      let query = supabase
        .from('verification_applications')
        .select('*, profiles(full_name, farm_name, farm_region, location, phone_number, email)')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
      setFetchError('Failed to load applications. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDecisionHistory = async (applicationId) => {
    setHistoryLoading(true)
    try {
      const { data, error } = await supabase
        .from('verification_decisions')
        .select('*')
        .eq('application_id', applicationId)
        .order('decided_at', { ascending: false })

      if (error) throw error
      setDecisionHistory(data || [])
    } catch (err) {
      console.error('Error fetching decision history:', err)
      setDecisionHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (!userLoading && !isOperator) return
    fetchApplications()
  }, [filter, userLoading, isOperator])

  useEffect(() => {
    if (selectedApp) {
      fetchDecisionHistory(selectedApp.id)
    } else {
      setDecisionHistory([])
    }
  }, [selectedApp])

  const handleApprove = async (application) => {
    if (!user) {
      setActionError('You must be logged in to approve applications.')
      return
    }

    setActionSubmitting(true)
    setActionError(null)

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('verification_applications')
        .update({
          status: 'approved',
          decided_by: user.email,
          decided_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (updateError) throw updateError

      // INSERT decision record to preserve history
      const { error: decisionError } = await supabase
        .from('verification_decisions')
        .insert({
          application_id: application.id,
          farmer_id: application.farmer_id,
          decision: 'approved',
          decided_by: user.email,
        })

      if (decisionError) throw decisionError

      notify.success(`${application.profiles?.full_name} approved`)
      setSelectedApp(null)
      setShowDeclineForm(false)
      setDeclineReason('')
      fetchApplications()
    } catch (err) {
      setActionError('Failed to approve: ' + err.message)
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleDecline = async (application) => {
    if (!user) {
      setActionError('You must be logged in to decline applications.')
      return
    }

    // Server-side decline reason check
    if (!declineReason.trim()) {
      setActionError('A reason is required to decline an application.')
      return
    }

    setActionSubmitting(true)
    setActionError(null)

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('verification_applications')
        .update({
          status: 'declined',
          decline_reason: declineReason,
          decided_by: user.email,
          decided_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (updateError) throw updateError

      // INSERT decision record to preserve history
      const { error: decisionError } = await supabase
        .from('verification_decisions')
        .insert({
          application_id: application.id,
          farmer_id: application.farmer_id,
          decision: 'declined',
          decline_reason: declineReason,
          decided_by: user.email,
        })

      if (decisionError) throw decisionError

      notify.success('Application declined')
      setSelectedApp(null)
      setShowDeclineForm(false)
      setDeclineReason('')
      fetchApplications()
    } catch (err) {
      setActionError('Failed to decline: ' + err.message)
    } finally {
      setActionSubmitting(false)
    }
  }

  const statusColor = (status) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
    if (status === 'approved') return 'bg-green-100 text-green-700'
    if (status === 'declined') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  const statusLabel = (status) => {
    if (status === 'pending') return 'Pending'
    if (status === 'approved') return '✓ Approved'
    if (status === 'declined') return 'Declined'
    return status
  }

  // Loading state
  if (userLoading) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )

  // Access control — not logged in
  if (!user) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-charcoal)]/60 mb-4">You must be logged in to access this page.</p>
        <Link to="/auth" className="text-[var(--color-primary)] underline font-semibold">Go to Login</Link>
      </div>
    </div>
  )

  // Access control — wrong role
  if (!isOperator) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🚫</p>
        <p className="font-bold text-[var(--color-charcoal)] mb-2">Access Denied</p>
        <p className="text-sm text-[var(--color-charcoal)]/60 mb-4">You do not have permission to access this page.</p>
        <Link to="/" className="text-[var(--color-primary)] underline font-semibold">Go Home</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">

      {/* Header */}
      <header className="bg-[var(--color-primary-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
              AgriMatch
            </Link>
            <p className="text-white/70 text-sm font-semibold">Operator Dashboard</p>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-white/60 hidden sm:inline">{user?.email}</span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-xs font-semibold text-white border-2 border-white/40 px-3 py-1.5 rounded-lg hover:text-white/80 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-charcoal)] mb-2">
            Verification Applications
          </h1>
          <p className="text-sm text-[var(--color-charcoal)]/60">
            Review farmer verification requests. Every decision is recorded.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['pending', 'approved', 'declined', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedApp(null) }}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === f
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white border-2 border-black/10 text-[var(--color-charcoal)]/60 hover:border-[var(--color-primary)]/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

          {/* Applications list */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-[var(--color-charcoal)]/50">Loading applications...</p>
            ) : fetchError ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <p className="text-sm text-red-700 font-medium mb-3">{fetchError}</p>
                <button
                  onClick={fetchApplications}
                  className="text-sm font-bold text-red-700 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-black/10 p-8 text-center">
                <p className="text-sm text-[var(--color-charcoal)]/50">No {filter === 'all' ? '' : filter} applications.</p>
              </div>
            ) : (
              applications.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setSelectedApp(app)
                    setShowDeclineForm(false)
                    setDeclineReason('')
                    setActionError(null)
                  }}
                  className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                    selectedApp?.id === app.id
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                      : 'border-black/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-[var(--color-charcoal)]">{app.profiles?.full_name}</p>
                      <p className="text-xs text-[var(--color-charcoal)]/60 mt-1">{app.farm_name} · {app.farm_region}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${statusColor(app.status)}`}>
                      {statusLabel(app.status)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-charcoal)]/50">
                    Submitted {new Date(app.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {app.decided_at && (
                    <p className="text-xs text-[var(--color-charcoal)]/40 mt-1">
                      Decided by {app.decided_by} · {new Date(app.decided_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Application detail */}
          <div>
            {!selectedApp ? (
              <div className="bg-white rounded-xl border-2 border-black/10 p-8 text-center">
                <p className="text-sm text-[var(--color-charcoal)]/50">Select an application to review</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-xl border-2 border-black/10 p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-wide text-[var(--color-charcoal)]/50 uppercase mb-1">Application</p>
                      <h2 className="text-2xl font-bold text-[var(--color-charcoal)]">{selectedApp.profiles?.full_name}</h2>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${statusColor(selectedApp.status)}`}>
                      {statusLabel(selectedApp.status)}
                    </span>
                  </div>

                  {/* Farm details */}
                  <div className="border-t border-black/10 pt-5 space-y-3">
                    <p className="text-xs font-bold tracking-wide text-[var(--color-charcoal)]/50 uppercase">Farm Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[var(--color-charcoal)]/50">Farm Name</p>
                        <p className="text-sm font-semibold text-[var(--color-charcoal)] mt-1">{selectedApp.farm_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-charcoal)]/50">Region</p>
                        <p className="text-sm font-semibold text-[var(--color-charcoal)] mt-1">{selectedApp.farm_region}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-charcoal)]/50">Contact</p>
                        <p className="text-sm font-semibold text-[var(--color-charcoal)] mt-1">{selectedApp.profiles?.phone_number || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-charcoal)]/50">Email</p>
                        <p className="text-sm font-semibold text-[var(--color-charcoal)] mt-1">{selectedApp.profiles?.email || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Photo evidence */}
                  {selectedApp.evidence_url && (
                    <div className="border-t border-black/10 pt-5">
                      <p className="text-xs font-bold tracking-wide text-[var(--color-charcoal)]/50 uppercase mb-3">Farm Photo Evidence</p>
                      <div className="rounded-xl overflow-hidden border-2 border-black/10">
                        <img
                          src={selectedApp.evidence_url}
                          alt="Farm evidence"
                          className="w-full h-56 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Decision history — preserved across multiple decisions */}
                  <div className="border-t border-black/10 pt-5">
                    <p className="text-xs font-bold tracking-wide text-[var(--color-charcoal)]/50 uppercase mb-3">Decision History</p>
                    {historyLoading ? (
                      <p className="text-xs text-[var(--color-charcoal)]/40">Loading history...</p>
                    ) : decisionHistory.length === 0 ? (
                      <p className="text-xs text-[var(--color-charcoal)]/40">No decisions recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {decisionHistory.map((d) => (
                          <div key={d.id} className="bg-[var(--color-background-warm)] rounded-lg p-4 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusColor(d.decision)}`}>
                                {statusLabel(d.decision)}
                              </span>
                              <p className="text-xs text-[var(--color-charcoal)]/40">
                                {new Date(d.decided_at).toLocaleString('en-NG')}
                              </p>
                            </div>
                            <p className="text-xs text-[var(--color-charcoal)]/70">By: {d.decided_by}</p>
                            {d.decline_reason && (
                              <p className="text-xs text-[var(--color-charcoal)]/70">Reason: {d.decline_reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Decline reason form */}
                  {showDeclineForm && (
                    <div className="border-t border-black/10 pt-5">
                      <label className="text-xs font-bold tracking-wide text-[var(--color-charcoal)]/70 uppercase">
                        Reason for Declining <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        rows={3}
                        className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white resize-none"
                        placeholder="e.g. Photo evidence does not clearly show a farm. Please resubmit with a clearer photo."
                      />
                    </div>
                  )}

                  {actionError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-700 font-medium">{actionError}</p>
                    </div>
                  )}

                  {/* Action buttons — only show for pending */}
                  {selectedApp.status === 'pending' && (
                    <div className="border-t border-black/10 pt-5 space-y-3">
                      <button
                        onClick={() => handleApprove(selectedApp)}
                        disabled={actionSubmitting}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        {actionSubmitting ? 'Saving...' : '✓ Approve'}
                      </button>

                      {!showDeclineForm ? (
                        <button
                          onClick={() => setShowDeclineForm(true)}
                          disabled={actionSubmitting}
                          className="w-full border-2 border-red-200 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                          Decline
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDecline(selectedApp)}
                            disabled={actionSubmitting}
                            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
                          >
                            {actionSubmitting ? 'Saving...' : 'Confirm Decline'}
                          </button>
                          <button
                            onClick={() => { setShowDeclineForm(false); setDeclineReason(''); setActionError(null) }}
                            className="flex-1 border-2 border-black/20 text-[var(--color-charcoal)] py-3 rounded-lg font-bold hover:bg-black/5 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default OperatorDashboard
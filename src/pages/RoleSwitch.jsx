import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { useActiveRole } from '../lib/useActiveRole'

const ROLES = [
  { id: 'farmer', label: 'Farmer', emoji: '🌾', desc: 'List harvests, manage sales' },
  { id: 'buyer', label: 'Buyer', emoji: '🛒', desc: 'Browse produce, make purchases' },
  { id: 'transporter', label: 'Transporter', emoji: '🚛', desc: 'Manage deliveries, logistics' },
]

function RoleSwitch() {
  const navigate = useNavigate()
  const { user, loading } = useCurrentUser()
  const [_, setActiveRole] = useActiveRole()

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )

  if (!user) {
    navigate('/auth')
    return null
  }

  const handleSelectRole = (roleId) => {
    setActiveRole(roleId)
    if (roleId === 'farmer') navigate('/dashboard')
    else if (roleId === 'buyer') navigate('/marketplace')
    else navigate('/logistics')
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-8">
          <p className="font-[var(--font-heading)] italic text-3xl text-[var(--color-primary)] mb-2">
            AgriMatch
          </p>
          <h1 className="text-2xl font-bold text-[var(--color-charcoal)] mb-2">
            What would you like to do?
          </h1>
          <p className="text-[var(--color-charcoal)]/60 text-sm">
            Logged in as {user?.full_name}
          </p>
        </div>

        <div className="space-y-3">
          {ROLES.map((role, i) => (
            <motion.button
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-5 border-2 border-black/10 rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all text-left bg-white shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{role.emoji}</span>
                <div>
                  <p className="font-bold text-lg text-[var(--color-charcoal)]">{role.label}</p>
                  <p className="text-sm text-[var(--color-charcoal)]/60 mt-0.5">{role.desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            navigate('/')
          }}
          className="mt-8 text-sm text-[var(--color-charcoal)]/50 hover:text-[var(--color-charcoal)] transition-colors"
        >
          Sign out
        </button>
      </motion.div>
    </div>
  )
}

export default RoleSwitch
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { useActiveRole } from '../lib/useActiveRole'

function FarmerIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 10 10" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10" />
      <path d="M12 8v4l3 3" />
      <path d="M5 3l4 4" />
      <path d="M3 9h4" />
      <path d="M7 21l2-4" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function BuyerIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function TransporterIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v4h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

const ROLES = [
  {
    id: 'farmer',
    label: 'Farmer',
    desc: 'List harvests, manage sales',
    Icon: FarmerIcon,
    color: 'text-[var(--color-primary)]',
    bg: 'bg-[var(--color-primary-light)]/30',
  },
  {
    id: 'buyer',
    label: 'Buyer',
    desc: 'Browse produce, make purchases',
    Icon: BuyerIcon,
    color: 'text-[var(--color-secondary-dark)]',
    bg: 'bg-[var(--color-secondary-light)]/25',
  },
  {
    id: 'transporter',
    label: 'Transporter',
    desc: 'Manage deliveries, logistics',
    Icon: TransporterIcon,
    color: 'text-[var(--color-moss)]',
    bg: 'bg-[var(--color-moss)]/15',
  },
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
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <p className="font-[var(--font-heading)] italic text-3xl text-[var(--color-primary)] mb-2">
            AgriMatch
          </p>
          <h1 className="text-2xl font-bold text-[var(--color-charcoal)] mb-2">
            What would you like to do?
          </h1>
          <p className="text-[var(--color-charcoal)]/60 text-sm">
            Welcome back, <span className="font-semibold">{user?.full_name}</span>
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
              className="w-full p-5 border-2 border-black/10 rounded-xl hover:border-[var(--color-primary)] hover:shadow-md transition-all text-left bg-white shadow-sm group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${role.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${role.color}`}>
                  <role.Icon />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-[var(--color-charcoal)]">{role.label}</p>
                  <p className="text-sm text-[var(--color-charcoal)]/60 mt-0.5">{role.desc}</p>
                </div>
                <svg
                  className="w-5 h-5 text-[var(--color-charcoal)]/30 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all"
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            navigate('/')
          }}
          className="mt-8 w-full text-sm text-[var(--color-charcoal)]/40 hover:text-[var(--color-charcoal)] transition-colors text-center"
        >
          Sign out
        </button>
      </motion.div>
    </div>
  )
}

export default RoleSwitch
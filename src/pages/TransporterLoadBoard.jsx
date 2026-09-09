import { notify } from '../lib/notifications'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

function PhotoUploadModal({ title, onClose, onSubmit, submitting }) {
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const handleSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setPhotoPreview(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-2">{title}</h2>
        <p className="text-sm text-[var(--color-charcoal)]/60 mb-4">
          Upload a photo confirming produce condition before continuing.
        </p>

        {photoPreview ? (
          <div className="relative rounded-lg overflow-hidden border-2 border-[var(--color-primary)] mb-4">
            <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
              className="absolute top-2 right-2 bg-[var(--color-secondary-dark)] text-white px-2 py-1 rounded text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <label className="block border-2 border-dashed border-black/15 rounded-lg p-4 text-center cursor-pointer hover:border-[var(--color-primary)] transition-all">
              <input type="file" accept="image/*" capture="environment" onChange={handleSelect} className="hidden" />
              <span className="text-2xl mb-1 block">📷</span>
              <p className="text-xs font-semibold text-[var(--color-charcoal)]/80">Take Photo</p>
            </label>
            <label className="block border-2 border-dashed border-black/15 rounded-lg p-4 text-center cursor-pointer hover:border-[var(--color-primary)] transition-all">
              <input type="file" accept="image/*" onChange={handleSelect} className="hidden" />
              <span className="text-2xl mb-1 block">🖼️</span>
              <p className="text-xs font-semibold text-[var(--color-charcoal)]/80">Upload from Gallery</p>
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-black/10 py-2.5 rounded-lg font-semibold text-[var(--color-charcoal)]/70 hover:bg-black/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(photoFile)}
            disabled={!photoFile || submitting}
            className="flex-1 bg-[var(--color-primary)] text-white py-2.5 rounded-lg font-semibold hover:brightness-95 disabled:opacity-60 transition-all"
          >
            {submitting ? 'Uploading...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadCard({ order, onAccept, onOpenPhotoModal, isMyJob }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-black/10 rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-[var(--color-surface)] overflow-hidden">
        <img
          src={order.listings?.image_url}
          alt={order.listings?.crop_type}
          loading="lazy" className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-charcoal)]">
          {isMyJob ? order.status : 'Awaiting Pickup'}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)]">
            {order.listings?.crop_type}
          </h3>
          <p className="font-[var(--font-heading)] text-xl text-[var(--color-primary)] whitespace-nowrap flex-shrink-0">
            ₦{Number(order.total_price).toLocaleString()}
          </p>
        </div>

        <p className="text-sm text-[var(--color-charcoal)]/60 mb-2">
          📍 {order.listings?.location} · {order.quantity}kg
        </p>

        <p className="text-sm text-[var(--color-charcoal)]/70 mb-4">
          From <span className="font-semibold">{order.listings?.profiles?.full_name}</span> — pickup and deliver to buyer.
        </p>

        <div className="border-t border-black/5 pt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-charcoal)]/40 font-mono">
            REF: {order.id.slice(0, 8).toUpperCase()}
          </p>

          {isMyJob ? (
            <div className="flex gap-2 flex-shrink-0">
              {order.status === 'confirmed' && (
                <button
                  onClick={() => onOpenPhotoModal(order, 'pickup')}
                  className="bg-[var(--color-secondary)] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  📷 Pickup Photo
                </button>
              )}
              {order.status === 'in_transit' && (
                <button
                  onClick={() => onOpenPhotoModal(order, 'delivery')}
                  className="bg-[var(--color-primary)] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  📷 Delivery Photo
                </button>
              )}
              {order.status === 'delivered' && (
                <span className="text-sm font-bold text-[var(--color-primary)]">✓ Completed</span>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAccept(order.id)}
              className="bg-[var(--color-primary)] text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap flex-shrink-0"
            >
              Accept Load
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TransporterLoadBoard() {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [orders, setOrders] = useState([])
  const [view, setView] = useState('available')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [photoModal, setPhotoModal] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [checkingReg, setCheckingReg] = useState(true)

  useEffect(() => {
    async function checkRegistration() {
      if (!user) return
      const { data } = await supabase
        .from('transporters')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      setIsRegistered(!!data)
      setCheckingReg(false)
    }
    if (user) checkRegistration()
  }, [user])

  async function fetchOrders() {
    if (!user) return
    setLoading(true)

    let query = supabase
      .from('orders')
      .select('*, listings(crop_type, location, image_url, quantity, profiles(full_name))')
      .order('created_at', { ascending: false })

    if (view === 'available') {
      query = query.eq('status', 'confirmed').is('transporter_id', null)
    } else {
      query = query.eq('transporter_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      setError(error.message)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchOrders()
  }, [view, user])

  const handleAccept = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ transporter_id: user.id, status: 'in_transit' })
      .eq('id', orderId)

    if (error) {
      notify.error('Failed to accept load')
    } else {
      notify.success('Load accepted! Check "My Jobs"')
      setView('myJobs')
    }
  }

  const handlePhotoSubmit = async (photoFile) => {
    if (!photoFile || !photoModal) return
    setUploadingPhoto(true)

    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${photoModal.order.id}-${photoModal.type}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('produce-images')
      .upload(fileName, photoFile)

    if (uploadError) {
      notify.error('Photo upload failed')
      setUploadingPhoto(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('produce-images')
      .getPublicUrl(fileName)

    const photoUrl = publicUrlData.publicUrl
    const newStatus = photoModal.type === 'pickup' ? 'in_transit' : 'delivered'
    const photoColumn = photoModal.type === 'pickup' ? 'pickup_photo_url' : 'delivery_photo_url'

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        [photoColumn]: photoUrl,
        status: newStatus,
      })
      .eq('id', photoModal.order.id)

    setUploadingPhoto(false)

    if (updateError) {
      notify.error('Failed to update order status')
    } else {
      notify.success(
        photoModal.type === 'pickup'
          ? 'Pickup confirmed! Order marked as in transit.'
          : 'Delivery confirmed! Order marked as delivered.'
      )
      setPhotoModal(null)
      fetchOrders()
    }
  }

  if (userLoading || checkingReg) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-charcoal)]/60 mb-4">Please log in as a transporter to accept loads.</p>
        <Link to="/auth" className="text-[var(--color-primary)] underline font-semibold">Go to Login</Link>
      </div>
    </div>
  )

  if (!isRegistered) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[var(--color-primary-light)]/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚛</span>
        </div>
        <h2 className="font-[var(--font-heading)] text-3xl text-[var(--color-charcoal)] mb-4">
          Register as a Transporter
        </h2>
        <p className="text-[var(--color-charcoal)]/70 mb-8">
          You need to complete your transporter profile before you can accept loads.
        </p>
        <Link
          to="/transporter-registration"
          className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg font-bold hover:brightness-95 transition-all"
        >
          Complete Registration →
        </Link>
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
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <button
                onClick={() => window.history.back()}
                className="text-white/80 hover:text-white transition-colors font-semibold"
              >
                ← Back
              </button>
              <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
              <span className="pb-2 border-b-2 border-white text-white">Logistics</span>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="text-xs sm:text-sm text-white/60 hidden sm:inline">
                {user?.full_name}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-xs sm:text-sm font-semibold text-white hover:text-white/80 transition-colors border-2 border-white/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-3 sm:mb-4">
              {view === 'available' ? 'Available' : 'My Active'}{' '}
              <span className="italic text-[var(--color-primary)]">Loads</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md">
              {view === 'available'
                ? 'Discover and secure high-value delivery jobs across Nigeria.'
                : 'Your accepted deliveries. Upload photos to advance each order.'}
            </p>
          </motion.div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setView('available')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                view === 'available'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)]'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setView('myJobs')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                view === 'myJobs'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)]'
              }`}
            >
              My Jobs
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-[var(--color-charcoal)]/60 py-12">Loading loads...</p>}
        {error && <p className="text-center text-red-600 py-12">Error: {error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-charcoal)]/60 text-lg">
              {view === 'available' ? 'No available loads right now.' : 'No active jobs yet.'}
            </p>
            {view === 'myJobs' && (
              <button
                onClick={() => setView('available')}
                className="mt-4 text-[var(--color-primary)] underline font-semibold"
              >
                Browse available loads →
              </button>
            )}
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {orders.map((order) => (
              <LoadCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onOpenPhotoModal={(order, type) => setPhotoModal({ order, type })}
                isMyJob={view === 'myJobs'}
              />
            ))}
          </div>
        )}
      </main>

      {photoModal && (
        <PhotoUploadModal
          title={photoModal.type === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery'}
          onClose={() => setPhotoModal(null)}
          onSubmit={handlePhotoSubmit}
          submitting={uploadingPhoto}
        />
      )}

      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-[var(--color-charcoal)]/60 mt-12 sm:mt-16">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Benin City, Edo State.</p>
      </footer>
    </div>
  )
}

export default TransporterLoadBoard
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { isListingExpired } from '../lib/listingHelpers'
import { notify } from '../lib/notifications'
import ChatWindow from '../components/ChatWindow'
import ConversationList from '../components/ConversationList'
import FarmerOrders from '../components/FarmerOrders'
import ConfirmModal from '../components/ConfirmModal'
import { MarketIcon, MessagesIcon, OrdersIcon, LogisticsIcon } from '../components/NavIcons'

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
  { id: 'Future Harvest', label: 'Future Harvest (choose date)' },
]

const REGIONS = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun',
  'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
]

function FarmerDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: userLoading } = useCurrentUser()

  // Existing states
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes')
  const [freshness, setFreshness] = useState('Harvested Today')
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [myListings, setMyListings] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatName, setChatName] = useState('')
  const [listingCount, setListingCount] = useState(0)
  const [editingListing, setEditingListing] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [newListingId, setNewListingId] = useState(null)
  const [showOrderNotification, setShowOrderNotification] = useState(false)
  const [newOrderMessage, setNewOrderMessage] = useState('')
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [isFirstListing, setIsFirstListing] = useState(false)

  // New states for farm profile
  const [userProfile, setUserProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editFarmName, setEditFarmName] = useState('')
  const [editFarmRegion, setEditFarmRegion] = useState('')
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [profileError, setProfileError] = useState(null)

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setImagePreview(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handlePublish = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    let imageUrl = CROPS.find((c) => c.id === selectedCrop)?.image

    if (imageFile) {
      setUploading(true)
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('produce-images')
        .upload(fileName, imageFile)

      setUploading(false)

      if (uploadError) {
        notify.error('Image upload failed: ' + uploadError.message)
        setError(uploadError.message)
        setSubmitting(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('produce-images')
        .getPublicUrl(fileName)

      imageUrl = publicUrlData.publicUrl
    }

    const { data: newListing, error } = await supabase
      .from('listings')
      .insert({
        farmer_id: user.id,
        crop_type: selectedCrop,
        quantity: Number(quantity),
        price_per_unit: Number(price),
        location: pickupLocation,
        freshness,
        image_url: imageUrl,
        expected_harvest_date: freshness === 'Future Harvest' ? expectedHarvestDate : null,
      })
      .select()
      .single()

    setSubmitting(false)

    if (error) {
      notify.error('Failed to publish listing')
      setError(error.message)
    } else {
      notify.success('Listing published! Buyers can see it now.')
      setSuccess(true)
      setNewListingId(newListing.id)
      setQuantity('')
      setPrice('')
      setPickupLocation('')
      setImageFile(null)
      setImagePreview(null)
      setExpectedHarvestDate('')
      setTimeout(() => {
        setSuccess(false)
        setNewListingId(null)
      }, 5000)
    }
  }

  const startEdit = (listing) => {
    setEditingListing(listing.id)
    setEditQuantity(listing.quantity)
    setEditPrice(listing.price_per_unit)
  }

  const cancelEdit = () => {
    setEditingListing(null)
    setEditQuantity('')
    setEditPrice('')
  }

  const saveEdit = async (listingId) => {
    const { error } = await supabase
      .from('listings')
      .update({
        quantity: Number(editQuantity),
        price_per_unit: Number(editPrice),
      })
      .eq('id', listingId)

    if (error) {
      notify.error('Failed to update listing')
    } else {
      notify.success('Listing updated!')
      setMyListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? { ...l, quantity: Number(editQuantity), price_per_unit: Number(editPrice) }
            : l
        )
      )
      cancelEdit()
    }
  }

  const deleteListing = async (listingId) => {
    setDeletingId(listingId)
    const { error } = await supabase.from('listings').delete().eq('id', listingId)
    if (error) {
      notify.error('Failed to delete listing')
    } else {
      notify.success('Listing deleted')
      setMyListings((prev) => prev.filter((l) => l.id !== listingId))
      setListingCount((prev) => prev - 1)
    }
    setDeletingId(null)
    setConfirmDelete(null)
  }

  // Fetch user profile from profiles table
  const fetchUserProfile = async () => {
    if (!user) return
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, farm_name, farm_region, location, phone_number, is_profile_complete')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserProfile(data)
      
      // Pre-fill edit form with current data
      setEditFarmName(data?.farm_name || '')
      setEditFarmRegion(data?.farm_region || '')
    } catch (err) {
      console.error('Error fetching profile:', err)
      setProfileError('Failed to load profile')
    } finally {
      setProfileLoading(false)
    }
  }

  // Save farm profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSubmitting(true)
    setProfileError(null)

    if (!editFarmName.trim()) {
      setProfileError('Farm name is required')
      setProfileSubmitting(false)
      return
    }

    if (!editFarmRegion) {
      setProfileError('Farm region is required')
      setProfileSubmitting(false)
      return
    }

    try {
            const { error } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    email: user.email,
    role: 'farmer',
    farm_name: editFarmName,
    farm_region: editFarmRegion,
    is_profile_complete: true,
  }, { onConflict: 'id' })

      if (error) throw error

      notify.success('Farm profile updated!')
      setUserProfile({
        ...userProfile,
        farm_name: editFarmName,
        farm_region: editFarmRegion,
        is_profile_complete: true,
      })
      setEditingProfile(false)
    } catch (err) {
      setProfileError('Failed to update profile: ' + err.message)
    } finally {
      setProfileSubmitting(false)
    }
  }

  useEffect(() => {
    if (!user) return

    // Fetch profile
    fetchUserProfile()

    async function fetchMyListings() {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })
      setMyListings(data || [])
      setListingCount(data?.length || 0)
      setIsFirstListing(data?.length === 0)
    }
    fetchMyListings()

    const ordersChannel = supabase
      .channel('farmer-new-orders')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          setNewOrderMessage('🎉 New order received!')
          setShowOrderNotification(true)
          setTimeout(() => setShowOrderNotification(false), 4000)
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'listings', filter: `farmer_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.quantity === 0 && payload.old.quantity > 0) {
            setNewOrderMessage(`${payload.new.crop_type} listing is now sold out!`)
            setShowOrderNotification(true)
            setTimeout(() => setShowOrderNotification(false), 4000)
          }
          setMyListings((prev) =>
            prev.map((l) => (l.id === payload.new.id ? { ...l, quantity: payload.new.quantity } : l))
          )
        }
      )
      .subscribe()

    return () => supabase.removeChannel(ordersChannel)
  }, [user, success])

  useEffect(() => {
    if (!user) return

    async function fetchBadges() {
      const { data: msgs } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('read', false)
      setUnreadMessages(msgs?.length || 0)

      const { data: listings } = await supabase
        .from('listings')
        .select('id')
        .eq('farmer_id', user.id)

      if (listings?.length) {
        const listingIds = listings.map((l) => l.id)
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .in('listing_id', listingIds)
          .eq('status', 'pending')
        setPendingOrders(orders?.length || 0)
      }
    }
    fetchBadges()

    const channel = supabase
      .channel('farmer-badges')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchBadges())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => fetchBadges())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  useEffect(() => {
    if (showChat || selectedChat) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showChat, selectedChat])

  if (userLoading) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <p className="text-[var(--color-charcoal)]/60">Loading your dashboard...</p>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-charcoal)]/60 mb-4">Please log in to access the farmer dashboard.</p>
        <Link to="/auth" className="text-[var(--color-primary)] underline font-semibold">Go to Login</Link>
      </div>
    </div>
  )

  // Check if profile is incomplete
  const isProfileIncomplete = !userProfile?.farm_name || !userProfile?.farm_region

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      {/* Header */}
      <header className="bg-[var(--color-primary-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
              AgriMatch
            </Link>
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white transition-colors font-semibold">
                ← Back
              </button>
              <button onClick={() => navigate('/role-switch')} className="text-white/80 hover:text-white transition-colors font-semibold">
                Switch Role
              </button>
              <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </Link>
              <button
                onClick={() => setShowChat(true)}
                className="relative text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Messages
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[var(--color-secondary)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
              <Link to="/logistics" className="text-white/80 hover:text-white transition-colors">Logistics</Link>
              <button
                onClick={() => navigate('/buyer-orders')}
                className="relative text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Orders
                {pendingOrders > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[var(--color-secondary)] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingOrders}
                  </span>
                )}
              </button>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="text-xs sm:text-sm text-white/60 hidden sm:inline">{user?.full_name}</span>
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

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 z-40 flex items-center justify-around px-2 py-3">
          <Link
            to="/marketplace"
            className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/marketplace' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
          >
            <MarketIcon />Market
          </Link>
          <button
            onClick={() => setShowChat(true)}
            className="relative flex flex-col items-center gap-1 text-xs text-[var(--color-charcoal)]/60"
          >
            <MessagesIcon />Messages
            {unreadMessages > 0 && (
              <span className="absolute -top-1 right-1 bg-[var(--color-secondary)] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
          <Link
            to="/buyer-orders"
            className={`relative flex flex-col items-center gap-1 text-xs ${location.pathname === '/buyer-orders' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
          >
            <OrdersIcon />Orders
            {pendingOrders > 0 && (
              <span className="absolute -top-1 right-1 bg-[var(--color-secondary)] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingOrders}
              </span>
            )}
          </Link>
          <Link
            to="/logistics"
            className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/logistics' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
          >
            <LogisticsIcon />Logistics
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12 pb-24 md:pb-12">
        {/* INCOMPLETE PROFILE ALERT */}
        {isProfileIncomplete && !profileLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-4"
          >
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-yellow-800">Complete Your Farm Profile</p>
              <p className="text-xs text-yellow-700 mt-1">
                Buyers need to know about your farm. Add your farm name and region to start building trust.
              </p>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="text-xs font-bold text-white bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors flex-shrink-0 whitespace-nowrap"
            >
              Complete Now
            </button>
          </motion.div>
        )}

        {/* FARM PROFILE CARD */}
        {!profileLoading && userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 bg-white rounded-xl border-2 border-black/10 p-6 sm:p-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold tracking-wide text-[var(--color-charcoal)]/70 uppercase mb-2">Your Farm</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)]">
                  {userProfile.farm_name || 'Unnamed Farm'}
                </h2>
                <div className="flex flex-col gap-2 mt-3 text-sm text-[var(--color-charcoal)]/70">
                  <p>Region: <span className="font-semibold text-[var(--color-charcoal)]">{userProfile.farm_region || 'Not specified'}</span></p>
                  <p>Location: <span className="font-semibold text-[var(--color-charcoal)]">{userProfile.location || 'Not specified'}</span></p>
                  <p>Contact: <span className="font-semibold text-[var(--color-charcoal)]">{userProfile.phone_number || 'Not specified'}</span></p>
                </div>
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] border-2 border-[var(--color-primary)] px-4 py-2 rounded-lg transition-colors flex-shrink-0"
              >
                Edit Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* EDIT PROFILE MODAL */}
        {editingProfile && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-4">Edit Farm Profile</h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold tracking-wide text-[var(--color-charcoal)]/70 uppercase">Farm Name</label>
                  <input
                    type="text"
                    required
                    value={editFarmName}
                    onChange={(e) => setEditFarmName(e.target.value)}
                    className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                    placeholder="Your farm name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold tracking-wide text-[var(--color-charcoal)]/70 uppercase">Farm Region</label>
                  <select
                    required
                    value={editFarmRegion}
                    onChange={(e) => setEditFarmRegion(e.target.value)}
                    className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {profileError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700 font-medium">{profileError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={profileSubmitting}
                    className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {profileSubmitting ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="flex-1 border-2 border-[var(--color-charcoal)]/20 text-[var(--color-charcoal)] py-3 rounded-lg font-bold hover:bg-black/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-3 sm:mb-4">
                List your fresh <span className="text-[var(--color-primary)] italic">harvest.</span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md">
                Direct access to Nigerian retailers and bulk buyers. No middlemen, fair prices.
              </p>
            </motion.div>

            {/* Onboarding tooltip for first-time farmers */}
            {isFirstListing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--color-secondary)]/10 border-2 border-[var(--color-secondary)]/30 rounded-xl p-4 flex items-start gap-3"
              >
                <span className="text-2xl flex-shrink-0">👋</span>
                <div>
                  <p className="font-bold text-sm text-[var(--color-secondary-dark)]">Welcome to AgriMatch!</p>
                  <p className="text-xs text-[var(--color-charcoal)]/70 mt-1">
                    You have no listings yet. Start below — fill in your crop details and click <strong>Publish Listing</strong> to get your first harvest in front of buyers.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handlePublish} className="space-y-6 sm:space-y-8">
              {/* 1. Crop Selection */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-3 sm:mb-5">
                  1. What are you selling?
                </label>
                {isFirstListing && (
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -top-2 -right-2 text-[var(--color-secondary)] text-xl"
                  >
                    👆
                  </motion.div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  {CROPS.map((crop) => (
                    <button
                      type="button"
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className={`group rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedCrop === crop.id
                          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-lg'
                          : 'border-black/10 hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="aspect-square bg-[var(--color-surface)] overflow-hidden">
                        <img
                          loading="lazy"
                          src={crop.image}
                          alt={crop.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="px-2 sm:px-4 py-2 sm:py-3 bg-white text-center">
                        <p className={`text-xs sm:text-sm font-semibold transition-colors ${
                          selectedCrop === crop.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/70'
                        }`}>
                          {crop.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                  2. Upload photo (optional)
                </label>
                {imagePreview ? (
                  <div className="relative rounded-lg sm:rounded-xl overflow-hidden border-2 border-[var(--color-primary)]">
                    <img loading="lazy" src={imagePreview} alt="Preview" className="w-full h-40 sm:h-64 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null) }}
                      className="absolute top-2 right-2 bg-[var(--color-secondary-dark)] text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold hover:brightness-95 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-black/15 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200">
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    <p className="text-xs sm:text-sm font-semibold text-[var(--color-charcoal)]/80">Click to upload photo</p>
                    <p className="text-xs text-[var(--color-charcoal)]/50 mt-1">High-quality photos get more buyers</p>
                  </label>
                )}
              </div>

              {/* REST OF FORM CONTINUES BELOW */}
              {/* 3 & 4. Quantity & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                    3. Quantity (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                    4. Price per kg (₦)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* 5. Freshness */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                  5. Freshness
                </label>
                <select
                  required
                  value={freshness}
                  onChange={(e) => setFreshness(e.target.value)}
                  className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                >
                  {FRESHNESS_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>

              {freshness === 'Future Harvest' && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                  />
                </div>
              )}

              {/* 6. Pickup Location */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                  6. Pickup location
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all bg-white"
                  placeholder="e.g., Main farm gate, Jos"
                />
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
                  <p className="text-sm text-[var(--color-primary-dark)] font-medium">✓ Listing published! Buyers can see it now.</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-[var(--color-primary)] text-white py-4 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 text-base sm:text-lg"
              >
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </button>
            </form>

            {/* My Listings */}
            {myListings.length > 0 && (
              <div className="space-y-6 sm:space-y-8 mt-12 sm:mt-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)]">
                  Your Listings ({listingCount})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {myListings.map((listing) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all ${
                        newListingId === listing.id
                          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-lg'
                          : 'border-black/10'
                      } bg-white`}
                    >
                      {listing.image_url && (
                        <img loading="lazy" src={listing.image_url} alt={listing.crop_type} className="w-full h-40 object-cover" />
                      )}

                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-[var(--color-charcoal)]">{listing.crop_type}</h3>
                            <p className="text-xs text-[var(--color-charcoal)]/60 mt-1">{listing.freshness}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            isListingExpired(listing)
                              ? 'bg-red-100 text-red-700'
                              : listing.quantity === 0
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {isListingExpired(listing) ? 'Expired' : listing.quantity === 0 ? 'Sold out' : `${listing.quantity}kg left`}
                          </span>
                        </div>

                        <p className="text-sm text-[var(--color-charcoal)]/70 mb-3">₦{listing.price_per_unit}/kg</p>

                        {editingListing === listing.id ? (
                          <div className="space-y-2 mb-3 bg-[var(--color-primary)]/5 p-3 rounded-lg">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                                className="text-xs border-2 border-black/10 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-primary)]"
                                placeholder="Qty"
                              />
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="text-xs border-2 border-black/10 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-primary)]"
                                placeholder="Price"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(listing.id)}
                                className="flex-1 text-xs font-bold bg-[var(--color-primary)] text-white py-1 rounded hover:brightness-95 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 text-xs font-bold border-2 border-black/20 py-1 rounded hover:bg-black/5 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(listing)}
                              className="flex-1 text-xs font-bold text-[var(--color-primary)] border-2 border-[var(--color-primary)] py-2 rounded hover:bg-[var(--color-primary)]/5 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setConfirmDelete(listing.id)}
                              className="flex-1 text-xs font-bold text-red-600 border-2 border-red-200 py-2 rounded hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <FarmerOrders />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showChat && (
        <ChatWindow
          onClose={() => setShowChat(false)}
          onSelectConversation={(conversation) => {
            setSelectedChat(conversation)
            setShowChat(false)
          }}
        />
      )}

      {selectedChat && (
        <ConversationList
          conversation={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}

      {showOrderNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-8 right-8 bg-[var(--color-secondary)] text-white px-6 py-4 rounded-lg font-semibold shadow-lg"
        >
          {newOrderMessage}
        </motion.div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Listing"
          message="Are you sure you want to delete this listing? This action cannot be undone."
          onConfirm={() => deleteListing(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

export default FarmerDashboard
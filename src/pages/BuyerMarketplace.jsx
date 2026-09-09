import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { getRecommended } from '../lib/matching'
import { isListingExpired } from '../lib/listingHelpers'
import { notify } from '../lib/notifications'
import FarmerMap from '../components/FarmerMap'
import ChatWindow from '../components/ChatWindow'
import ConversationList from '../components/ConversationList'
import SkeletonCard from '../components/SkeletonCard'
import { HomeIcon, OrdersIcon, LogisticsIcon, SwitchIcon } from '../components/NavIcons'

const CROP_TYPES = ['Tomatoes', 'Peppers', 'Garden Eggs', 'Okra']
const REGIONS = [
  'Plateau', 'Lagos', 'Kano', 'Abuja', 'FCT Abuja', 'Kaduna', 'Enugu',
  'Oyo', 'Rivers', 'Delta', 'Edo', 'Anambra', 'Imo', 'Abia',
  'Cross River', 'Benue', 'Nasarawa', 'Niger', 'Kwara', 'Kogi',
  'Bauchi', 'Gombe', 'Adamawa', 'Borno', 'Yobe', 'Sokoto',
  'Kebbi', 'Zamfara', 'Katsina', 'Jigawa', 'Taraba', 'Bayelsa',
  'Akwa Ibom', 'Ebonyi', 'Ekiti', 'Ondo', 'Osun', 'Ogun'
]

function ListingCard({ listing, onMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
    >
      <div className="relative h-40 bg-[var(--color-surface)] overflow-hidden">
        <img
          loading="lazy"
          src={listing.image_url}
          alt={listing.crop_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {listing.freshness === 'Harvested Today' && (
          <span className="absolute top-2 left-2 bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            FRESH TODAY
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)]">
          {listing.crop_type}
        </h3>
        <p className="text-sm text-[var(--color-charcoal)]/60 mt-1">
          {listing.quantity}kg · ₦{Number(listing.price_per_unit).toLocaleString()}/kg
        </p>
        <p className="text-xs text-[var(--color-charcoal)]/50 mt-2">
          📍 {listing.location}
        </p>
        <div className="mt-3 pt-3 border-t border-black/5">
          <p className="text-xs font-medium text-[var(--color-charcoal)]/80">
            {listing.profiles?.full_name}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <Link
            to={`/product/${listing.id}`}
            className="block w-full bg-[var(--color-secondary)] text-white px-4 py-2 rounded-md text-sm font-medium text-center hover:brightness-95 transition-all active:scale-[0.98]"
          >
            View & Order
          </Link>
          <button
            onClick={() => onMessage(listing)}
            className="w-full border border-[var(--color-primary)] text-[var(--color-primary)] px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--color-primary)]/5 transition-all"
          >
            Message Farmer
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function BuyerMarketplace() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useCurrentUser()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [showChat, setShowChat] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatName, setChatName] = useState('')
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [newOrders, setNewOrders] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [pullStart, setPullStart] = useState(null)
  const [pulling, setPulling] = useState(false)

  const fetchListings = useCallback(async () => {
    try {
      let query = supabase
        .from('listings')
        .select('*, profiles(full_name)')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (selectedCrop) query = query.eq('crop_type', selectedCrop)
      if (selectedLocation) query = query.ilike('location', `%${selectedLocation}%`)

      const { data, error } = await query

      if (error) {
        notify.error('Failed to load listings')
        setError(error.message)
      } else {
        let filtered = data.filter(
          (listing) =>
            Number(listing.price_per_unit) >= priceRange[0] &&
            Number(listing.price_per_unit) <= priceRange[1] &&
            !isListingExpired(listing) &&
            listing.quantity > 0
        )

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (listing) =>
              listing.crop_type?.toLowerCase().includes(q) ||
              listing.location?.toLowerCase().includes(q) ||
              listing.freshness?.toLowerCase().includes(q) ||
              listing.profiles?.full_name?.toLowerCase().includes(q)
          )
        }

        setListings(filtered)
        setError(null)
      }
    } catch (err) {
      notify.error('Something went wrong loading listings')
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedCrop, selectedLocation, priceRange, searchQuery])

  useEffect(() => {
    setLoading(true)
    fetchListings()

    const listingsChannel = supabase
      .channel('marketplace-listings')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        () => fetchListings()
      )
      .subscribe()

    return () => supabase.removeChannel(listingsChannel)
  }, [fetchListings])

  useEffect(() => {
    if (!user) return

    async function fetchUnread() {
      const { data: msgs } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('read', false)
      setUnreadMessages(msgs?.length || 0)

      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('status', 'confirmed')
      setNewOrders(orders?.length || 0)
    }
    fetchUnread()

    const channel = supabase
      .channel('buyer-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchUnread())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => fetchUnread())
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

  // Pull to refresh
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setPullStart(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e) => {
    if (!pullStart) return
    const diff = e.touches[0].clientY - pullStart
    if (diff > 60) setPulling(true)
  }

  const handleTouchEnd = () => {
    if (pulling) {
      setRefreshing(true)
      fetchListings()
      notify.info('Refreshing listings...')
    }
    setPullStart(null)
    setPulling(false)
  }

  const resetFilters = () => {
    setSelectedCrop('')
    setSelectedLocation('')
    setPriceRange([0, 500000])
    setSearchQuery('')
  }

  const activeFilterCount = [selectedCrop, selectedLocation].filter(Boolean).length

  const openChat = (listing) => {
    setSelectedChat(listing.farmer_id)
    setChatName(listing.profiles?.full_name)
    setShowChat(true)
  }

  const recommended = !selectedCrop && !selectedLocation && !searchQuery && listings.length > 3
    ? getRecommended(listings, 3)
    : []

  return (
    <div
      className="min-h-screen bg-[var(--color-background-warm)]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pulling && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
          <div className="bg-[var(--color-primary)] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
            Release to refresh ↓
          </div>
        </div>
      )}

      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
          <div className="bg-[var(--color-primary)] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-pulse">
            Refreshing...
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-primary-dark)] backdrop-blur-sm border-b border-black/10">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-white">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <span className="text-white/90 border-b-2 border-white pb-1">Marketplace</span>
          <Link to="/buyer-orders" className="text-white/70 hover:text-white relative transition-colors">
            My Orders
            {newOrders > 0 && (
              <span className="absolute -top-2 -right-3 bg-[var(--color-secondary)] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {newOrders}
              </span>
            )}
          </Link>
          <Link to="/dashboard" className="text-white/70 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/logistics" className="text-white/70 hover:text-white transition-colors">Logistics</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user && <span className="text-xs text-white/50 hidden sm:inline">Hi, {user?.full_name}</span>}
          {user && (
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="text-xs border border-white/30 text-white/80 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              Log Out
            </button>
          )}
          {!user && (
            <Link to="/auth" className="text-xs border border-white/30 text-white/80 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">
              Log In
            </Link>
          )}
        </div>

        {/* Mobile bottom nav with active states */}
        {user && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 z-40 flex items-center justify-around px-2 py-3">
  <Link
    to="/dashboard"
    className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/dashboard' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
  >
    <HomeIcon />Dashboard
  </Link>
  <Link
    to="/buyer-orders"
    className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/buyer-orders' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
  >
    <OrdersIcon />Orders
  </Link>
  <Link
    to="/logistics"
    className={`flex flex-col items-center gap-1 text-xs ${location.pathname === '/logistics' ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)]/60'}`}
  >
    <LogisticsIcon />Logistics
  </Link>
  <button
    onClick={() => navigate('/role-switch')}
    className="flex flex-col items-center gap-1 text-xs text-[var(--color-charcoal)]/60"
  >
    <SwitchIcon />Switch
  </button>
</nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-10 pb-24 md:pb-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">Marketplace</h1>
            <p className="mt-1 text-[var(--color-charcoal)]/60 text-sm">
              Browse fresh produce from verified farmers across Nigeria.
            </p>

            <div className="mt-4 flex gap-2 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search produce, location, farmer..."
                className="flex-1 border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 text-sm text-[var(--color-charcoal)]/60 hover:text-[var(--color-charcoal)] border border-black/10 rounded-lg bg-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <Link
              to="/bulk-order"
              className="inline-block mt-3 text-sm font-semibold text-[var(--color-primary)] underline hover:no-underline"
            >
              Need a large quantity? Request a bulk order →
            </Link>
          </div>

          <div className="flex gap-2 flex-shrink-0 flex-wrap mt-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden relative px-4 py-2 border border-black/10 rounded-md text-sm font-medium hover:bg-black/5 transition-colors"
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-secondary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/70'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                viewMode === 'map'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/70'
              }`}
            >
              Map
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${showFilters ? 'block' : 'hidden'} md:block md:col-span-1 space-y-6`}
          >
            <div className="bg-white rounded-lg p-5 space-y-5 shadow-sm">
              <div>
                <label className="text-xs font-semibold tracking-wide text-[var(--color-charcoal)]/50 uppercase">Crop Type</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="mt-2 w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all bg-white"
                >
                  <option value="">All Crops</option>
                  {CROP_TYPES.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wide text-[var(--color-charcoal)]/50 uppercase">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="mt-2 w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all bg-white"
                >
                  <option value="">All Locations</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wide text-[var(--color-charcoal)]/50 uppercase">
                  Max Price: ₦{priceRange[1].toLocaleString()}/kg
                </label>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="mt-3 w-full h-2 bg-[var(--color-surface)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
              </div>

              {(activeFilterCount > 0 || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="w-full py-2 border border-black/10 text-[var(--color-charcoal)]/70 rounded-md text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  Reset All
                </button>
              )}
            </div>
          </motion.aside>

          <div className="md:col-span-3">
            {/* Skeleton loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">⚠️</p>
                <p className="text-[var(--color-charcoal)]/60 mb-4">Failed to load listings.</p>
                <button
                  onClick={() => { setLoading(true); fetchListings() }}
                  className="text-[var(--color-primary)] font-semibold underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && listings.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🌾</p>
                <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-2">
                  No produce found
                </h3>
                <p className="text-[var(--color-charcoal)]/60 text-sm mb-6">
                  {searchQuery
                    ? `No listings found for "${searchQuery}"`
                    : 'No listings match your filters right now.'}
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-lg font-semibold hover:brightness-95 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && !error && listings.length > 0 && viewMode === 'map' && (
              <FarmerMap listings={listings} />
            )}

            {!loading && !error && listings.length > 0 && viewMode === 'list' && (
              <>
                {recommended.length > 0 && (
                  <div className="mb-8">
                    <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-4">
                      ✨ Recommended for You
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommended.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} onMessage={openChat} />
                      ))}
                    </div>
                    <div className="mt-8 border-t border-black/5" />
                  </div>
                )}

                {searchQuery && (
                  <p className="text-sm text-[var(--color-charcoal)]/60 mb-4">
                    {listings.length} result{listings.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} onMessage={openChat} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-black/10 px-6 md:px-10 py-12 text-center mt-16 bg-[var(--color-background-warm)]">
        <div className="max-w-2xl mx-auto">
          <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
          <div className="my-4 h-px bg-black/10" />
          <p className="text-[var(--color-charcoal)]/60 text-sm leading-relaxed mb-4">
            Empowering the backbone of Nigeria's economy through technology that respects the soil.
          </p>
          <p className="text-[var(--color-charcoal)]/40 text-xs tracking-wide">
            © 2026 AgriMatch · Benin City, Edo State
          </p>
        </div>
      </footer>

      {!showChat && !selectedChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 w-14 h-14 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center shadow-lg hover:brightness-95 transition-all z-[9999]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--color-secondary-dark)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </button>
      )}

      {(showChat || selectedChat) && (
        <div className="hidden md:block fixed right-6 bottom-6 z-50 w-96 shadow-2xl rounded-lg overflow-hidden" style={{ height: '480px' }}>
          {!selectedChat ? (
            <ConversationList
              currentUser={user}
              onSelectConversation={(id, name) => { setSelectedChat(id); setChatName(name) }}
              onClose={() => { setShowChat(false); setSelectedChat(null) }}
            />
          ) : (
            <ChatWindow
              conversationWith={selectedChat}
              conversationName={chatName}
              currentUser={user}
              onClose={() => { setSelectedChat(null); setShowChat(false) }}
            />
          )}
        </div>
      )}

      {(showChat || selectedChat) && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) { setShowChat(false); setSelectedChat(null) } }}>
          <div className="flex flex-col bg-white rounded-t-2xl overflow-hidden mt-auto" style={{ height: '85dvh' }}>
            {!selectedChat ? (
              <ConversationList
                currentUser={user}
                onSelectConversation={(id, name) => { setSelectedChat(id); setChatName(name) }}
                onClose={() => { setShowChat(false); setSelectedChat(null) }}
              />
            ) : (
              <ChatWindow
                conversationWith={selectedChat}
                conversationName={chatName}
                currentUser={user}
                onClose={() => { setSelectedChat(null); setShowChat(false) }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerMarketplace
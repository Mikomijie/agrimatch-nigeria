import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

function FarmerOrders() {
  const { user } = useCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    if (!user) return
    const { data: listings } = await supabase
      .from('listings')
      .select('id')
      .eq('farmer_id', user.id)

    if (!listings?.length) {
      setOrders([])
      setLoading(false)
      return
    }

    const listingIds = listings.map(l => l.id)
    const { data } = await supabase
      .from('orders')
      .select('*, listings(crop_type, quantity, price_per_unit)')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    if (!error) fetchOrders()
  }

  if (loading) return <p className="text-center text-gray-500 text-sm py-4">Loading orders...</p>

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
      <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Orders Received</h2>

      {orders.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-500 text-center py-6">No orders yet.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map((order) => (
            <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {order.listings?.crop_type}
                  </p>
                  <p className="text-xs text-gray-600">
                    {order.quantity}kg · ₦{Number(order.total_price).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      className="mt-2 block text-xs bg-[#1B5E20] text-white px-2 py-1 rounded hover:brightness-95"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FarmerOrders
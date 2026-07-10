import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import RequestTransportModal from './RequestTransportModal'

const STATUS_FLOW = ['pending', 'confirmed', 'in_transit', 'delivered']

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_transit: 'In Transit',
  delivered: 'Delivered',
}

const NEXT_ACTION_LABEL = {
  pending: 'Confirm Order',
  confirmed: 'Mark In Transit',
  in_transit: 'Mark Delivered',
}

function FarmerOrders({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [transportModal, setTransportModal] = useState(null)
  const [requestedOrders, setRequestedOrders] = useState([])

  useEffect(() => {
    if (!user) return
    fetchOrders()

    // Realtime: refresh when a new order comes in for this farmer's listings
    const channel = supabase
      .channel('farmer-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, listings!inner(crop_type, location, image_url, farmer_id), users!orders_buyer_id_fkey(name, phone)')
      .eq('listings.farmer_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setOrders(data || [])
    }

    // Check which orders already have transport requests
    const { data: requests } = await supabase
      .from('transport_requests')
      .select('order_id')
      .eq('farmer_id', user.id)

    if (requests) {
      setRequestedOrders(requests.map((r) => r.order_id))
    }

    setLoading(false)
  }
  async function advanceStatus(order) {
    const currentIndex = STATUS_FLOW.indexOf(order.status)
    const nextStatus = STATUS_FLOW[currentIndex + 1]
    if (!nextStatus) return

    setUpdatingId(order.id)
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', order.id)

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
      )
    }
    setUpdatingId(null)
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length

  if (loading) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
        <p className="text-sm text-gray-500 text-center py-4">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="font-bold text-base sm:text-lg text-gray-900">Orders Received</h2>
        {pendingCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {pendingCount} new
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-500 text-center py-6">
          No orders yet. Orders placed on your listings will appear here.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map((order) => {
            const nextLabel = NEXT_ACTION_LABEL[order.status]
            return (
              <div
                key={order.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={order.listings?.image_url}
                    alt={order.listings?.crop_type}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {order.listings?.crop_type} · {order.quantity}kg
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      Buyer: {order.users?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-600">
                      GH₵{Number(order.total_price).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : order.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'in_transit'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {nextLabel && (
                  <button
                    onClick={() => advanceStatus(order)}
                    disabled={updatingId === order.id}
                    className="mt-3 w-full bg-[#1B5E20] text-white text-xs font-semibold py-2 rounded hover:brightness-95 transition-all disabled:opacity-50"
                  >
                    {updatingId === order.id ? 'Updating...' : nextLabel}
                  </button>
                )}

                {order.status === 'confirmed' && (
                  <button
                    onClick={() => setTransportModal(order)}
                    disabled={requestedOrders.includes(order.id)}
                    className="mt-2 w-full border-2 border-[#1B5E20] text-[#1B5E20] text-xs font-semibold py-2 rounded hover:bg-[#E8F5E9] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestedOrders.includes(order.id) ? '✓ Transport Requested' : '🚚 Request Transport'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>

    {transportModal && (
      <RequestTransportModal
        order={transportModal}
        user={user}
        onClose={() => setTransportModal(null)}
        onSuccess={() => {
          setRequestedOrders((prev) => [...prev, transportModal.id])
        }}
      />
    )}
  )
}

export default FarmerOrders
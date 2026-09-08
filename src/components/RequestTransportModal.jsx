import { supabase } from '../lib/supabaseClient'
import { notify } from '../lib/notifications'

function RequestTransportModal({ order, user, onClose, onSuccess }) {
  const handleConfirm = async () => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'in_transit' })
      .eq('id', order.id)

    if (error) {
      notify.error('Failed to update order')
    } else {
      notify.success('Order marked as in transit!')
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white p-5 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Confirm Transport</h2>
            <p className="text-green-100 text-xs mt-0.5">
              {order.listings?.crop_type} · {order.quantity}kg · {order.listings?.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[#E8F5E9] rounded-lg p-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Order Summary</p>
            <p className="text-sm font-semibold text-gray-800">
              {order.listings?.crop_type} — {order.quantity}kg
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Pickup: {order.listings?.location}
            </p>
            <p className="text-xs text-gray-600">
              Value: ₦{Number(order.total_price).toLocaleString()}
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Confirming this will mark the order as in transit and notify the buyer.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-[#1B5E20] text-white py-2.5 rounded-lg text-sm font-semibold hover:brightness-95 transition-all"
            >
              Confirm Transport
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestTransportModal
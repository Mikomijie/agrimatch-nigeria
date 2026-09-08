import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { sendEmail, orderConfirmedEmail, newOrderFarmerEmail } from '../lib/sendbyteClient'

function PaymentCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    async function confirmPayment() {
      const status = searchParams.get('status')
      const txRef = searchParams.get('tx_ref')
      const transactionId = searchParams.get('transaction_id')

      if (!txRef || !txRef.startsWith('AGRIMATCH-')) {
        setError('Invalid payment reference.')
        return
      }

      const orderId = txRef.replace('AGRIMATCH-', '')

      if (status === 'successful' || status === 'completed') {
        const { data: orderData, error: fetchError } = await supabase
          .from('orders')
          .select('listing_id, quantity')
          .eq('id', orderId)
          .single()

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_ref: transactionId,
            status: 'confirmed',
          })
          .eq('id', orderId)

        if (updateError) {
          setError(updateError.message)
          return
        }

        if (!fetchError && orderData) {
          const { data: listingData } = await supabase
            .from('listings')
            .select('quantity')
            .eq('id', orderData.listing_id)
            .single()

          if (listingData) {
            await supabase
              .from('listings')
              .update({
                quantity: Math.max(0, listingData.quantity - orderData.quantity)
              })
              .eq('id', orderData.listing_id)
          }
        }

        // Send emails via SendByte
        const { data: fullOrder } = await supabase
          .from('orders')
          .select('*, listings(crop_type, profiles(full_name, email)), buyer:buyer_id(full_name, email)')
          .eq('id', orderId)
          .single()

        if (fullOrder) {
          const buyerEmail = fullOrder.buyer?.email
          const farmerEmail = fullOrder.listings?.profiles?.email
          const buyerName = fullOrder.buyer?.full_name
          const farmerName = fullOrder.listings?.profiles?.full_name
          const cropType = fullOrder.listings?.crop_type
          const quantity = fullOrder.quantity
          const total = fullOrder.total_price

          if (buyerEmail) {
            const { subject, html } = orderConfirmedEmail({
              buyerName,
              farmerName,
              cropType,
              quantity,
              total,
              orderId,
            })
            await sendEmail({ to: buyerEmail, subject, html })
          }

          if (farmerEmail) {
            const { subject, html } = newOrderFarmerEmail({
              farmerName,
              buyerName,
              cropType,
              quantity,
              total,
              orderId,
            })
            await sendEmail({ to: farmerEmail, subject, html })
          }
        }

        navigate(`/tracking/${orderId}`)
      } else {
        setError('Payment was not completed. Please try again.')
      }
    }

    confirmPayment()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center px-6">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">✕</span>
            </div>
            <p className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)] mb-3">
              Payment Issue
            </p>
            <p className="text-[var(--color-charcoal)]/70 mb-6">{error}</p>
            <Link
              to="/marketplace"
              className="text-[var(--color-primary)] underline font-semibold"
            >
              Back to Marketplace
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-[var(--color-primary-light)]/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-[var(--color-primary)] text-2xl">⏳</span>
            </div>
            <p className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)] mb-2">
              Confirming your payment...
            </p>
            <p className="text-[var(--color-charcoal)]/60 text-sm">
              Please don't close this page.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback
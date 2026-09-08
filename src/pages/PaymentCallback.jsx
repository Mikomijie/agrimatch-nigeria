import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { sendEmail, orderConfirmedEmail, newOrderFarmerEmail } from '../lib/sendbyteClient'

function Confetti() {
  const pieces = Array.from({ length: 30 })
  const colors = ['#1F5C3F', '#D97D4A', '#96D4AF', '#FE9A65', '#7A9B6E']

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}

function PaymentCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

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
            const { subject, html } = orderConfirmedEmail({ buyerName, farmerName, cropType, quantity, total, orderId })
            await sendEmail({ to: buyerEmail, subject, html })
          }

          if (farmerEmail) {
            const { subject, html } = newOrderFarmerEmail({ farmerName, buyerName, cropType, quantity, total, orderId })
            await sendEmail({ to: farmerEmail, subject, html })
          }
        }

        // Show success animation then redirect
        setSuccess(true)

        let count = 3
        const timer = setInterval(() => {
          count -= 1
          setCountdown(count)
          if (count === 0) {
            clearInterval(timer)
            navigate(`/tracking/${orderId}`)
          }
        }, 1000)

      } else {
        setError('Payment was not completed. Please try again.')
      }
    }

    confirmPayment()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-4xl">✕</span>
            </div>
            <p className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)] mb-3">
              Payment Issue
            </p>
            <p className="text-[var(--color-charcoal)]/70 mb-8">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/marketplace"
                className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-lg font-bold hover:bg-[var(--color-primary)]/5 transition-all"
              >
                Back to Marketplace
              </Link>
              <Link
                to="/buyer-orders"
                className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-bold hover:brightness-95 transition-all"
              >
                My Orders
              </Link>
            </div>
          </motion.div>
        ) : success ? (
          <>
            <Confetti />
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="text-center max-w-md"
            >
              <motion.div
                className="w-24 h-24 bg-[var(--color-primary-light)]/30 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 2, duration: 0.4 }}
              >
                <span className="text-5xl">✅</span>
              </motion.div>
              <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-charcoal)] mb-3">
                Payment Successful!
              </h1>
              <p className="text-[var(--color-charcoal)]/70 mb-2">
                Your order has been confirmed. The farmer has been notified.
              </p>
              <p className="text-sm text-[var(--color-charcoal)]/50 mb-8">
                A confirmation email has been sent to you.
              </p>
              <div className="bg-white rounded-xl p-4 border border-black/10 mb-6">
                <p className="text-sm text-[var(--color-charcoal)]/60">
                  Redirecting to order tracking in
                </p>
                <motion.p
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-[var(--font-heading)] text-4xl text-[var(--color-primary)] font-bold"
                >
                  {countdown}
                </motion.p>
              </div>
              <p className="text-xs text-[var(--color-charcoal)]/40">
                Check your email for order confirmation details.
              </p>
            </motion.div>
          </>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              className="w-16 h-16 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <p className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)] mb-2">
              Confirming your payment...
            </p>
            <p className="text-[var(--color-charcoal)]/60 text-sm">
              Please don't close this page.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PaymentCallback
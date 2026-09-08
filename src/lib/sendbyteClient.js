export async function sendEmail({ to, subject, html }) {
  try {
    const response = await fetch('/api/sendbyte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('SendByte error:', error)
    return { error: error.message }
  }
}

export function orderConfirmedEmail({ buyerName, farmerName, cropType, quantity, total, orderId }) {
  return {
    subject: `✅ Order Confirmed — ${cropType} from ${farmerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1F5C3F; font-size: 24px; margin-bottom: 8px;">Order Confirmed</h1>
        <p style="color: #555; margin-bottom: 24px;">Hi ${buyerName}, your order has been confirmed and payment received.</p>

        <div style="background: #F6F3F2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0;"><strong>Crop:</strong> ${cropType}</p>
          <p style="margin: 0 0 8px 0;"><strong>Quantity:</strong> ${quantity}kg</p>
          <p style="margin: 0 0 8px 0;"><strong>Farmer:</strong> ${farmerName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Total Paid:</strong> ₦${Number(total).toLocaleString()}</p>
          <p style="margin: 0;"><strong>Order ID:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
        </div>

        <p style="color: #555;">Your produce is being prepared for delivery. You can track your order in the AgriMatch app.</p>

        <a href="https://agrimatch.pxxl.pro/tracking/${orderId}"
          style="display: inline-block; margin-top: 16px; background: #1F5C3F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Track My Order
        </a>

        <p style="color: #999; font-size: 12px; margin-top: 32px;">© 2026 AgriMatch · Jos Regional Hub, Plateau State</p>
      </div>
    `
  }
}

export function newOrderFarmerEmail({ farmerName, buyerName, cropType, quantity, total, orderId }) {
  return {
    subject: `🎉 New Order — ${quantity}kg ${cropType}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1F5C3F; font-size: 24px; margin-bottom: 8px;">You Have a New Order!</h1>
        <p style="color: #555; margin-bottom: 24px;">Hi ${farmerName}, ${buyerName} has placed an order for your produce.</p>

        <div style="background: #F6F3F2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0;"><strong>Crop:</strong> ${cropType}</p>
          <p style="margin: 0 0 8px 0;"><strong>Quantity:</strong> ${quantity}kg</p>
          <p style="margin: 0 0 8px 0;"><strong>Buyer:</strong> ${buyerName}</p>
          <p style="margin: 0;"><strong>Total Value:</strong> ₦${Number(total).toLocaleString()}</p>
        </div>

        <p style="color: #555;">Log in to AgriMatch to confirm this order and arrange pickup.</p>

        <a href="https://agrimatch.pxxl.pro/dashboard"
          style="display: inline-block; margin-top: 16px; background: #1F5C3F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          View My Dashboard
        </a>

        <p style="color: #999; font-size: 12px; margin-top: 32px;">© 2026 AgriMatch · Jos Regional Hub, Plateau State</p>
      </div>
    `
  }
}
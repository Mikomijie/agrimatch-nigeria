# AgriMatch

Nigeria loses over 40% of harvested produce annually. Not from bad farming but from broken market linkages. Farmers have no guaranteed buyers before harvest. Middlemen take 60% of value. Buyers cannot verify quality or track delivery. Generic marketplaces only handle listings.

AgriMatch solves trust, logistics, and value chain coordination in one platform.

## What Makes AgriMatch Different

Most agricultural platforms in Nigeria are listing boards. You post produce, someone calls you, and you figure out the rest. AgriMatch coordinates the entire transaction from listing to delivery confirmation.

**Escrow payments.** Buyers pay into Flutterwave escrow. Farmers receive funds only after the buyer physically confirms delivery quality. No cash risk on either side.

**Order pooling.** A buyer needing 500kg but no single farmer has that much gets automatically matched across multiple verified farmers. One order, multiple sources, zero coordination overhead.

**Future harvest pre-orders.** Farmers list crops that have not been harvested yet. Buyers reserve and pay in advance. Farmers know their income before touching a hoe.

**Verified transport with photo proof.** Transporters upload a pickup photo before moving produce and a delivery photo on arrival. No more disputes about whether produce arrived or what condition it was in.

**USSD access.** Farmers in low connectivity areas can list produce and check orders via USSD the same way they check airtime balance. No smartphone required.

## How It Works

**For farmers.** Sign up as a farmer. List fresh produce or upcoming harvests with quantity, price, and pickup location. Receive orders directly on your dashboard. Assign a transporter for delivery. Receive payment after buyer confirms.

**For buyers.** Browse verified listings across Nigeria. Place orders and pay via Flutterwave escrow. Track your delivery in real time with transporter photo updates. Confirm quality on arrival to release payment to the farmer. Leave a review.

**For transporters.** Register your vehicle and coverage area. Browse available loads on the load board. Accept a job, upload a pickup photo to start delivery, upload a delivery photo on arrival. Payment releases automatically after buyer confirms.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Payments | Flutterwave (escrow, card, mobile money, USSD) |
| Hosting | Pxxl |
| Analytics | Sabilytics |
| Email | SendByte |
| Maps | Leaflet, OpenStreetMap |

## AIB Ecosystem Integration

AgriMatch is built entirely on African infrastructure.

**Pxxl** handles all hosting and deployments. The app is served from Pxxl's edge network with zero dependence on AWS or Vercel.

**Sabilytics** tracks every user interaction including page views, orders placed, listings created, and message volume. The analytics dashboard shows real engagement data from real Nigerian users.

**SendByte** sends transactional email notifications. When an order is confirmed, the buyer receives an order confirmation email and the farmer receives a new order alert automatically.

## Local Development

Clone the repository and install dependencies:
npm install
Create a `.env` file in the project root:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
SENDBYTE_API_KEY=your_sendbyte_api_key


Start the development server:

npm run dev


## Database

The application uses six core tables in Supabase with Row Level Security enabled on all of them.

**profiles** stores user information and role (farmer, buyer, or transporter).

**listings** stores farmer produce listings including crop type, quantity, price, location, freshness, and expected harvest date for future harvests.

**orders** stores buyer orders with status tracking from pending through confirmed, in transit, delivered, and completed.

**messages** stores real time chat between farmers and buyers linked to specific orders.

**ratings** stores buyer reviews of farmers after delivery confirmation.

**transporters** stores transporter vehicle registration and coverage area.

## Business Model

AgriMatch earns a 3% commission on every completed order collected automatically through Flutterwave before funds are released to the farmer. Farmers pay nothing to list. Buyers pay a small logistics coordination fee per order. The model scales directly with transaction volume.

## Live Product

The live application is available at agrimatch-nigeria.pxxlspace.cv

## Built By

Michael Omijie, Benin City, Edo State, Nigeria.
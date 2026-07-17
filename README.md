# AgriMatch

Live Demo: https://agrimatch-nigeria.vercel.app/

AgriMatch is a farmer-to-buyer digital marketplace platform that connects smallholder vegetable farmers in Nigeria directly to buyers and transport providers, eliminating middlemen and reducing post-harvest losses. It focuses on the Jos Regional Hub in Plateau State, one of Nigeria's most important vegetable supply corridors.

---

## The Problem

Nigeria loses billions of dollars annually to post-harvest losses. Smallholder farmers growing tomatoes, peppers, garden eggs, okra, and leafy greens struggle to find buyers before their produce spoils. At the same time, buyers cannot easily identify trusted suppliers, compare prices, or coordinate timely delivery. Transporters operate without a system to match loads efficiently.

AgriMatch addresses all three sides of this problem in a single platform.

---

## Features

### Farmer
- Registration and profile creation with Nigerian phone number and state
- Produce listings with photos, quantity, price in Naira, pickup location, and freshness status
- Inventory management with edit and delete controls
- Real-time order notifications
- In-app messaging with buyers
- USSD simulator for farmers without smartphone access

### Buyer
- Registration and profile creation
- Marketplace with filtering by crop type, location, and price range
- Interactive map view showing farmer locations across Plateau State
- Direct messaging with farmers for negotiation
- Order placement with quantity selection and automatic logistics fee calculation
- Mobile Money payment via Flutterwave with escrow protection
- Real-time order tracking across four delivery stages
- Delivery confirmation and farmer rating system

### Transporter
- Registration and profile creation
- Available loads board showing orders awaiting pickup
- Load acceptance and status updates from in transit to delivered
- Job history tracking

---

## Bonus Features

**USSD Simulator** — Farmers without smartphones can list produce by dialing a USSD code. The simulator replicates this experience in the browser, accepts keypad input, submits directly to the same database as the web app, and reads each screen aloud to support non-literate users. A production version would use local-language audio in Hausa, Yoruba, or Igbo.

**Escrow Payments** — Funds paid by buyers are held securely and only released to the farmer once the buyer confirms delivery and quality.

**Smart Market Insights** — The farmer dashboard displays live market trend information for the Jos Hub to help farmers price competitively.

**Geolocation Map** — The marketplace includes a map view powered by Leaflet and OpenStreetMap, showing the exact location of each farmer's produce.

---

## Tech Stack

- React with React Router and Framer Motion
- Supabase for database, authentication, and real-time subscriptions
- Flutterwave for Mobile Money payment integration
- Leaflet for geolocation and mapping
- Tailwind CSS for styling
- Vercel for deployment

---

## Demo Accounts

To test the platform, register as a Farmer, Buyer, or Transporter using the signup flow. Each role has a dedicated dashboard and workflow.

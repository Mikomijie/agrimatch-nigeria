import ProductDetail from './pages/ProductDetail'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FarmerDashboard from './pages/FarmerDashboard'
import Landing from './pages/Landing'
import BuyerMarketplace from './pages/BuyerMarketplace'
import OrderTracking from './pages/OrderTracking'
import TransporterLoadBoard from './pages/TransporterLoadBoard'
import RatingsReviews from './pages/RatingsReviews'
import USSDSimulator from './pages/USSDSimulator'
import Auth from './pages/Auth'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<FarmerDashboard />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/marketplace" element={<BuyerMarketplace />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/logistics" element={<TransporterLoadBoard />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/reviews" element={<RatingsReviews />} />
        <Route path="/ussd" element={<USSDSimulator />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
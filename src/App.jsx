import ProductDetail from './pages/ProductDetail'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FarmerDashboard from './pages/FarmerDashboard'
import Landing from './pages/Landing'
import BuyerMarketplace from './pages/BuyerMarketplace'
import OrderTracking from './pages/OrderTracking'
import TransporterLoadBoard from './pages/TransporterLoadBoard'
import FarmerRegistration from './pages/FarmerRegistration'
import RatingsReviews from './pages/RatingsReviews'
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
        <Route path="/register" element={<FarmerRegistration />} />
        <Route path="/reviews" element={<RatingsReviews />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
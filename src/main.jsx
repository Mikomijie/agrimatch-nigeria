import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Load Sabilytics analytics with environment-specific domain
const setupAnalytics = () => {
  const analyticsDomain = import.meta.env.VITE_ANALYTICS_DOMAIN || 'agrimatch-nigeria.pxxlspace.cv'
  
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://www.sabilytics.com/script.js'
  script.setAttribute('data-site', 'zzw9xwhwnrii')
  script.setAttribute('data-domain', analyticsDomain)
  document.head.appendChild(script)
}

// Run analytics setup before mounting React
setupAnalytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './metrics.css'
import './dashboard-overrides.css'
import './public-payment.css'
import './studio.css'
import './public-refine.css'
import './payment-skeleton.css'
import './home.css'
import './loading.css'
import './paylink.css'
import './dashboard-enhancements.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { DashboardApp } from './pages/DashboardApp'
import { PublicPaymentV3 } from './pages/PublicPaymentV3'
import { LegalPage } from './pages/LegalPage'
import { PayLinkHome } from './pages/PayLinkHome'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PayLinkHome/>}/>
      <Route path="/login" element={<AuthPage/>}/>
      <Route path="/dashboard" element={<DashboardApp/>}/>
      <Route path="/p/:slug" element={<PublicPaymentV3/>}/>
      <Route path="/legal/:type" element={<LegalPage/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}

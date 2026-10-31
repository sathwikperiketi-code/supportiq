import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowUpRight, LoaderCircle } from 'lucide-react'
import { Dashboard } from './App'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { AuthPage, LandingPage, LegalPlaceholder } from './PublicPages'
import { isDemoMode } from './supabase'
import './public.css'

function ProtectedDashboard() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading && !isDemoMode) {
    return <div className="route-loading" role="status"><LoaderCircle className="route-spinner" size={22} /> Restoring your session…</div>
  }
  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Dashboard />
}

function NotFound() {
  return <main className="route-loading"><div><h1>Page not found</h1><p>This page doesn’t exist.</p><Link to="/">Return to SupportIQ <ArrowUpRight size={15} /></Link></div></main>
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/signup" element={<AuthPage mode="signup" />} />
    <Route path="/forgot-password" element={<AuthPage mode="forgot-password" />} />
    <Route path="/reset-password" element={<AuthPage mode="reset-password" />} />
    <Route path="/dashboard" element={<ProtectedDashboard />} />
    <Route path="/app" element={<Navigate to="/dashboard" replace />} />
    <Route path="/index.html" element={<Navigate to="/" replace />} />
    <Route path="/privacy" element={<LegalPlaceholder page="privacy" />} />
    <Route path="/terms" element={<LegalPlaceholder page="terms" />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>
}

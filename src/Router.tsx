import { useEffect, useState } from 'react'
import { ArrowUpRight, LoaderCircle } from 'lucide-react'
import { Dashboard } from './App'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { AuthPage, LandingPage, LegalPlaceholder } from './PublicPages'
import { isDemoMode } from './supabase'
import './public.css'

function RouteContent() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/+$/, '') || '/')
  const { user, loading } = useAuth()

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname.replace(/\/+$/, '') || '/')
    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  useEffect(() => {
    if (loading) return
    if (path === '/app' && !user && !isDemoMode) {
      window.history.replaceState(null, '', '/login')
      setPath('/login')
    } else if ((path === '/login' || path === '/signup') && user) {
      window.history.replaceState(null, '', '/app')
      setPath('/app')
    }
  }, [path, user, loading])

  if (path === '/app') {
    if (loading && !isDemoMode) return <div className="route-loading" role="status"><LoaderCircle className="route-spinner" size={22} /> Restoring your session…</div>
    if (!user && !isDemoMode) return <div className="route-loading"><a href="/login">Continue to login <ArrowUpRight size={15} /></a></div>
    return <Dashboard />
  }
  if (path === '/login') return <AuthPage mode="login" />
  if (path === '/signup') return <AuthPage mode="signup" />
  if (path === '/forgot-password') return <AuthPage mode="forgot-password" />
  if (path === '/reset-password') return <AuthPage mode="reset-password" />
  if (path === '/privacy') return <LegalPlaceholder page="privacy" />
  if (path === '/terms') return <LegalPlaceholder page="terms" />
  return <LandingPage />
}

export default function App() {
  return <AuthProvider><RouteContent /></AuthProvider>
}

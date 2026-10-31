import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from './auth-context'
import { supabase } from './supabase'

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'Email or password is incorrect.'
  if (normalized.includes('email not confirmed')) return 'Please verify your email before signing in.'
  if (normalized.includes('user already registered')) return 'An account already exists for this email. Try signing in instead.'
  if (normalized.includes('password should be at least')) return 'Choose a longer password that meets the requirements.'
  if (normalized.includes('rate limit')) return 'Too many attempts. Please wait a few minutes and try again.'
  return message
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the app.')
  }
  return supabase
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializationError, setInitializationError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession)
        setLoading(false)
      }
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setInitializationError(authErrorMessage(error.message))
      else setSession(data.session)
      setLoading(false)
    }).catch(error => {
      if (!active) return
      setInitializationError(error instanceof Error ? error.message : 'Unable to restore your session.')
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    initializationError,
    signIn: async (email, password) => {
      const { error } = await requireSupabase().auth.signInWithPassword({ email, password })
      if (error) throw new Error(authErrorMessage(error.message))
    },
    signUp: async (name, email, password) => {
      const { data, error } = await requireSupabase().auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      })
      if (error) throw new Error(authErrorMessage(error.message))
      return { session: data.session, user: data.user }
    },
    signOut: async () => {
      const { error } = await requireSupabase().auth.signOut()
      if (error) throw new Error(authErrorMessage(error.message))
    },
    requestPasswordReset: async email => {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw new Error(authErrorMessage(error.message))
    },
    updatePassword: async password => {
      const { error } = await requireSupabase().auth.updateUser({ password })
      if (error) throw new Error(authErrorMessage(error.message))
    },
  }), [session, loading, initializationError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

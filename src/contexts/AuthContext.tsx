import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentSession, signInWithEmail, signOut as signOutService } from '@/services/authService'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<Session | null>
  signOut: () => Promise<void>
  setError: (value: string | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tracks an in-flight explicit auth operation (signIn/signOut) so the
  // onAuthStateChange listener does not race and overwrite its result.
  const authOpRef = useRef<{ type: 'signIn' | 'signOut' } | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializeSession = async () => {
      try {
        const { session: currentSession } = await getCurrentSession()

        if (!isMounted) {
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (authError) {
        if (!isMounted) {
          return
        }

        setError(authError instanceof Error ? authError.message : 'Não foi possível recuperar a sessão.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void initializeSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // During an explicit signIn/signOut the returned session is the source
      // of truth. Ignore listener events so they cannot clobber that result.
      if (authOpRef.current) {
        return
      }

      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setError(null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    authOpRef.current = { type: 'signIn' }

    try {
      const { session: nextSession } = await signInWithEmail(email, password)
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      return nextSession
    } catch (authError) {
      setSession(null)
      setUser(null)
      setError(authError instanceof Error ? authError.message : 'Credenciais inválidas. Tente novamente.')
      throw authError
    } finally {
      authOpRef.current = null
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    authOpRef.current = { type: 'signOut' }

    try {
      await signOutService()
      setSession(null)
      setUser(null)
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Não foi possível encerrar a sessão.')
      throw authError
    } finally {
      authOpRef.current = null
      setLoading(false)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      setError,
    }),
    [session, user, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

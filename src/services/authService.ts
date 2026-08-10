import { supabase } from '@/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

export type AuthSessionState = {
  session: Session | null
  user: User | null
  loading: boolean
  error: string | null
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

// Demo user for when Supabase isn't configured
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@terapee.com.br',
  user_metadata: { full_name: 'Dr. Rafael Demo' },
}
const DEMO_PROFILE = {
  id: 'demo-user-001',
  clinic_id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Dr. Rafael Demo',
  email: 'demo@terapee.com.br',
  role: 'owner',
  avatar_url: null,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId) => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  }, [])

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo mode — no Supabase
      setIsDemo(true)
      setLoading(false)
      return
    }

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const prof = await fetchProfile(session.user.id)
        setProfile(prof)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          const prof = await fetchProfile(session.user.id)
          setProfile(prof)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ─── Auth Methods ───

  const signUp = async ({ email, password, fullName }) => {
    if (!supabase) {
      setUser(DEMO_USER)
      setProfile(DEMO_PROFILE)
      return { error: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      toast.error(error.message)
      return { error }
    }

    toast.success('Conta criada! Verifique seu email para confirmar.')
    return { data, error: null }
  }

  const signIn = async ({ email, password }) => {
    if (!supabase) {
      setUser(DEMO_USER)
      setProfile(DEMO_PROFILE)
      return { error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(
        error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : error.message
      )
      return { error }
    }

    return { data, error: null }
  }

  const signOut = async () => {
    if (!supabase) {
      setUser(null)
      setProfile(null)
      return
    }

    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    toast.success('Logout realizado')
  }

  const resetPassword = async (email) => {
    if (!supabase) return { error: null }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      return { error }
    }

    toast.success('Email de recuperação enviado!')
    return { error: null }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      setUser(DEMO_USER)
      setProfile(DEMO_PROFILE)
      setIsDemo(true)
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

    if (error) {
      toast.error(error.message)
      return { error }
    }

    return { error: null }
  }

  // Demo login (for dev mode)
  const loginDemo = () => {
    setUser(DEMO_USER)
    setProfile(DEMO_PROFILE)
    setIsDemo(true)
    toast.success('Modo demonstração ativado')
  }

  // Auto-demo via URL param (?demo=true)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('demo') === 'true' && !user) {
      loginDemo()
    }
  }, [])

  // ─── Clinic Setup (post-signup) ───

  const createClinic = async (clinicData) => {
    if (!supabase) return { data: { id: DEMO_PROFILE.clinic_id }, error: null }

    const { data, error } = await supabase
      .from('clinics')
      .insert({
        name: clinicData.name,
        slug: clinicData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        phone: clinicData.phone,
        email: clinicData.email,
        plan: clinicData.plan || 'standard',
        working_hours: clinicData.workingHours || {},
        settings: clinicData.settings || {},
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao criar clínica: ' + error.message)
      return { error }
    }

    // Link profile to clinic
    await supabase
      .from('profiles')
      .update({ clinic_id: data.id })
      .eq('id', user.id)

    setProfile((p) => ({ ...p, clinic_id: data.id }))
    return { data, error: null }
  }

  const value = {
    user,
    profile,
    loading,
    isDemo,
    isAuthenticated: Boolean(user) || isDemo,
    clinicId: profile?.clinic_id || (isDemo ? DEMO_PROFILE.clinic_id : null),
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    loginDemo,
    createClinic,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext

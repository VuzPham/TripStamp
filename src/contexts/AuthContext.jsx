import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, isDemo } from '@/services/supabase'
import { demoUser } from '@/services/demoStore'

const AuthContext = createContext(null)

function toUser(u) {
  if (!u) return null
  return {
    id: u.id,
    email: u.email,
    displayName: u.user_metadata?.display_name || u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Bạn',
    avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(isDemo ? demoUser : null)
  const [loading, setLoading] = useState(!isDemo)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleLoading, setRoleLoading] = useState(!isDemo)

  useEffect(() => {
    if (isDemo) return undefined
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Vai trò chỉ dùng để hiển thị giao diện admin; quyền thật được database (RLS) kiểm tra.
  useEffect(() => {
    if (isDemo || !user?.id) {
      setIsAdmin(false)
      setRoleLoading(false)
      return undefined
    }
    let cancelled = false
    setRoleLoading(true)
    supabase
      .from('profiles')
      .select('role, display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setIsAdmin(data?.role === 'admin')
        // Hồ sơ trong database là nguồn đúng nhất cho tên và ảnh hiển thị.
        if (data?.display_name || data?.avatar_url) {
          setUser((u) => (u && u.id === user.id ? { ...u, displayName: data.display_name || u.displayName, avatarUrl: data.avatar_url || u.avatarUrl } : u))
        }
      })
      .finally(() => !cancelled && setRoleLoading(false))
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const signIn = useCallback(async (email, password) => {
    if (isDemo) return
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email, password, displayName) => {
    if (isDemo) return { needsConfirmation: false }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) throw error
    return { needsConfirmation: !data.session }
  }, [])

  /** Đăng nhập bằng Google / Facebook. Quay lại /login rồi AuthPage tự chuyển về trang đang muốn vào. */
  const signInWithProvider = useCallback(async (provider) => {
    if (isDemo) throw new Error('Đăng nhập Google/Facebook cần kết nối Supabase.')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/login` },
    })
    if (error) throw error
  }, [])

  /** Cập nhật tên/ảnh đang hiển thị ngay sau khi lưu hồ sơ. */
  const patchUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), [])

  const signOut = useCallback(async () => {
    if (isDemo) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({ user, loading, isDemo, isAdmin, roleLoading, signIn, signUp, signInWithProvider, patchUser, signOut }),
    [user, loading, isAdmin, roleLoading, signIn, signUp, signInWithProvider, patchUser, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}

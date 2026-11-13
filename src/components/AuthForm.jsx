import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, Notice } from '@/components/ui/card'

const inputCls =
  'h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-base outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20'

export default function AuthForm({ reason, initialMode = 'signin' }) {
  const { signIn, signUp, signInWithProvider, isDemo } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setInfo('')
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password, name.trim())
        if (needsConfirmation) setInfo('Đã gửi email xác nhận. Hãy mở email và nhấn liên kết để kích hoạt tài khoản.')
      }
    } catch (err) {
      setError(translateAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  async function oauth(provider) {
    setBusy(true)
    setError('')
    try {
      await signInWithProvider(provider)
    } catch (err) {
      setError(translateAuthError(err))
      setBusy(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md space-y-4 p-5">
      <div>
        <h2 className="text-xl font-extrabold text-brand-800">{mode === 'signin' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
        {reason && <p className="mt-1 text-sm text-gray-600">{reason}</p>}
      </div>
      {!isDemo && (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" disabled={busy} onClick={() => oauth('google')} className={providerCls}>
              <GoogleIcon /> Google
            </button>
            <button type="button" disabled={busy} onClick={() => oauth('facebook')} className={providerCls}>
              <FacebookIcon /> Facebook
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400" aria-hidden="true">
            <span className="h-px flex-1 bg-black/10" /> hoặc dùng email <span className="h-px flex-1 bg-black/10" />
          </div>
        </>
      )}
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && (
          <input className={inputCls} placeholder="Tên hiển thị" value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
        )}
        <input className={inputCls} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <div className="relative">
          <input
            className={`${inputCls} pr-11`}
            type={showPw ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        {info && <Notice tone="success">{info}</Notice>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Đang xử lý…' : mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
        </Button>
      </form>
      <button
        type="button"
        className="w-full text-center text-sm font-medium text-brand-700 hover:underline"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin')
          setError('')
          setInfo('')
        }}
      >
        {mode === 'signin' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
      </button>
    </Card>
  )
}

const providerCls =
  'flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
    </svg>
  )
}

function translateAuthError(err) {
  const m = String(err?.message ?? '')
  if (/invalid login credentials/i.test(m)) return 'Email hoặc mật khẩu không đúng.'
  if (/already registered|already been registered/i.test(m)) return 'Email này đã được đăng ký.'
  if (/email not confirmed/i.test(m)) return 'Email chưa được xác nhận. Hãy kiểm tra hộp thư.'
  if (/provider is not enabled|unsupported provider/i.test(m)) return 'Phương thức đăng nhập này chưa được bật trong Supabase (Authentication → Providers).'
  if (/password/i.test(m)) return 'Mật khẩu chưa hợp lệ (tối thiểu 6 ký tự).'
  return m || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}

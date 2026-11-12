import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, Notice } from '@/components/ui/card'

const inputCls =
  'h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-base outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20'

export default function AuthForm({ reason, initialMode = 'signin' }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
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

  return (
    <Card className="mx-auto max-w-md space-y-4 p-5">
      <div>
        <h2 className="text-xl font-extrabold text-brand-800">{mode === 'signin' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
        {reason && <p className="mt-1 text-sm text-gray-600">{reason}</p>}
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && (
          <input className={inputCls} placeholder="Tên hiển thị" value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
        )}
        <input className={inputCls} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input
          className={inputCls}
          type="password"
          required
          minLength={6}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />
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

function translateAuthError(err) {
  const m = String(err?.message ?? '')
  if (/invalid login credentials/i.test(m)) return 'Email hoặc mật khẩu không đúng.'
  if (/already registered|already been registered/i.test(m)) return 'Email này đã được đăng ký.'
  if (/email not confirmed/i.test(m)) return 'Email chưa được xác nhận. Hãy kiểm tra hộp thư.'
  if (/password/i.test(m)) return 'Mật khẩu chưa hợp lệ (tối thiểu 6 ký tự).'
  return m || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}

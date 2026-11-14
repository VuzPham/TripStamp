import { useEffect, useRef, useState } from 'react'
import { Camera, LogOut, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthGate from '@/components/AuthGate'
import { Button } from '@/components/ui/button'
import { Card, Notice, Spinner } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useCity } from '@/contexts/CityContext'
import { demoReset } from '@/services/demoStore'
import { fetchProfile, saveProfile, uploadAvatar } from '@/services/profileService'

const inputCls =
  'h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-base outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20'

export default function Profile() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-extrabold text-brand-800">Tài khoản</h1>
      <AuthGate reason="Đăng nhập để lưu bộ sưu tập và đổi ưu đãi.">
        <ProfileInner />
      </AuthGate>
    </div>
  )
}

function ProfileInner() {
  const { user, signOut, isDemo, isAdmin, patchUser } = useAuth()
  const { cities } = useCity()
  const fileRef = useRef(null)
  const [form, setForm] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null) // { tone, text }

  useEffect(() => {
    let cancelled = false
    fetchProfile(user.id)
      .then((p) => !cancelled && setForm({ ...p, displayName: p.displayName || user.displayName, avatarUrl: p.avatarUrl || user.avatarUrl || '' }))
      .catch(() => {
        if (cancelled) return
        setLoadError('Không tải được hồ sơ. Bạn đã chạy supabase/profile.sql chưa?')
        setForm({ displayName: user.displayName, avatarUrl: user.avatarUrl || '', fullName: '', phone: '', bio: '', homeCity: '', birthday: '' })
      })
    return () => {
      cancelled = true
    }
  }, [user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!form) return <div className="grid place-items-center py-16"><Spinner /></div>

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      const url = await uploadAvatar(user.id, file)
      setForm((f) => ({ ...f, avatarUrl: url }))
    } catch (err) {
      setMsg({ tone: 'error', text: err?.message || 'Không tải được ảnh. Ảnh JPG/PNG/WebP, tối đa 2MB.' })
    } finally {
      setUploading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.displayName.trim()) {
      setMsg({ tone: 'error', text: 'Tên hiển thị không được để trống.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      await saveProfile(user.id, form)
      patchUser({ displayName: form.displayName.trim(), avatarUrl: form.avatarUrl })
      setMsg({ tone: 'success', text: 'Đã lưu hồ sơ.' })
    } catch (err) {
      const m = String(err?.message ?? '')
      setMsg({ tone: 'error', text: /phone_check/.test(m) ? 'Số điện thoại chưa hợp lệ.' : /bio_check/.test(m) ? 'Giới thiệu tối đa 300 ký tự.' : 'Không lưu được hồ sơ. Vui lòng thử lại.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Thẻ hồ sơ: dải gradient cao cố định nằm trong thẻ (overflow-hidden cắt theo bo góc);
          avatar đặt tuyệt đối ngay đường giao giữa gradient và nền trắng; thông tin nằm dưới dải gradient. */}
      <Card className="relative overflow-hidden">
        <div aria-hidden="true" className="h-28 w-full sm:h-32" style={{ background: 'linear-gradient(120deg, var(--color-brand-700), var(--color-stamp))' }} />
        <div className="absolute left-5 top-28 -translate-y-1/2 sm:top-32">
          <div className="relative size-24 sm:size-28">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="" referrerPolicy="no-referrer" className="size-full rounded-full border-4 border-white bg-white object-cover shadow" />
            ) : (
              <span className="grid size-full place-items-center rounded-full border-4 border-white bg-brand-700 text-4xl font-bold text-white shadow">
                {(form.displayName || '?').slice(0, 1).toUpperCase()}
              </span>
            )}
            <button
              type="button"
              aria-label="Đổi ảnh đại diện"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 grid size-9 place-items-center rounded-full border-2 border-white bg-brand-700 text-white shadow hover:bg-brand-800 disabled:opacity-60"
            >
              {uploading ? <Spinner className="size-4 border-white border-t-transparent" /> : <Camera className="size-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
          </div>
        </div>
        <div className="flex flex-col gap-1 px-5 pb-5 pt-14 sm:min-h-24 sm:pl-[10.5rem] sm:pt-4">
          <p className="truncate text-xl font-bold leading-tight">{form.displayName}</p>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
          {isAdmin && (
            <Link to="/admin" className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-800 hover:bg-brand-100">
              <ShieldCheck className="size-4" /> Vào trang quản trị
            </Link>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <h2 className="text-lg font-extrabold text-brand-800 sm:col-span-2">Thông tin cá nhân</h2>
          {loadError && <Notice tone="warn" className="sm:col-span-2">{loadError}</Notice>}
          <Label text="Tên hiển thị *" hint="Hiện khi bạn viết đánh giá.">
            <input className={inputCls} required maxLength={60} value={form.displayName} onChange={set('displayName')} autoComplete="nickname" />
          </Label>
          <Label text="Họ và tên">
            <input className={inputCls} maxLength={80} value={form.fullName} onChange={set('fullName')} autoComplete="name" />
          </Label>
          <Label text="Email">
            <input className={`${inputCls} bg-gray-50 text-gray-500`} value={user.email ?? ''} disabled />
          </Label>
          <Label text="Số điện thoại">
            <input className={inputCls} type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="0901 234 567" />
          </Label>
          <Label text="Ngày sinh">
            <input className={inputCls} type="date" value={form.birthday} onChange={set('birthday')} max={new Date().toISOString().slice(0, 10)} autoComplete="bday" />
          </Label>
          <Label text="Đến từ">
            <input className={inputCls} list="home-cities" value={form.homeCity} onChange={set('homeCity')} placeholder="Thành phố bạn sống" />
            <datalist id="home-cities">{cities.map((c) => <option key={c.id} value={c.name} />)}</datalist>
          </Label>
          <Label text="Giới thiệu ngắn" className="sm:col-span-2" hint={`${form.bio.length}/300`}>
            <textarea className={`${inputCls} h-24 py-2`} maxLength={300} value={form.bio} onChange={set('bio')} placeholder="Bạn thích khám phá điều gì?" />
          </Label>
          {form.avatarUrl && (
            <button type="button" onClick={() => setForm((f) => ({ ...f, avatarUrl: '' }))} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline sm:col-span-2">
              <Trash2 className="size-4" /> Gỡ ảnh đại diện
            </button>
          )}
          {msg && <Notice tone={msg.tone} className="sm:col-span-2">{msg.text}</Notice>}
          <Button type="submit" disabled={busy || uploading} className="sm:col-span-2">{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</Button>
        </form>
      </Card>

      {isDemo ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            demoReset()
            window.location.reload()
          }}
        >
          <RotateCcw className="size-4" /> Xoá dữ liệu demo trên thiết bị
        </Button>
      ) : (
        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="size-4" /> Đăng xuất
        </Button>
      )}
    </div>
  )
}

function Label({ text, hint, className = '', children }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-xs font-semibold text-gray-700">{text}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray-500">{hint}</span>}
    </label>
  )
}

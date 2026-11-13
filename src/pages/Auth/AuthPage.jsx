import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, QrCode, Stamp, Gift } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCity } from '@/contexts/CityContext'
import AuthForm from '@/components/AuthForm'
import CityBackdrop from '@/components/Location/CityBackdrop'
import Postmark from '@/components/Postmark'
import { Spinner } from '@/components/ui/card'

const FROM_KEY = 'tripstamp-auth-from'
const perks = [
  { icon: QrCode, text: 'Quét QR tại nơi bạn đến' },
  { icon: Stamp, text: 'Sưu tầm tem số của từng địa điểm' },
  { icon: Gift, text: 'Đổi ưu đãi từ đối tác địa phương' },
]

const read = () => {
  try {
    return JSON.parse(sessionStorage.getItem(FROM_KEY) ?? 'null')
  } catch {
    return null
  }
}

/** Trang /login và /register. Đăng nhập xong thì quay lại đúng trang người dùng muốn vào ban đầu. */
export default function AuthPage({ initialMode = 'signin' }) {
  const { user, loading } = useAuth()
  const { city } = useCity()
  const location = useLocation()
  const navigate = useNavigate()

  // Đăng nhập Google/Facebook làm tải lại trang nên state của router mất; lưu tạm trang đích vào sessionStorage.
  const stateFrom = location.state?.from
  const saved = stateFrom ? { pathname: stateFrom.pathname, search: stateFrom.search, hash: stateFrom.hash } : read()
  const from = saved
  const target = from ? `${from.pathname ?? '/'}${from.search ?? ''}${from.hash ?? ''}` : '/'

  useEffect(() => {
    try {
      if (stateFrom) sessionStorage.setItem(FROM_KEY, JSON.stringify(saved))
    } catch { /* bỏ qua */ }
  }, [stateFrom, saved?.pathname, saved?.search]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && user) {
      try { sessionStorage.removeItem(FROM_KEY) } catch { /* bỏ qua */ }
      navigate(target, { replace: true })
    }
  }, [loading, user, target, navigate])

  if (loading || user) return <div className="grid place-items-center py-24"><Spinner className="size-8" /></div>

  return (
    <section className="relative -mx-4 -mt-4 overflow-hidden px-4 py-8 text-white md:mx-0 md:mt-0 md:rounded-[2rem] md:px-12 md:py-14">
      <CityBackdrop city={city} />
      <div className="relative grid items-center gap-8 md:grid-cols-[1fr_26rem]">
        <div className="hidden max-w-md space-y-5 md:block">
          <Postmark label={city.name} className="w-40 text-stamp" />
          <h1 className="font-display text-5xl font-extrabold leading-[0.98]">Every Trip Leaves a Stamp.</h1>
          <p className="text-lg text-white/90">{city.slogan || city.tagline}</p>
          <ul className="space-y-2.5 pt-2">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/95">
                <span className="grid size-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/25"><Icon className="size-4" /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md space-y-3">
          {from && (
            <div role="alert" className="flex items-start gap-3 rounded-2xl bg-white/95 p-4 text-brand-800 shadow-lg">
              <LockKeyhole className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-extrabold">Login Required</p>
                <p className="text-sm text-gray-700">Please sign in to access this feature and enjoy your TripStamp experience.</p>
              </div>
            </div>
          )}
          <div className="text-ink shadow-2xl [&>*]:rounded-3xl">
            <AuthForm key={initialMode} initialMode={initialMode} />
          </div>
        </div>
      </div>
    </section>
  )
}

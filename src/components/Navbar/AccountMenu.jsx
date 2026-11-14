import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, HelpCircle, LogOut, Monitor, Sun, MessageSquareWarning, Moon, UserCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDisplayPrefs } from '@/utils/displayPrefs'
import { cn } from '@/lib/utils'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

const rowCls =
  'flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-[15px] font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
const iconWrapCls = 'grid size-9 shrink-0 place-items-center rounded-full bg-gray-200 text-gray-900'

export function Avatar({ user, className = 'size-9 text-sm' }) {
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className={cn('shrink-0 rounded-full object-cover', className)} />
  ) : (
    <span className={cn('grid shrink-0 place-items-center rounded-full bg-brand-700 font-bold text-white', className)}>
      {user.displayName.slice(0, 1).toUpperCase()}
    </span>
  )
}

/** Menu tài khoản ở thanh trên: thông tin người dùng + Help & support, Display & accessibility, Give feedback, Log out. */
export default function AccountMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState('main') // 'main' | 'display'
  const [prefs, setPrefs] = useDisplayPrefs()
  const rootRef = useRef(null)

  const close = () => {
    setOpen(false)
    setPanel('main')
  }

  // Đóng khi bấm ra ngoài, nhấn Esc hoặc đổi trang
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => !rootRef.current?.contains(e.target) && close()
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  useEffect(close, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const togglePref = (key) => setPrefs({ [key]: !prefs[key] })

  async function logOut() {
    close()
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Tài khoản"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="relative block rounded-full ring-1 ring-white/30 hover:ring-white/60"
      >
        <Avatar user={user} className="size-9 text-sm" />
        <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-gray-200 text-gray-800 ring-1 ring-brand-800">
          <ChevronDown className="size-3" />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu tài khoản"
          className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100dvh-5rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl bg-white p-2 text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
        >
          {panel === 'main' ? (
            <>
              <div className="rounded-xl p-2 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                <Link to="/profile" role="menuitem" className="flex items-center gap-3 rounded-lg p-1 hover:bg-gray-100">
                  <Avatar user={user} className="size-11 text-lg" />
                  <span className="min-w-0 truncate text-base font-semibold">{user.displayName}</span>
                </Link>
                <hr className="my-2 border-gray-300" />
                <Link
                  to="/profile"
                  role="menuitem"
                  className="flex h-9 items-center justify-center gap-2 rounded-lg bg-gray-200 text-[15px] font-semibold hover:bg-gray-300"
                >
                  <UserCircle className="size-5" /> See all profiles
                </Link>
              </div>

              <ul className="mt-2 space-y-0.5">
                <li>
                  <Link to="/#how" role="menuitem" className={rowCls}>
                    <span className={iconWrapCls}><HelpCircle className="size-5" /></span>
                    <span className="flex-1">Help &amp; support</span>
                    <ChevronRight className="size-5 text-gray-500" />
                  </Link>
                </li>
                <li>
                  <button type="button" role="menuitem" className={rowCls} onClick={() => setPanel('display')}>
                    <span className={iconWrapCls}><Moon className="size-5" /></span>
                    <span className="flex-1">Display &amp; accessibility</span>
                    <ChevronRight className="size-5 text-gray-500" />
                  </button>
                </li>
                <li>
                  {SUPPORT_EMAIL ? (
                    <a role="menuitem" href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Góp ý TripStamp')}`} className={rowCls}>
                      <span className={iconWrapCls}><MessageSquareWarning className="size-5" /></span>
                      <span className="flex-1">Give feedback</span>
                    </a>
                  ) : (
                    <button type="button" role="menuitem" disabled title="Chưa cấu hình VITE_SUPPORT_EMAIL" className={rowCls}>
                      <span className={iconWrapCls}><MessageSquareWarning className="size-5" /></span>
                      <span className="flex-1">Give feedback</span>
                    </button>
                  )}
                </li>
                <li>
                  <button type="button" role="menuitem" className={rowCls} onClick={logOut}>
                    <span className={iconWrapCls}><LogOut className="size-5" /></span>
                    <span className="flex-1">Log out</span>
                  </button>
                </li>
              </ul>
            </>
          ) : (
            <div>
              <div className="flex items-center gap-2 p-1">
                <button type="button" aria-label="Quay lại" onClick={() => setPanel('main')} className="grid size-9 place-items-center rounded-full hover:bg-gray-100">
                  <ChevronLeft className="size-5" />
                </button>
                <h2 className="text-lg font-bold">Display &amp; accessibility</h2>
              </div>
              <p className="px-2 pb-1 pt-2 text-sm font-semibold text-gray-600">Giao diện</p>
              <div role="radiogroup" aria-label="Giao diện" className="grid grid-cols-3 gap-1.5 px-1">
                {[['light', Sun, 'Sáng'], ['dark', Moon, 'Tối'], ['system', Monitor, 'Theo máy']].map(([id, Icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={prefs.theme === id}
                    onClick={() => setPrefs({ theme: id })}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors',
                      prefs.theme === id ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-black/10 text-gray-700 hover:bg-gray-100',
                    )}
                  >
                    <Icon className="size-5" /> {label}
                  </button>
                ))}
              </div>
              <ul className="mt-2 space-y-0.5">
                <Toggle label="Chữ lớn hơn" hint="Tăng cỡ chữ toàn app." checked={prefs.largeText} onChange={() => togglePref('largeText')} />
                <Toggle label="Giảm chuyển động" hint="Tắt hiệu ứng chuyển cảnh và động ảnh." checked={prefs.reduceMotion} onChange={() => togglePref('reduceMotion')} />
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <li>
      <button type="button" role="menuitemcheckbox" aria-checked={checked} onClick={onChange} className={rowCls}>
        <span className="min-w-0 flex-1">
          <span className="block">{label}</span>
          <span className="block text-xs font-normal text-gray-500">{hint}</span>
        </span>
        <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-700' : 'bg-gray-300')}>
          <span className={cn('absolute left-0.5 top-0.5 size-5 rounded-full bg-[#ffffff] shadow transition-transform', checked && 'translate-x-5')} />
        </span>
      </button>
    </li>
  )
}

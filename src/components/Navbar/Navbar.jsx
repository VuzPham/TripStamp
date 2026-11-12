import { NavLink, Link } from 'react-router-dom'
import { Home, Map, ScanLine, Stamp, Gift, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import LocationSelector from '@/components/Location/LocationSelector'

const items = [
  { to: '/', label: 'Trang chủ', icon: Home, end: true },
  { to: '/explore', label: 'Khám phá', icon: Map },
  { to: '/scan', label: 'Quét QR', icon: ScanLine, primary: true },
  { to: '/collection', label: 'Bộ sưu tập', icon: Stamp },
  { to: '/rewards', label: 'Ưu đãi', icon: Gift },
]

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 bg-brand-800 text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
          <span className="grid size-8 place-items-center rounded-md bg-stamp text-on-stamp ring-2 ring-white/40 ring-offset-0">
            <Stamp className="size-4" />
          </span>
          TripStamp
        </Link>
        <LocationSelector className="ml-auto mr-2 md:ml-4 md:mr-0" />
        <nav className="ml-auto mr-2 hidden items-center gap-1 md:flex">
          {items.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white',
                  isActive && 'bg-white/15 text-white',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/profile" aria-label="Tài khoản" className="grid size-9 place-items-center rounded-full hover:bg-white/10">
          <User className="size-5 text-white" />
        </Link>
      </div>
    </header>
  )
}

export function BottomNav() {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ to, label, icon: Icon, end, primary }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-gray-500',
                  isActive && 'text-brand-700',
                )
              }
            >
              {primary ? (
                <span className="-mt-6 grid size-12 place-items-center rounded-full bg-stamp text-on-stamp shadow-lg ring-4 ring-paper">
                  <Icon className="size-6" />
                </span>
              ) : (
                <Icon className="size-5" />
              )}
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import { NavLink, Outlet, Link } from 'react-router-dom'
import { BarChart3, Building2, MapPinned, Store, QrCode, Gift, Ticket, MessageSquare, LayoutGrid, ArrowLeft, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/AuthForm'
import { Notice, Spinner } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/admin', label: 'Tổng quan', icon: BarChart3, end: true },
  { to: '/admin/cities', label: 'Thành phố', icon: Building2 },
  { to: '/admin/areas', label: 'Khu vực', icon: LayoutGrid },
  { to: '/admin/places', label: 'Địa điểm', icon: MapPinned },
  { to: '/admin/partners', label: 'Đối tác', icon: Store },
  { to: '/admin/qr', label: 'Mã QR', icon: QrCode },
  { to: '/admin/rewards', label: 'Ưu đãi', icon: Gift },
  { to: '/admin/redemptions', label: 'Đổi thưởng', icon: Ticket },
  { to: '/admin/reviews', label: 'Đánh giá', icon: MessageSquare },
]

export default function AdminLayout() {
  const { user, loading, roleLoading, isAdmin, isDemo, signOut } = useAuth()

  if (loading || roleLoading) return <div className="grid min-h-screen place-items-center"><Spinner className="size-8" /></div>

  if (isDemo) {
    return (
      <Gate>
        <Notice tone="warn">Khu vực quản trị cần kết nối Supabase. Hãy cấu hình biến môi trường rồi chạy supabase/admin.sql (xem README).</Notice>
      </Gate>
    )
  }
  if (!user) {
    return (
      <Gate>
        <AuthForm reason="Đăng nhập bằng tài khoản quản trị." />
      </Gate>
    )
  }
  if (!isAdmin) {
    return (
      <Gate>
        <div className="space-y-3 text-center">
          <ShieldAlert className="mx-auto size-10 text-amber-500" />
          <Notice tone="error">Tài khoản {user.email} không có quyền quản trị.</Notice>
          <Button variant="outline" onClick={signOut}>Đăng xuất</Button>
        </div>
      </Gate>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-black/5 bg-white md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3 md:block">
          <p className="font-extrabold text-brand-800">TripStamp Admin</p>
          <Link to="/" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline md:mt-1">
            <ArrowLeft className="size-3" /> Về app
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:block md:space-y-1 md:px-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-brand-50',
                  isActive && 'bg-brand-100 text-brand-800',
                )
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-4 py-3 text-xs text-gray-500 md:absolute md:bottom-0 md:block md:w-full">
          <p className="truncate">{user.email}</p>
          <button type="button" onClick={signOut} className="mt-1 font-semibold text-brand-700 hover:underline">Đăng xuất</button>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}

function Gate({ children }) {
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-4">
      <div className="w-full max-w-md space-y-3">
        <h1 className="text-center text-xl font-extrabold text-brand-800">TripStamp Admin</h1>
        {children}
        <p className="text-center"><Link to="/" className="text-sm text-brand-700 hover:underline">Về trang chủ</Link></p>
      </div>
    </div>
  )
}

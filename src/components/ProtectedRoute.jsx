import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/card'

/**
 * Chặn các trang cần tài khoản (/scan, /collection, /rewards, /claim).
 * - Đang kiểm tra session: hiện spinner, KHÔNG chuyển hướng (tránh đá người đã đăng nhập ra Login khi vừa tải lại trang).
 * - Chưa đăng nhập: chuyển tới /login và nhớ trang đang muốn vào.
 * Lưu ý: đây chỉ là lớp giao diện; dữ liệu cá nhân vẫn được bảo vệ bởi RLS / RPC trong Supabase.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="grid place-items-center py-24" role="status" aria-label="Đang kiểm tra đăng nhập"><Spinner className="size-8" /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

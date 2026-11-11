import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/card'
import AuthForm from './AuthForm'

/** Chỉ hiển thị children khi đã đăng nhập; nếu chưa thì hiện form đăng nhập. */
export default function AuthGate({ reason, children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid place-items-center py-20"><Spinner /></div>
  if (!user) return <AuthForm reason={reason} />
  return children
}

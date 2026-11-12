import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/AuthForm'
import { Spinner } from '@/components/ui/card'

/** Trang /login và /register. Đăng nhập xong thì quay lại đúng trang người dùng muốn vào ban đầu. */
export default function AuthPage({ initialMode = 'signin' }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const from = location.state?.from
  const target = from ? `${from.pathname ?? '/'}${from.search ?? ''}${from.hash ?? ''}` : '/'

  useEffect(() => {
    if (!loading && user) navigate(target, { replace: true })
  }, [loading, user, target, navigate])

  if (loading || user) return <div className="grid place-items-center py-24"><Spinner className="size-8" /></div>

  return (
    <div className="mx-auto max-w-md space-y-4 py-6">
      {from && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-800">
          <LockKeyhole className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-extrabold">Login Required</p>
            <p className="text-sm">Please sign in to access this feature and enjoy your TripStamp experience.</p>
          </div>
        </div>
      )}
      <AuthForm initialMode={initialMode} />
    </div>
  )
}

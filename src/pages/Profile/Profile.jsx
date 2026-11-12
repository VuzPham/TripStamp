import { LogOut, RotateCcw } from 'lucide-react'
import AuthGate from '@/components/AuthGate'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { demoReset } from '@/services/demoStore'

export default function Profile() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-extrabold text-brand-800">Tài khoản</h1>
      <AuthGate reason="Đăng nhập để lưu bộ sưu tập và đổi ưu đãi.">
        <ProfileInner />
      </AuthGate>
    </div>
  )
}

function ProfileInner() {
  const { user, signOut, isDemo } = useAuth()
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-14 place-items-center rounded-full bg-brand-700 text-2xl font-bold text-white">
          {user.displayName.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{user.displayName}</p>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
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
    </Card>
  )
}

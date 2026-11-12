import { Outlet, ScrollRestoration } from 'react-router-dom'
import { TopBar, BottomNav } from '@/components/Navbar/Navbar'
import { useAuth } from '@/contexts/AuthContext'

export default function MainLayout() {
  const { isDemo } = useAuth()
  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      {isDemo && (
        <div className="bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
          Chế độ demo: dữ liệu mẫu lưu trên thiết bị này. Cấu hình Supabase để dùng dữ liệu thật.
        </div>
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4 md:pb-10">
        <Outlet />
      </main>
      <BottomNav />
      <ScrollRestoration />
    </div>
  )
}

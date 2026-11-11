import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PlacesProvider } from '@/hooks/usePlaces'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home/Home'
import Explore from '@/pages/Explore/Explore'
import PlaceDetail from '@/pages/PlaceDetail/PlaceDetail'
import Scan from '@/pages/Scan/Scan'
import Claim from '@/pages/Scan/Claim'
import MyCollection from '@/pages/MyCollection/MyCollection'
import Rewards from '@/pages/Rewards/Rewards'
import Profile from '@/pages/Profile/Profile'
import DevQR from '@/pages/Dev/DevQR'
import { Button } from '@/components/ui/button'

function NotFound() {
  return (
    <div className="space-y-3 py-16 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="text-2xl font-extrabold text-brand-800">Không tìm thấy trang</h1>
      <Link to="/"><Button>Về trang chủ</Button></Link>
    </div>
  )
}

// Khu vực admin tải riêng (lazy) để người dùng thường không phải tải mã quản trị.
const lazyPage = (loader) => async () => ({ Component: (await loader()).default })

const devToolsEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true'

const router = createBrowserRouter([
  {
    path: '/admin',
    lazy: lazyPage(() => import('@/admin/AdminLayout')),
    children: [
      { index: true, lazy: lazyPage(() => import('@/admin/pages/Dashboard')) },
      { path: 'places', lazy: lazyPage(() => import('@/admin/pages/Places')) },
      { path: 'partners', lazy: lazyPage(() => import('@/admin/pages/Partners')) },
      { path: 'qr', lazy: lazyPage(() => import('@/admin/pages/QRCodes')) },
      { path: 'rewards', lazy: lazyPage(() => import('@/admin/pages/Rewards')) },
      { path: 'redemptions', lazy: lazyPage(() => import('@/admin/pages/Redemptions')) },
      { path: 'reviews', lazy: lazyPage(() => import('@/admin/pages/Reviews')) },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/explore', element: <Explore /> },
      { path: '/places/:slug', element: <PlaceDetail /> },
      { path: '/scan', element: <Scan /> },
      { path: '/claim', element: <Claim /> },
      { path: '/collection', element: <MyCollection /> },
      { path: '/rewards', element: <Rewards /> },
      { path: '/profile', element: <Profile /> },
      ...(devToolsEnabled ? [{ path: '/dev/qr', element: <DevQR /> }] : []),
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <PlacesProvider>
        <RouterProvider router={router} />
      </PlacesProvider>
    </AuthProvider>
  )
}

import { Link } from 'react-router-dom'
import { Stamp } from 'lucide-react'

const explore = [
  { to: '/explore', label: 'Khám phá' },
  { to: '/scan', label: 'Quét QR' },
  { to: '/collection', label: 'Bộ sưu tập' },
  { to: '/rewards', label: 'Ưu đãi' },
]
const info = [
  { to: '/#how', label: 'Cách hoạt động' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/data-deletion', label: 'Xoá dữ liệu' },
]

const linkCls = 'text-sm text-gray-600 hover:text-brand-800 hover:underline'

/** Chân trang dùng chung. Có thêm pb cho thanh điều hướng dưới trên điện thoại. */
export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white pb-28 pt-8 md:pb-8">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-brand-800">
            <span className="grid size-8 place-items-center rounded-md bg-stamp text-on-stamp"><Stamp className="size-4" /></span>
            TripStamp
          </Link>
          <p className="max-w-xs text-sm text-gray-600">Mỗi chuyến đi để lại một con tem. Khám phá nơi bản địa, quét QR và sưu tầm kỷ niệm.</p>
        </div>
        <nav aria-label="Khám phá" className="space-y-2">
          <p className="text-sm font-bold text-gray-900">Khám phá</p>
          <ul className="space-y-1.5">
            {explore.map((l) => <li key={l.to}><Link to={l.to} className={linkCls}>{l.label}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Thông tin" className="space-y-2">
          <p className="text-sm font-bold text-gray-900">Thông tin</p>
          <ul className="space-y-1.5">
            {info.map((l) => <li key={l.to}><Link to={l.to} className={linkCls}>{l.label}</Link></li>)}
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-5xl px-4 text-xs text-gray-500">
        © {new Date().getFullYear()} TripStamp. Bản đồ © OpenStreetMap contributors.
      </p>
    </footer>
  )
}

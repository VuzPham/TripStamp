import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { places, cities, demoToken } from '@/data/seed'
import { buildClaimUrl } from '@/utils/token'
import { Notice } from '@/components/ui/card'

/**
 * Công cụ DEV: in mã QR demo để thử quét. Mỗi mã chứa URL /claim?t=<token>.
 * Chỉ bật khi chạy `npm run dev` hoặc đặt VITE_ENABLE_DEV_TOOLS=true.
 * Token demo là cố định/dễ đoán – KHÔNG dùng cho đối tác thật.
 */
export default function DevQR() {
  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <h1 className="text-2xl font-extrabold text-brand-800">Mã QR demo</h1>
        <Notice tone="warn" className="mt-2">
          Token demo dễ đoán, chỉ để thử nghiệm. Với đối tác thật hãy tạo token ngẫu nhiên (xem README, mục “QR thật”).
        </Notice>
        <button onClick={() => window.print()} className="mt-3 rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white">
          In trang này
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {places.map((p) => {
          const token = demoToken(p.slug)
          return (
            <div key={p.slug} className="break-inside-avoid rounded-2xl border border-black/10 bg-white p-4 text-center">
              <QRCodeSVG value={buildClaimUrl(token)} size={160} level="M" className="mx-auto" />
              <p className="mt-2 text-sm font-bold">{p.name}</p>
              <p className="text-[11px] text-gray-500">{cities.find((c) => c.id === p.city)?.name}</p>
              <Link to={`/claim?t=${encodeURIComponent(token)}`} className="break-all text-[10px] text-gray-500 underline print:no-underline">
                {token}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

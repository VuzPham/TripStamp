import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, X } from 'lucide-react'
import AuthGate from '@/components/AuthGate'
import StampCard from '@/components/StampCard/StampCard'
import { Button } from '@/components/ui/button'
import { Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { usePlaces } from '@/hooks/usePlaces'
import { useAuth } from '@/contexts/AuthContext'
import { useCity } from '@/contexts/CityContext'
import { fetchMyCollection } from '@/services/stampService'
import { downloadNodeAsPng } from '@/utils/shareImage'

export default function MyCollection() {
  return (
    <div className="space-y-4">
      <AuthGate reason="Đăng nhập để xem các thẻ bạn đã sưu tầm.">
        <CollectionInner />
      </AuthGate>
    </div>
  )
}

function CollectionInner() {
  const { user } = useAuth()
  const { allPlaces: places, categories } = usePlaces()
  const { cities } = useCity()
  // Tải lại khi đổi tài khoản để không lẫn thẻ giữa hai người dùng.
  const { data, loading, error } = useAsync(fetchMyCollection, [user?.id])
  const [open, setOpen] = useState(null)
  const cardRef = useRef(null)
  const [saving, setSaving] = useState(false)

  const total = places.length
  const catOf = (s) => categories.find((c) => c.id === s.place?.category?.id)
  const cityOf = (s) => {
    const id = places.find((p) => p.id === s.place?.id)?.cityId
    return { cityId: id, cityName: cities.find((c) => c.id === id)?.name }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-extrabold text-brand-800">Bộ sưu tập của tôi</h1>
        <p className="text-sm text-gray-600">
          {data ? `${data.length}${total ? `/${total}` : ''} thẻ đã sưu tầm` : 'Các thẻ số bạn đã nhận'}
        </p>
        {data && total > 0 && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-stamp transition-all" style={{ width: `${Math.min(100, (data.length / total) * 100)}%` }} />
          </div>
        )}
      </div>

      {loading && <div className="grid place-items-center py-16"><Spinner /></div>}
      {error && <Notice tone="error">Không tải được bộ sưu tập. Vui lòng thử lại.</Notice>}

      {data && data.length === 0 && (
        <div className="space-y-3 rounded-2xl border border-dashed border-brand-700/30 bg-white p-8 text-center">
          <p className="text-4xl">🗺️</p>
          <p className="font-semibold">Bạn chưa có thẻ nào</p>
          <p className="text-sm text-gray-600">Ghé một địa điểm đối tác và quét mã QR để nhận thẻ đầu tiên.</p>
          <Link to="/scan"><Button variant="accent">Quét QR ngay</Button></Link>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.map((s) => (
            <button key={s.id} type="button" onClick={() => setOpen(s)} className="text-left focus-visible:outline-2 focus-visible:outline-brand-600">
              <StampCard stamp={s} placeName={s.place?.name} category={catOf(s)} claimedAt={s.claimedAt} {...cityOf(s)} />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.name}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setOpen(null)}
        >
          <div className="relative w-full max-w-xs space-y-3" onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Đóng" onClick={() => setOpen(null)} className="absolute -right-2 -top-10 rounded-full bg-white p-2">
              <X className="size-4" />
            </button>
            <StampCard ref={cardRef} stamp={open} placeName={open.place?.name} category={catOf(open)} claimedAt={open.claimedAt} {...cityOf(open)} />
            <Button
              className="w-full"
              disabled={saving}
              onClick={async () => {
                setSaving(true)
                try { await downloadNodeAsPng(cardRef.current, `tripstamp-${open.place?.slug ?? 'stamp'}.png`) } finally { setSaving(false) }
              }}
            >
              <Download className="size-4" /> {saving ? 'Đang tạo ảnh…' : 'Lưu thành ảnh'}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

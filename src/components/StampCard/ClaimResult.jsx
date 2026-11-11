import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Gift, PartyPopper, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/card'
import StampCard from './StampCard'
import { usePlaces } from '@/hooks/usePlaces'
import { downloadNodeAsPng } from '@/utils/shareImage'

const messages = {
  invalid: ['error', 'Mã QR không hợp lệ. Hãy kiểm tra lại mã tại điểm check-in.'],
  inactive: ['error', 'Mã QR này hiện không còn hoạt động.'],
  expired: ['error', 'Mã QR này chưa đến hoặc đã quá thời hạn sử dụng.'],
  limit_reached: ['warn', 'Mã QR này đã hết lượt nhận thẻ.'],
  rate_limited: ['warn', 'Bạn quét sai quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.'],
  unauthenticated: ['warn', 'Bạn cần đăng nhập để nhận thẻ.'],
}

export default function ClaimResult({ result, onReset }) {
  const cardRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const { categories } = usePlaces()
  const { status } = result

  if (status === 'ok' || status === 'already_claimed') {
    const category = categories.find((c) => c.id === result.place?.category_id)
    const isNew = status === 'ok'
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 text-lg font-extrabold text-brand-800">
          {isNew ? <PartyPopper className="size-6 text-stamp" /> : <CheckCircle2 className="size-6 text-brand-700" />}
          {isNew ? 'Bạn nhận được một thẻ mới!' : 'Bạn đã có thẻ này rồi'}
        </div>
        <motion.div
          initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: isNew ? -2 : 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          className="w-full max-w-xs"
        >
          <StampCard ref={cardRef} stamp={result.stamp} placeName={result.place?.name} category={category} claimedAt={new Date()} />
        </motion.div>
        {isNew && result.total_stamps != null && (
          <p className="text-sm text-gray-600">
            Bộ sưu tập của bạn có <b>{result.total_stamps}</b> thẻ.
          </p>
        )}
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Link to="/collection">
            <Button className="w-full">Xem bộ sưu tập</Button>
          </Link>
          <Button
            variant="outline"
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              try {
                await downloadNodeAsPng(cardRef.current, `tripstamp-${result.place?.slug ?? 'stamp'}.png`)
              } finally {
                setSaving(false)
              }
            }}
          >
            <Download className="size-4" /> {saving ? 'Đang tạo ảnh…' : 'Lưu thẻ thành ảnh'}
          </Button>
          <Link to="/rewards">
            <Button variant="ghost" className="w-full">
              <Gift className="size-4" /> Xem ưu đãi
            </Button>
          </Link>
          {onReset && (
            <Button variant="ghost" onClick={onReset}>
              Quét mã khác
            </Button>
          )}
        </div>
      </div>
    )
  }

  const [tone, text] = messages[status] ?? ['error', 'Không thể xử lý mã QR. Vui lòng thử lại.']
  return (
    <div className="space-y-4 text-center">
      <AlertTriangle className="mx-auto size-10 text-amber-500" />
      <Notice tone={tone}>{text}</Notice>
      {onReset && <Button onClick={onReset}>Thử lại</Button>}
    </div>
  )
}

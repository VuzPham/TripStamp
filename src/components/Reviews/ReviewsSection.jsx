import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Notice, Spinner } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useAsync } from '@/hooks/useAsync'
import { fetchReviews, fetchMyReview, submitReview, deleteMyReview } from '@/services/reviewService'
import { fetchMyCollection } from '@/services/stampService'
import { StarsDisplay, StarsInput } from './RatingStars'

const failMessages = {
  not_checked_in: 'Bạn cần check-in (quét QR nhận thẻ) tại địa điểm này trước khi đánh giá.',
  invalid_rating: 'Hãy chọn từ 1 đến 5 sao.',
  too_long: 'Bình luận tối đa 1000 ký tự.',
  rate_limited: 'Bạn thao tác quá nhanh. Vui lòng đợi một chút.',
  unauthenticated: 'Bạn cần đăng nhập để đánh giá.',
  not_found: 'Địa điểm không còn khả dụng.',
}

export default function ReviewsSection({ place, onChanged }) {
  const { user } = useAuth()
  const reviews = useAsync(() => fetchReviews(place.id), [place.id])
  const mine = useAsync(() => fetchMyReview(place.id, user?.id), [place.id, user?.id])
  const collection = useAsync(() => (user ? fetchMyCollection() : Promise.resolve([])), [user?.id])

  const checkedIn = (collection.data ?? []).some((s) => s.place?.id === place.id)
  const positivePct = place.reviewCount ? Math.round((place.positiveCount / place.reviewCount) * 100) : null

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-brand-800">
          <MessageSquare className="size-5" /> Đánh giá & bình luận
        </h2>
        {place.reviewCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{place.rating?.toFixed(1)}</span>
            <div>
              <StarsDisplay value={place.rating ?? 0} />
              <p className="text-xs text-gray-600">
                {place.reviewCount} đánh giá · {positivePct}% tích cực
              </p>
            </div>
          </div>
        )}
      </div>

      {!user ? (
        <Notice>
          <Link to="/profile" className="font-semibold underline">Đăng nhập</Link> để viết đánh giá.
        </Notice>
      ) : collection.loading || mine.loading ? (
        <Spinner />
      ) : checkedIn ? (
        <ReviewForm
          key={mine.data ? 'edit' : 'new'}
          place={place}
          existing={mine.data}
          onDone={() => {
            reviews.reload()
            mine.reload()
            onChanged?.()
          }}
        />
      ) : (
        <Notice tone="warn">
          <span className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <span>
              Chỉ người đã check-in mới được đánh giá, để đánh giá luôn đáng tin cậy.{' '}
              <Link to="/scan" className="font-semibold underline">Quét QR tại địa điểm</Link> để nhận thẻ rồi quay lại nhé.
            </span>
          </span>
        </Notice>
      )}

      {reviews.loading && <Spinner />}
      {reviews.error && <Notice tone="error">Không tải được đánh giá.</Notice>}
      {reviews.data?.length === 0 && !reviews.loading && (
        <p className="text-sm text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
      )}
      <ul className="divide-y divide-black/5">
        {reviews.data?.map((r) => (
          <li key={r.id} className="space-y-1 py-3 first:pt-0">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                  {r.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="text-sm font-semibold">{r.displayName}</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck className="size-3" /> Đã check-in
                </span>
              </span>
              <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <StarsDisplay value={r.rating} size="size-3.5" />
            {r.comment && <p className="whitespace-pre-line text-sm text-gray-700">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ReviewForm({ place, existing, onDone }) {
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setRating(existing?.rating ?? 0)
    setComment(existing?.comment ?? '')
  }, [existing])

  async function submit(e) {
    e.preventDefault()
    if (!rating) {
      setMessage({ tone: 'warn', text: 'Hãy chọn số sao trước khi gửi.' })
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      const res = await submitReview(place.id, rating, comment)
      if (res.status === 'ok') {
        setMessage({ tone: 'success', text: existing ? 'Đã cập nhật đánh giá của bạn.' : 'Cảm ơn bạn đã đánh giá!' })
        onDone()
      } else {
        setMessage({ tone: 'warn', text: failMessages[res.status] ?? 'Không thể gửi đánh giá lúc này.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ tone: 'error', text: 'Không kết nối được máy chủ. Vui lòng thử lại.' })
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm('Xoá đánh giá của bạn?')) return
    setBusy(true)
    try {
      await deleteMyReview(place.id)
      onDone()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-brand-50 p-4">
      <p className="text-sm font-semibold text-brand-800">{existing ? 'Đánh giá của bạn' : 'Bạn thấy nơi này thế nào?'}</p>
      <StarsInput value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)…"
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
      />
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={busy}>{busy ? 'Đang gửi…' : existing ? 'Cập nhật' : 'Gửi đánh giá'}</Button>
        {existing && (
          <Button type="button" size="sm" variant="ghost" onClick={remove} disabled={busy}>
            <Trash2 className="size-4 text-red-600" /> Xoá
          </Button>
        )}
      </div>
    </form>
  )
}

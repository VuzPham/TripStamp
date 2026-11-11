import { useState } from 'react'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { StarsDisplay } from '@/components/Reviews/RatingStars'
import { useAsync } from '@/hooks/useAsync'
import { adminListReviews, setReviewStatus, deleteReview } from '../services/adminService'
import { PageHeader, errorText, inputCls } from '../components/ui'

export default function Reviews() {
  const reviews = useAsync(adminListReviews, [])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  async function run(fn) {
    setError('')
    try {
      await fn()
      reviews.reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  const list = (reviews.data ?? []).filter((r) => filter === 'all' || r.status === filter)

  return (
    <>
      <PageHeader
        title="Đánh giá"
        subtitle="Kiểm duyệt đánh giá và bình luận của người dùng. Đánh giá bị ẩn sẽ không hiển thị công khai và không tính vào điểm."
        action={
          <select className={`${inputCls} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Lọc trạng thái">
            <option value="all">Tất cả</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        }
      />
      {error && <Notice tone="error" className="mb-3">{error}</Notice>}
      {reviews.loading && <div className="grid place-items-center py-16"><Spinner /></div>}
      {reviews.error && <Notice tone="error">{errorText(reviews.error)}</Notice>}
      {!reviews.loading && list.length === 0 && <Notice>Không có đánh giá nào.</Notice>}
      <div className="grid gap-2">
        {list.map((r) => (
          <Card key={r.id} className="space-y-1.5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">{r.place_name}</p>
              <div className="flex items-center gap-2">
                {r.status === 'hidden' && <Badge className="bg-gray-200 text-gray-700">Đã ẩn</Badge>}
                <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString('vi-VN')}</span>
              </div>
            </div>
            <StarsDisplay value={r.rating} size="size-3.5" />
            {r.comment ? <p className="whitespace-pre-line text-sm text-gray-700">{r.comment}</p> : <p className="text-sm italic text-gray-400">(không có bình luận)</p>}
            <p className="text-xs text-gray-500">{r.display_name ?? '—'} · {r.email}</p>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => run(() => setReviewStatus(r.id, r.status === 'visible' ? 'hidden' : 'visible'))}>
                {r.status === 'visible' ? <><EyeOff className="size-4" /> Ẩn</> : <><Eye className="size-4" /> Hiện lại</>}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.confirm('Xoá hẳn đánh giá này?') && run(() => deleteReview(r.id))}
              >
                <Trash2 className="size-4 text-red-600" /> Xoá
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

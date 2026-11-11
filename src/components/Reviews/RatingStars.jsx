import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Hiển thị điểm bằng sao (chỉ đọc). */
export function StarsDisplay({ value = 0, size = 'size-4', className }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
      ))}
    </span>
  )
}

/** Chọn điểm 1–5 sao. */
export function StarsInput({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Chọn số sao" className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} sao`}
          onClick={() => onChange(n)}
          className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <Star className={cn('size-8 transition-colors', n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300')} />
        </button>
      ))}
    </div>
  )
}

/** Dòng nhỏ: ★ 4.6 (12). Không hiển thị gì nếu chưa có đánh giá. */
export function RatingInline({ place, className }) {
  if (!place.reviewCount) return null
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold text-gray-700', className)}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      {place.rating?.toFixed(1)}
      <span className="font-normal text-gray-500">({place.reviewCount})</span>
    </span>
  )
}

export function HotBadge({ className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700', className)}>
      🔥 Hot
    </span>
  )
}

/** "Được yêu thích": điểm trung bình >= 4.5 với ít nhất 3 đánh giá. */
export const isLoved = (place) => place.reviewCount >= 3 && (place.rating ?? 0) >= 4.5

export function LovedBadge({ className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700', className)}>
      ❤️ Được yêu thích
    </span>
  )
}

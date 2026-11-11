import { forwardRef } from 'react'
import { Stamp as StampIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const rarityLabel = { common: 'Thường', rare: 'Hiếm', epic: 'Huyền thoại' }
const rarityRing = {
  common: 'border-brand-700/50',
  rare: 'border-sky-600',
  epic: 'border-amber-500',
}

/** Thẻ tem số. Dùng forwardRef để html-to-image chụp thành ảnh. */
const StampCard = forwardRef(function StampCard({ stamp, placeName, category, claimedAt, className }, ref) {
  const color = category?.color ?? '#0f766e'
  const date = claimedAt ? new Date(claimedAt).toLocaleDateString('vi-VN') : null
  return (
    <div
      ref={ref}
      className={cn('relative w-full max-w-xs rounded-2xl bg-[#fffdf7] p-3 shadow-md', className)}
      style={{ backgroundImage: `radial-gradient(${color}14 1px, transparent 1px)`, backgroundSize: '10px 10px' }}
    >
      <div className={cn('rounded-xl border-[3px] border-dashed p-4 text-center', rarityRing[stamp.rarity] ?? rarityRing.common)}>
        <div className="mx-auto grid size-20 place-items-center rounded-full border-4 text-4xl" style={{ borderColor: color, color }}>
          {category?.icon ?? <StampIcon className="size-9" />}
        </div>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>
          TripStamp · Nha Trang
        </p>
        <h3 className="mt-1 text-lg font-extrabold leading-tight text-gray-900">{stamp.name}</h3>
        {placeName && <p className="mt-0.5 text-xs text-gray-600">{placeName}</p>}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-gray-500">
          <span className="rounded-full bg-black/5 px-2 py-0.5">{rarityLabel[stamp.rarity] ?? 'Thường'}</span>
          {date && <span>{date}</span>}
        </div>
      </div>
    </div>
  )
})

export default StampCard

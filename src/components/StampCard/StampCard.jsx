import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Postmark from '@/components/Postmark'
import { fallbackArt, categoryArt } from '@/utils/art'

const rarityLabel = { common: 'Thường', rare: 'Hiếm', epic: 'Huyền thoại' }
const rarityBar = { common: 'bg-brand-600', rare: 'bg-sky-600', epic: 'bg-amber-500' }

/**
 * Thẻ tem số: viền răng cưa như tem thư, ảnh minh hoạ theo danh mục, dấu bưu điện ngày nhận.
 * ref gắn vào phần tem (không gồm bóng đổ) để html-to-image chụp thành ảnh.
 */
const StampCard = forwardRef(function StampCard({ stamp, placeName, category, claimedAt, className, cityId, cityName }, ref) {
  const art = fallbackArt(cityId, category?.id)
  const lastResort = categoryArt(category?.id)
  return (
    <div className={cn('w-full max-w-xs drop-shadow-[0_6px_10px_rgba(11,46,74,0.25)]', className)}>
      <div ref={ref} className="perf bg-white">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden bg-brand-100">
            <img src={stamp.image || art} alt="" className="size-full object-cover" onError={(e) => { const t = e.currentTarget; t.src = t.src.endsWith(art) ? lastResort : art }} />
            <span className={cn('absolute left-2 top-2 rounded px-2 py-0.5 text-[11px] font-bold text-white', rarityBar[stamp.rarity] ?? rarityBar.common)}>
              {rarityLabel[stamp.rarity] ?? 'Thường'}
            </span>
          </div>
          <div className="px-1 pb-1 pt-2.5">
            <h3 className="font-display text-lg font-extrabold leading-tight text-ink">{stamp.name}</h3>
            {placeName && <p className="text-xs text-ink/60">{placeName}{cityName ? `, ${cityName}` : ''}</p>}
          </div>
          {claimedAt && (
            <Postmark date={claimedAt} waves={false} label={cityName ?? 'Nha Trang'} className="pointer-events-none absolute -bottom-2 -right-2 w-24 rotate-[-14deg] text-stamp/85 mix-blend-multiply" />
          )}
        </div>
      </div>
    </div>
  )
})

export default StampCard

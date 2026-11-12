import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

const DEFAULT_ART = '/images/hero.svg'

/**
 * Ảnh nền theo thành phố: blur nhẹ + lớp phủ tối/gradient để chữ phía trên luôn dễ đọc.
 * Đổi thành phố => ảnh mới mờ dần vào, ảnh cũ mờ dần ra (cross-fade).
 */
export default function CityBackdrop({ city, className }) {
  const reduce = useReducedMotion()
  const src = city.heroImage || DEFAULT_ART
  return (
    <div aria-hidden="true" className={cn('absolute inset-0 overflow-hidden bg-brand-800', className)}>
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt=""
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.85, scale: 1.04 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: 'easeOut' }}
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(DEFAULT_ART)) e.currentTarget.src = DEFAULT_ART
          }}
          className="absolute inset-0 size-full object-cover blur-[2px]"
        />
      </AnimatePresence>
      {/* Lớp tint theo màu thành phố + gradient tối từ dưới lên và từ trái sang */}
      <div className="absolute inset-0 bg-brand-800/40 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
    </div>
  )
}

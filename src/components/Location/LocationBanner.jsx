import { motion, useReducedMotion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { useCity } from '@/contexts/CityContext'
import { usePlaces } from '@/hooks/usePlaces'
import { cn } from '@/lib/utils'
import CityBackdrop from './CityBackdrop'
import LocationSelector from './LocationSelector'

/**
 * Khối đầu trang dùng chung cho Home / Explore / Place Detail:
 * ảnh nền theo thành phố + "Discover {tên}" + slogan + thông tin vị trí + bộ chọn khu vực.
 * size: 'hero' (Home) | 'compact' (Explore, Place Detail).
 */
export default function LocationBanner({ size = 'hero', as: Title = 'h1', aside, children, onSelect, className }) {
  const { city, area } = useCity()
  const { places } = usePlaces()
  const reduce = useReducedMotion()
  const hero = size === 'hero'

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2rem] text-white',
        hero ? 'px-6 py-10 md:px-12 md:py-14' : 'px-5 py-6 md:px-8 md:py-7',
        className,
      )}
    >
      <CityBackdrop city={city} />
      <div className={cn('relative grid items-center gap-8', aside && 'md:grid-cols-[1.15fr_0.85fr]')}>
        <div className="max-w-xl space-y-4">
          <LocationSelector variant="hero" onSelect={onSelect} />
          <motion.div
            key={city.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            <Title className={cn('font-display font-extrabold leading-[0.98]', hero ? 'text-5xl md:text-7xl' : 'text-3xl md:text-4xl')}>
              Discover {city.name}
            </Title>
            <p className={cn('max-w-md text-white/90', hero ? 'text-lg' : 'text-base')}>{city.slogan || city.tagline}</p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/85">
              <MapPin className="size-4 shrink-0" />
              <span>{city.province || city.name}</span>
              <span aria-hidden="true">·</span>
              <span>{area ? area.name : 'Tất cả khu vực'}</span>
              <span aria-hidden="true">·</span>
              <span>{places.length} địa điểm</span>
            </p>
            {hero && city.slogan && city.tagline && <p className="text-sm text-white/75">{city.tagline}</p>}
          </motion.div>
          {children}
        </div>
        {aside}
      </div>
    </section>
  )
}

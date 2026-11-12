import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Card, Badge } from '@/components/ui/card'
import { formatDistance } from '@/utils/geo'
import { fallbackArt, categoryArt } from '@/utils/art'
import { HotBadge, LovedBadge, RatingInline, isLoved } from '@/components/Reviews/RatingStars'

/** Ảnh địa điểm. Ảnh lỗi hoặc chưa có => ảnh minh hoạ theo danh mục. */
export function PlaceThumb({ place, className = 'h-40' }) {
  const fallback = fallbackArt(place.cityId, place.category?.id)
  const lastResort = categoryArt(place.category?.id)
  const [src, setSrc] = useState(place.image || fallback)
  useEffect(() => setSrc(place.image || fallback), [place.image, fallback])
  return (
    <img
      src={src}
      alt={place.name}
      loading="lazy"
      onError={() => setSrc(src === fallback ? lastResort : fallback)}
      className={`${className} w-full object-cover`}
    />
  )
}

export default function PlaceCard({ place, distance, collected }) {
  return (
    <Link to={`/places/${place.slug}`} className="block focus-visible:outline-2 focus-visible:outline-brand-600">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative">
          <PlaceThumb place={place} />
          {(place.isHot || isLoved(place)) && (
            <div className="absolute left-2 top-2 flex flex-wrap gap-1">
              {place.isHot && <HotBadge className="shadow" />}
              {isLoved(place) && <LovedBadge className="shadow" />}
            </div>
          )}
        </div>
        <div className="space-y-1.5 p-3">
          <div className="flex items-center justify-between gap-2">
            <Badge color={place.category?.color}>{place.category?.name}</Badge>
            {collected && <Badge className="bg-emerald-100 text-emerald-800">Đã có tem</Badge>}
          </div>
          <h3 className="line-clamp-1 font-bold text-gray-900">{place.name}</h3>
          <RatingInline place={place} />
          <p className="line-clamp-2 text-sm text-gray-600">{place.description}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{place.address}</span>
            {distance != null && <span className="ml-auto shrink-0 font-semibold text-brand-700">{formatDistance(distance)}</span>}
          </p>
        </div>
      </Card>
    </Link>
  )
}

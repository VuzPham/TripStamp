import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Navigation, ScanLine, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { PlaceThumb } from '@/components/PlaceCard/PlaceCard'
import StampCard from '@/components/StampCard/StampCard'
import ReviewsSection from '@/components/Reviews/ReviewsSection'
import { HotBadge, LovedBadge, RatingInline, isLoved } from '@/components/Reviews/RatingStars'
import { usePlaces } from '@/hooks/usePlaces'

export default function PlaceDetail() {
  const { slug } = useParams()
  const { places, loading, reload } = usePlaces()
  const place = places.find((p) => p.slug === slug)

  if (loading && places.length === 0) return <div className="grid place-items-center py-20"><Spinner /></div>
  if (!place) {
    return (
      <div className="space-y-3">
        <Notice tone="warn">Không tìm thấy địa điểm này.</Notice>
        <Link to="/explore"><Button variant="outline">Về trang khám phá</Button></Link>
      </div>
    )
  }

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`

  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> Quay lại
      </Link>

      <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
        <PlaceThumb place={place} className="h-48 md:h-64" />
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={place.category?.color}>{place.category?.icon} {place.category?.name}</Badge>
            {place.isHot && <HotBadge />}
            {isLoved(place) && <LovedBadge />}
            <RatingInline place={place} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">{place.name}</h1>
          <p className="text-gray-700">{place.description}</p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> {place.address}</li>
            {place.partnerName && (
              <li className="flex items-start gap-2"><Store className="mt-0.5 size-4 shrink-0" /> Đối tác: {place.partnerName}</li>
            )}
          </ul>
          {place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((t) => <span key={t} className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-gray-600">#{t}</span>)}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <a href={directions} target="_blank" rel="noreferrer">
              <Button><Navigation className="size-4" /> Chỉ đường</Button>
            </a>
            <Link to="/scan"><Button variant="accent"><ScanLine className="size-4" /> Quét QR tại đây</Button></Link>
          </div>
        </div>
      </div>

      <ReviewsSection place={place} onChanged={reload} />

      {place.stamp && (
        <Card className="space-y-3 p-5">
          <h2 className="text-lg font-extrabold text-brand-800">Thẻ sưu tầm tại đây</h2>
          <p className="text-sm text-gray-600">Đến địa điểm và quét mã QR do đối tác đặt tại quầy để nhận thẻ này.</p>
          <StampCard stamp={place.stamp} placeName={place.name} category={place.category} />
        </Card>
      )}
    </article>
  )
}

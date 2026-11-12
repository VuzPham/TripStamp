import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCity } from '@/contexts/CityContext'
import { ArrowLeft, MapPin, Navigation, ScanLine, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { PlaceThumb } from '@/components/PlaceCard/PlaceCard'
import StampCard from '@/components/StampCard/StampCard'
import ReviewsSection from '@/components/Reviews/ReviewsSection'
import { HotBadge, LovedBadge, RatingInline, isLoved } from '@/components/Reviews/RatingStars'
import { usePlaces } from '@/hooks/usePlaces'
import PlacesMap from '@/components/Map/PlacesMap'
import PlaceCard from '@/components/PlaceCard/PlaceCard'
import LocationBanner from '@/components/Location/LocationBanner'

export default function PlaceDetail() {
  const { slug } = useParams()
  const { allPlaces: places, loading, reload } = usePlaces()
  const { cities, city, areas, setLocation } = useCity()
  const navigate = useNavigate()
  const place = places.find((p) => p.slug === slug)

  // Mở địa điểm của thành phố khác (ví dụ từ liên kết) thì chuyển luôn sang thành phố đó.
  useEffect(() => {
    if (place && place.cityId !== city.id) setLocation(place.cityId, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id])

  if (loading && places.length === 0) return <div className="grid place-items-center py-20"><Spinner /></div>
  if (!place) {
    return (
      <div className="space-y-3">
        <Notice tone="warn">Không tìm thấy địa điểm này.</Notice>
        <Link to="/explore"><Button variant="outline">Về trang khám phá</Button></Link>
      </div>
    )
  }

  const placeCity = cities.find((c) => c.id === place.cityId)
  const placeArea = areas.find((a) => a.id === place.areaId)
  const sameArea = places.filter((p) => p.id !== place.id && p.cityId === place.cityId && (!place.areaId || p.areaId === place.areaId))
  const others = sameArea.slice(0, 6)
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`

  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <LocationBanner size="compact" as="p" onSelect={() => navigate('/explore')} />
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> Quay lại
      </Link>

      <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
        <PlaceThumb place={place} className="h-56 md:h-72" />
        {place.imageCredit && (
          <p className="bg-brand-50 px-5 py-1.5 text-[11px] text-ink/60">
            {place.imageSource ? (
              <a href={place.imageSource} target="_blank" rel="noreferrer" className="underline">{place.imageCredit}</a>
            ) : (
              place.imageCredit
            )}
          </p>
        )}
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

      <section aria-labelledby="map" className="space-y-2">
        <h2 id="map" className="text-lg font-extrabold text-brand-800">Vị trí trên bản đồ</h2>
        <div className="overflow-hidden rounded-2xl border border-black/5">
          <PlacesMap className="h-64" center={{ lat: place.lat, lng: place.lng, zoom: 16 }} places={[place]} selectedId={place.id} focus={place} />
        </div>
      </section>

      <ReviewsSection place={place} onChanged={reload} />

      {others.length > 0 && (
        <section aria-labelledby="others" className="space-y-3">
          <h2 id="others" className="text-lg font-extrabold text-brand-800">Địa điểm khác ở {placeArea ? placeArea.name : placeCity?.name}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {others.map((p) => <PlaceCard key={p.id} place={p} />)}
          </div>
        </section>
      )}

      {place.stamp && (
        <Card className="space-y-3 p-5">
          <h2 className="text-lg font-extrabold text-brand-800">Thẻ sưu tầm tại đây</h2>
          <p className="text-sm text-gray-600">Đến địa điểm và quét mã QR do đối tác đặt tại quầy để nhận thẻ này.</p>
          <StampCard stamp={place.stamp} placeName={place.name} category={place.category} cityId={place.cityId} cityName={cities.find((c) => c.id === place.cityId)?.name} />
        </Card>
      )}
    </article>
  )
}

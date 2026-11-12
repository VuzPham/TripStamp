import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import { NHA_TRANG_CENTER } from '@/utils/geo'
import { PlaceThumb } from '@/components/PlaceCard/PlaceCard'
import { HotBadge, RatingInline } from '@/components/Reviews/RatingStars'

const iconCache = new Map()
function markerIcon(category, active, hot) {
  const key = `${category?.id}-${active}-${hot}`
  if (!iconCache.has(key)) {
    const color = category?.color ?? '#0f766e'
    const size = active ? 42 : 34
    iconCache.set(
      key,
      L.divIcon({
        className: 'ts-marker',
        html: `<div style="background:${color};${active ? 'width:42px;height:42px;' : ''}"><span>${category?.icon ?? '📍'}</span></div>${hot ? '<i style="position:absolute;top:-8px;right:-8px;font-style:normal;font-size:14px;">🔥</i>' : ''}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      }),
    )
  }
  return iconCache.get(key)
}

/** Tự căn bản đồ vừa với các marker đang hiển thị. */
function FitBounds({ places, focus }) {
  const map = useMap()
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], 16, { duration: 0.6 })
      return
    }
    if (places.length === 0) return
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [map, places, focus])
  return null
}

export default function PlacesMap({ places, selectedId, onSelect, userPosition, focus, className = 'h-full', center: city }) {
  const center = useMemo(() => [city?.lat ?? NHA_TRANG_CENTER.lat, city?.lng ?? NHA_TRANG_CENTER.lng], [city?.lat, city?.lng])
  return (
    <div className={className}>
      <MapContainer center={center} zoom={city?.zoom ?? 13} scrollWheelZoom className="rounded-2xl">
        {/* Tile OpenStreetMap: tuân thủ chính sách sử dụng tile (giữ attribution, không tải hàng loạt). */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FitBounds places={places} focus={focus} />
        {places.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={markerIcon(p.category, p.id === selectedId, p.isHot)}
            eventHandlers={{ click: () => onSelect?.(p.id) }}
          >
            <Popup minWidth={220} maxWidth={260}>
              <div className="-m-1 w-[220px] overflow-hidden">
                <PlaceThumb place={p} className="h-20 rounded-lg" />
                <div className="pt-2">
                  <p className="text-xs font-semibold" style={{ color: p.category?.color }}>
                    {p.category?.name}
                  </p>
                  <h3 className="text-base font-bold leading-tight">{p.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {p.isHot && <HotBadge />}
                    <RatingInline place={p} />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-600">{p.address}</p>
                  <p className="mt-1 text-xs text-gray-700">{p.description}</p>
                  <Link
                    to={`/places/${p.slug}`}
                    className="mt-2 inline-block rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold !text-white"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {userPosition && (
          <CircleMarker
            center={[userPosition.lat, userPosition.lng]}
            radius={8}
            pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
          />
        )}
      </MapContainer>
    </div>
  )
}

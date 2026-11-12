import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { NHA_TRANG_CENTER } from '@/utils/geo'

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

/** Bấm lên bản đồ để chọn toạ độ. */
export default function MapPicker({ lat, lng, onPick }) {
  const has = Number.isFinite(lat) && Number.isFinite(lng)
  const center = has ? [lat, lng] : [NHA_TRANG_CENTER.lat, NHA_TRANG_CENTER.lng]
  return (
    <div className="h-56 overflow-hidden rounded-lg border border-black/10">
      <MapContainer center={center} zoom={has ? 16 : 13} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onPick} />
        {has && <CircleMarker center={center} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#f97316', fillOpacity: 1 }} />}
      </MapContainer>
    </div>
  )
}

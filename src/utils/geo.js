const R = 6371000

const toRad = (d) => (d * Math.PI) / 180

/** Khoảng cách (mét) giữa hai toạ độ theo công thức Haversine. */
export function distanceMeters(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistance(m) {
  if (m == null || Number.isNaN(m)) return ''
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`
}

export const NHA_TRANG_CENTER = { lat: 12.2388, lng: 109.1967 }

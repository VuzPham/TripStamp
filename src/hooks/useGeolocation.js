import { useCallback, useState } from 'react'

/** Lấy vị trí hiện tại khi người dùng chủ động yêu cầu (không tự hỏi quyền lúc mở trang). */
export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Trình duyệt không hỗ trợ định vị.')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude })
        setLoading(false)
      },
      (e) => {
        setError(e.code === 1 ? 'Bạn đã từ chối quyền vị trí.' : 'Không lấy được vị trí hiện tại.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return { position, error, loading, locate }
}

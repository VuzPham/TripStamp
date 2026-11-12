import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCities, fetchAreas, fallbackCities } from '@/services/placeService'
import { useAsync } from '@/hooks/useAsync'
import { themeVars } from '@/utils/color'

const CityContext = createContext(null)
const STORAGE_KEY = 'tripstamp-location'

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

/**
 * Vị trí đang chọn (thành phố + khu vực) dùng chung cho Home, Explore, Place Detail.
 * Đổi vị trí => danh sách địa điểm, bản đồ, tiêu đề, ảnh nền và bảng màu cùng đổi theo.
 */
export function CityProvider({ children }) {
  const cityRes = useAsync(fetchCities, [])
  const areaRes = useAsync(fetchAreas, [])
  const cities = cityRes.data ?? fallbackCities
  const areas = areaRes.data ?? []
  const [loc, setLoc] = useState(() => {
    const s = readSaved()
    return { cityId: s.cityId ?? null, areaId: s.areaId ?? null }
  })

  const city = cities.find((c) => c.id === loc.cityId) ?? cities[0]
  const areasOfCity = useMemo(() => areas.filter((a) => a.cityId === city.id), [areas, city.id])
  const area = areasOfCity.find((a) => a.id === loc.areaId) ?? null

  const setLocation = useCallback((cityId, areaId = null) => {
    setLoc({ cityId, areaId })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cityId, areaId }))
    } catch {
      /* bỏ qua nếu storage bị chặn */
    }
  }, [])
  const setCityId = useCallback((id) => setLocation(id, null), [setLocation])
  const setAreaId = useCallback((id) => setLocation(city.id, id), [setLocation, city.id])

  useEffect(() => {
    const vars = themeVars(city.primary, city.accent)
    const root = document.documentElement
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', vars['--color-brand-800'])
  }, [city.primary, city.accent])

  const value = useMemo(
    () => ({ cities, city, areas, areasOfCity, area, setLocation, setCityId, setAreaId }),
    [cities, city, areas, areasOfCity, area, setLocation, setCityId, setAreaId],
  )
  return <CityContext.Provider value={value}>{children}</CityContext.Provider>
}

export function useCity() {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity phải được dùng bên trong <CityProvider>')
  return ctx
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, LocateFixed, MapPin, Search, X } from 'lucide-react'
import { useCity } from '@/contexts/CityContext'
import { usePlaces } from '@/hooks/usePlaces'
import { useGeolocation } from '@/hooks/useGeolocation'
import { distanceMeters } from '@/utils/geo'
import { normalize } from '@/utils/text'
import { Notice } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_CITY_DISTANCE = 60_000 // m: xa hơn mức này thì coi như chưa thuộc khu vực hỗ trợ
const MAX_AREA_DISTANCE = 4_000

/**
 * Bộ chọn vị trí dùng lại ở nhiều trang. Nút bấm mở một bảng (bottom sheet trên mobile) gồm:
 * tìm kiếm nhanh, dùng GPS, danh sách tỉnh/thành và khu vực.
 * Chọn xong sẽ cập nhật vị trí dùng chung (CityContext) nên mọi trang đổi theo.
 */
export default function LocationSelector({ variant = 'compact', onSelect, className }) {
  const { city, area } = useCity()
  const [open, setOpen] = useState(false)
  const label = area ? `${city.name} · ${area.name}` : city.name

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Khu vực đang xem: ${label}. Nhấn để đổi`}
        className={cn(
          variant === 'hero'
            ? 'flex max-w-full items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-left text-ink shadow-lg hover:bg-brand-50'
            : 'flex h-9 max-w-[12rem] items-center gap-1.5 rounded-full bg-white/15 px-3 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/25',
          className,
        )}
      >
        <MapPin className={cn('shrink-0', variant === 'hero' ? 'size-5 text-brand-700' : 'size-4')} />
        {variant === 'hero' ? (
          <span className="min-w-0">
            <span className="block text-[11px] font-medium text-ink/60">Khu vực đang xem</span>
            <span className="block truncate font-display text-base font-extrabold leading-tight">{label}</span>
          </span>
        ) : (
          <span className="truncate">{label}</span>
        )}
        <ChevronDown className={cn('shrink-0', variant === 'hero' ? 'ml-auto size-4 text-ink/60' : 'size-4 text-white/80')} />
      </button>
      {open && createPortal(<LocationSheet onClose={() => setOpen(false)} onSelect={onSelect} />, document.body)}
    </>
  )
}

function LocationSheet({ onClose, onSelect }) {
  const { cities, city, area, areas, setLocation } = useCity()
  const { allPlaces } = usePlaces()
  const navigate = useNavigate()
  const geo = useGeolocation()
  const askedGps = useRef(false)
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState({ cityId: city.id, areaId: area?.id ?? null })
  const [gpsNote, setGpsNote] = useState(null)

  // Khoá cuộn nền, phím Esc để đóng, focus vào ô tìm kiếm
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const commit = (cityId, areaId = null) => {
    setLocation(cityId, areaId)
    onSelect?.({ cityId, areaId })
    onClose()
  }

  // Tâm của từng khu vực = trung bình toạ độ các địa điểm thuộc khu vực đó
  const areaCenters = useMemo(() => {
    const acc = {}
    for (const p of allPlaces) {
      if (!p.areaId) continue
      const a = (acc[p.areaId] ??= { lat: 0, lng: 0, n: 0 })
      a.lat += p.lat
      a.lng += p.lng
      a.n += 1
    }
    return Object.fromEntries(Object.entries(acc).map(([id, a]) => [id, { lat: a.lat / a.n, lng: a.lng / a.n }]))
  }, [allPlaces])

  const countByCity = useMemo(() => {
    const m = {}
    for (const p of allPlaces) m[p.cityId] = (m[p.cityId] ?? 0) + 1
    return m
  }, [allPlaces])

  // GPS: chọn thành phố (và khu vực) gần vị trí hiện tại nhất
  useEffect(() => {
    if (!geo.position || !askedGps.current) return
    let bestCity = null
    for (const c of cities) {
      const d = distanceMeters(geo.position, c)
      if (!bestCity || d < bestCity.d) bestCity = { c, d }
    }
    if (!bestCity || bestCity.d > MAX_CITY_DISTANCE) {
      setGpsNote({ tone: 'warn', text: 'Vị trí hiện tại của bạn chưa nằm trong khu vực TripStamp hỗ trợ. Hãy chọn một thành phố trong danh sách.' })
      return
    }
    let bestArea = null
    for (const a of areas.filter((x) => x.cityId === bestCity.c.id)) {
      const ctr = areaCenters[a.id]
      if (!ctr) continue
      const d = distanceMeters(geo.position, ctr)
      if (!bestArea || d < bestArea.d) bestArea = { a, d }
    }
    commit(bestCity.c.id, bestArea && bestArea.d <= MAX_AREA_DISTANCE ? bestArea.a.id : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.position])

  const useGps = () => {
    askedGps.current = true
    setGpsNote(null)
    geo.locate()
  }

  const q = normalize(query)
  const results = useMemo(() => {
    if (!q) return null
    return {
      cities: cities.filter((c) => normalize(`${c.name} ${c.province ?? ''}`).includes(q)),
      areas: areas.filter((a) => normalize(a.name).includes(q)),
      places: allPlaces.filter((p) => normalize(`${p.name} ${p.address ?? ''} ${(p.tags ?? []).join(' ')}`).includes(q)).slice(0, 6),
    }
  }, [q, cities, areas, allPlaces])

  const cityName = (id) => cities.find((c) => c.id === id)?.name
  const draftCity = cities.find((c) => c.id === draft.cityId) ?? city
  const draftAreas = areas.filter((a) => a.cityId === draftCity.id)
  const draftArea = draftAreas.find((a) => a.id === draft.areaId)
  const noResults = results && !results.cities.length && !results.areas.length && !results.places.length

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 md:items-center md:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chọn khu vực"
        onClick={(e) => e.stopPropagation()}
        className="sheet-in flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"
      >
        <div className="space-y-3 border-b border-black/5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold text-brand-800">Chọn khu vực</h2>
            <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
              <X className="size-5" />
            </button>
          </div>
          <label className="relative block">
            <span className="sr-only">Tìm thành phố, khu vực hoặc địa danh</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm thành phố, quận/huyện hoặc địa danh…"
              className="h-11 w-full rounded-xl border border-black/10 pl-9 pr-3 text-base outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
            />
          </label>
          <button
            type="button"
            onClick={useGps}
            disabled={geo.loading}
            className="flex w-full items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100 disabled:opacity-60"
          >
            <LocateFixed className="size-4" />
            {geo.loading ? 'Đang xác định vị trí…' : 'Dùng vị trí hiện tại của tôi'}
          </button>
          {geo.error && <Notice tone="warn">{geo.error} Bạn vẫn có thể chọn khu vực thủ công.</Notice>}
          {gpsNote && <Notice tone={gpsNote.tone}>{gpsNote.text}</Notice>}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {results ? (
            <div className="space-y-4">
              {noResults && <p className="py-6 text-center text-sm text-gray-500">Không tìm thấy “{query}”. Thử tên thành phố, quận hoặc địa danh khác.</p>}
              {results.cities.length > 0 && (
                <ResultGroup title="Thành phố">
                  {results.cities.map((c) => (
                    <ResultRow key={c.id} onClick={() => commit(c.id)} title={c.name} sub={c.province} />
                  ))}
                </ResultGroup>
              )}
              {results.areas.length > 0 && (
                <ResultGroup title="Khu vực">
                  {results.areas.map((a) => (
                    <ResultRow key={a.id} onClick={() => commit(a.cityId, a.id)} title={a.name} sub={cityName(a.cityId)} />
                  ))}
                </ResultGroup>
              )}
              {results.places.length > 0 && (
                <ResultGroup title="Địa danh">
                  {results.places.map((p) => (
                    <ResultRow
                      key={p.id}
                      onClick={() => {
                        setLocation(p.cityId, p.areaId)
                        onClose()
                        navigate(`/places/${p.slug}`)
                      }}
                      title={p.name}
                      sub={cityName(p.cityId)}
                    />
                  ))}
                </ResultGroup>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <section aria-label="Tỉnh / thành phố">
                <h3 className="mb-2 text-sm font-bold text-gray-700">Tỉnh / thành phố</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cities.map((c) => {
                    const active = c.id === draft.cityId
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setDraft({ cityId: c.id, areaId: null })}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors',
                          active ? 'border-brand-700 bg-brand-50 ring-1 ring-brand-700' : 'border-black/10 hover:bg-gray-50',
                        )}
                      >
                        <span className="size-8 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{c.name}</span>
                          <span className="block text-[11px] text-gray-500">{countByCity[c.id] ?? 0} địa điểm</span>
                        </span>
                        {active && <Check className="size-4 shrink-0 text-brand-700" />}
                      </button>
                    )
                  })}
                </div>
              </section>

              {draftAreas.length > 0 && (
                <section aria-label={`Khu vực ở ${draftCity.name}`}>
                  <h3 className="mb-2 text-sm font-bold text-gray-700">Khu vực ở {draftCity.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <AreaChip active={!draft.areaId} onClick={() => setDraft((d) => ({ ...d, areaId: null }))}>Tất cả khu vực</AreaChip>
                    {draftAreas.map((a) => (
                      <AreaChip key={a.id} active={a.id === draft.areaId} onClick={() => setDraft((d) => ({ ...d, areaId: a.id }))}>
                        {a.name}
                      </AreaChip>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {!results && (
          <div className="border-t border-black/5 p-4 pb-safe">
            <Button className="w-full" onClick={() => commit(draftCity.id, draftArea?.id ?? null)}>
              Xem {draftCity.name}{draftArea ? ` · ${draftArea.name}` : ''}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultGroup({ title, children }) {
  return (
    <section>
      <h3 className="mb-1.5 text-xs font-bold text-gray-500">{title}</h3>
      <ul className="divide-y divide-black/5 rounded-xl border border-black/10">{children}</ul>
    </section>
  )
}

function ResultRow({ title, sub, onClick }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-brand-50">
        <MapPin className="size-4 shrink-0 text-brand-700" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{title}</span>
          {sub && <span className="block truncate text-xs text-gray-500">{sub}</span>}
        </span>
      </button>
    </li>
  )
}

function AreaChip({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors',
        active ? 'border-brand-700 bg-brand-700 text-white' : 'border-black/10 bg-white text-gray-700 hover:bg-brand-50',
      )}
      {...props}
    >
      {children}
    </button>
  )
}

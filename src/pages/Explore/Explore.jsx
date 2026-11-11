import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, LocateFixed, X } from 'lucide-react'
import PlacesMap from '@/components/Map/PlacesMap'
import PlaceCard from '@/components/PlaceCard/PlaceCard'
import { Notice, Spinner } from '@/components/ui/card'
import { usePlaces } from '@/hooks/usePlaces'
import { useGeolocation } from '@/hooks/useGeolocation'
import { distanceMeters } from '@/utils/geo'
import { normalize } from '@/utils/text'
import { cn } from '@/lib/utils'
import { isLoved } from '@/components/Reviews/RatingStars'

export default function Explore() {
  const { places, categories, loading, error } = usePlaces()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [sortByDistance, setSortByDistance] = useState(false)
  const geo = useGeolocation()

  const activeCategory = params.get('category') ?? 'all'
  const special = params.get('filter') // 'hot' | 'top' | null

  const filtered = useMemo(() => {
    const q = normalize(query)
    let list = places.filter((p) => {
      if (activeCategory !== 'all' && p.category?.id !== activeCategory) return false
      if (special === 'hot' && !p.isHot) return false
      if (special === 'top' && !(p.reviewCount > 0 && (p.rating ?? 0) >= 4)) return false
      if (!q) return true
      return normalize([p.name, p.description, p.address, p.category?.name, ...(p.tags ?? [])].join(' ')).includes(q)
    })
    if (geo.position) {
      list = list.map((p) => ({ ...p, distance: distanceMeters(geo.position, p) }))
      if (sortByDistance) list = [...list].sort((a, b) => a.distance - b.distance)
    }
    if (special === 'hot') list = [...list].sort((a, b) => b.hotScore - a.hotScore)
    if (special === 'top') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount)
    return list
  }, [places, query, activeCategory, special, geo.position, sortByDistance])

  const selected = filtered.find((p) => p.id === selectedId) ?? null

  function setSpecial(value) {
    const next = new URLSearchParams(params)
    if (special === value) next.delete('filter')
    else next.set('filter', value)
    setParams(next, { replace: true })
    setSelectedId(null)
  }

  function setCategory(id) {
    const next = new URLSearchParams(params)
    if (id === 'all') next.delete('category')
    else next.set('category', id)
    setParams(next, { replace: true })
    setSelectedId(null)
  }

  function onLocate() {
    geo.locate()
    setSortByDistance(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Tìm địa điểm</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm quán, món, chủ đề…"
            className="h-11 w-full rounded-xl border border-black/10 bg-white pl-9 pr-9 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
          {query && (
            <button type="button" aria-label="Xoá" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100">
              <X className="size-4" />
            </button>
          )}
        </label>
        <button
          type="button"
          onClick={onLocate}
          disabled={geo.loading}
          className={cn(
            'flex h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold',
            geo.position ? 'border-brand-700 bg-brand-700 text-white' : 'border-black/10 bg-white text-brand-800 hover:bg-brand-50',
          )}
        >
          <LocateFixed className="size-4" /> <span className="hidden sm:inline">Gần tôi</span>
        </button>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Lọc theo chủ đề">
        <Chip active={activeCategory === 'all'} onClick={() => setCategory('all')}>Tất cả</Chip>
        <Chip active={special === 'hot'} onClick={() => setSpecial('hot')}>🔥 Hot</Chip>
        <Chip active={special === 'top'} onClick={() => setSpecial('top')}>⭐ Đánh giá cao</Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={activeCategory === c.id} onClick={() => setCategory(c.id)}>
            {c.icon} {c.name}
          </Chip>
        ))}
      </div>

      {geo.error && <Notice tone="warn">{geo.error}</Notice>}
      {error && <Notice tone="error">Không tải được dữ liệu địa điểm. Vui lòng thử lại sau.</Notice>}

      <div className="grid gap-4 md:grid-cols-[1fr_340px]">
        <div className="h-[46vh] overflow-hidden rounded-2xl border border-black/5 md:sticky md:top-20 md:h-[calc(100vh-11rem)]">
          {loading ? (
            <div className="grid h-full place-items-center bg-white"><Spinner /></div>
          ) : (
            <PlacesMap places={filtered} selectedId={selectedId} onSelect={setSelectedId} userPosition={geo.position} focus={selected} />
          )}
        </div>

        <section aria-label="Danh sách địa điểm" className="space-y-3">
          <p className="text-sm font-medium text-gray-600">{filtered.length} địa điểm</p>
          {filtered.length === 0 && !loading && (
            <Notice>Không có địa điểm phù hợp. Thử từ khoá hoặc chủ đề khác.</Notice>
          )}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            {filtered.map((p) => (
              <div key={p.id} onMouseEnter={() => setSelectedId(p.id)}>
                <PlaceCard place={p} distance={p.distance} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        'shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
        active ? 'border-brand-700 bg-brand-700 text-white' : 'border-black/10 bg-white text-gray-700 hover:bg-brand-50',
      )}
      {...props}
    >
      {children}
    </button>
  )
}

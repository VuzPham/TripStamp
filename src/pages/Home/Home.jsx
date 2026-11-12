import { Link } from 'react-router-dom'
import { ArrowRight, Map, ScanLine, Stamp, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Postmark from '@/components/Postmark'
import { useCity } from '@/contexts/CityContext'
import { cn } from '@/lib/utils'
import { Card, Spinner, Notice } from '@/components/ui/card'
import PlaceCard from '@/components/PlaceCard/PlaceCard'
import { usePlaces } from '@/hooks/usePlaces'
import LocationBanner from '@/components/Location/LocationBanner'

const steps = [
  { icon: Map, title: 'Khám phá', text: 'Tìm những địa điểm bản địa trên bản đồ thành phố bạn chọn.' },
  { icon: ScanLine, title: 'Quét QR', text: 'Quét mã tại điểm check-in để xác nhận bạn đã ghé.' },
  { icon: Stamp, title: 'Sưu tầm tem', text: 'Mỗi nơi bạn đến để lại một thẻ số trong bộ sưu tập.' },
  { icon: Gift, title: 'Nhận ưu đãi', text: 'Đủ số thẻ để đổi ưu đãi từ các đối tác địa phương.' },
]

export default function Home() {
  const { places, categories, loading, error } = usePlaces()
  const { city, cities, area, setLocation } = useCity()
  const where = area ? area.name : city.name
  const hot = places.filter((p) => p.isHot).sort((a, b) => b.hotScore - a.hotScore).slice(0, 4)
  const used = new Set(hot.map((p) => p.id))
  const top = places
    .filter((p) => !used.has(p.id) && p.reviewCount > 0 && (p.rating ?? 0) >= 4)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount)
    .slice(0, 4)
  top.forEach((p) => used.add(p.id))
  const featured = [...places.filter((p) => p.featured && !used.has(p.id)), ...places.filter((p) => !p.featured && !used.has(p.id))].slice(0, 4)

  return (
    <div className="space-y-8">
      <LocationBanner
        size="hero"
        aside={
          <div className="relative mx-auto w-full max-w-[17rem] md:max-w-xs">
            <div key={city.id} className="stamp-in drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]" style={{ '--tilt': '3deg' }}>
              <div className="perf bg-white">
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-100">
                  <img
                    src={city.heroImage || '/images/hero.svg'}
                    alt={`Ảnh ${city.name}`}
                    className="size-full object-cover"
                    onError={(e) => { if (!e.currentTarget.src.endsWith('/images/hero.svg')) e.currentTarget.src = '/images/hero.svg' }}
                  />
                  <div className="absolute left-3 top-3 rounded-md bg-white/90 px-3 py-1.5 text-ink shadow">
                    <span className="font-display text-3xl font-extrabold leading-none">{places.length}</span>
                    <span className="ml-1.5 text-xs font-semibold">điểm đến</span>
                  </div>
                </div>
              </div>
            </div>
            <Postmark label={city.name} className="pointer-events-none absolute -bottom-6 -left-10 w-[15rem] -rotate-6 text-stamp md:-left-14 md:w-[17rem]" />
          </div>
        }
      >
        <div className="flex flex-wrap gap-3 pt-1">
          <Link to="/explore"><Button variant="accent" size="lg">Khám phá {area ? area.name : city.name} <ArrowRight className="size-4" /></Button></Link>
          <Link to="/scan"><Button size="lg" className="bg-white/15 ring-1 ring-white/30 hover:bg-white/25"><ScanLine className="size-4" /> Quét QR</Button></Link>
        </div>
        <div role="group" aria-label="Chọn nhanh thành phố" className="flex flex-wrap gap-2 pt-1">
          {cities.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={c.id === city.id}
              onClick={() => setLocation(c.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors',
                c.id === city.id ? 'bg-white text-brand-800 ring-white' : 'bg-white/10 text-white ring-white/30 hover:bg-white/20',
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </LocationBanner>

      <section aria-labelledby="how" className="space-y-3">
        <h2 id="how" className="text-xl font-extrabold text-brand-800">Cách hoạt động</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <Card key={title} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-brand-100 text-brand-700"><Icon className="size-4" /></span>
                <span className="text-xs font-bold text-gray-400">0{i + 1}</span>
              </div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="cats" className="space-y-3">
        <h2 id="cats" className="text-xl font-extrabold text-brand-800">Khám phá theo chủ đề</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/explore?category=${c.id}`}
              className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-brand-50"
            >
              <span>{c.icon}</span> {c.name}
            </Link>
          ))}
        </div>
      </section>

      {hot.length > 0 && (
        <section aria-labelledby="hot" className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 id="hot" className="text-xl font-extrabold text-brand-800">🔥 Đang hot ở {where}</h2>
            <Link to="/explore?filter=hot" className="text-sm font-semibold text-brand-700 hover:underline">Xem tất cả</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {hot.map((p) => <PlaceCard key={p.id} place={p} />)}
          </div>
        </section>
      )}

      {top.length > 0 && (
        <section aria-labelledby="top" className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 id="top" className="text-xl font-extrabold text-brand-800">⭐ Được đánh giá cao</h2>
            <Link to="/explore?filter=top" className="text-sm font-semibold text-brand-700 hover:underline">Xem tất cả</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {top.map((p) => <PlaceCard key={p.id} place={p} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="featured" className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 id="featured" className="text-xl font-extrabold text-brand-800">Địa điểm nổi bật ở {where}</h2>
          <Link to="/explore" className="text-sm font-semibold text-brand-700 hover:underline">Xem tất cả</Link>
        </div>
        {loading && <div className="grid place-items-center py-10"><Spinner /></div>}
        {error && <Notice tone="error">Không tải được danh sách địa điểm. Vui lòng thử lại sau.</Notice>}
        {!loading && places.length === 0 && <Notice>Chưa có địa điểm ở khu vực này. Hãy thử chọn khu vực khác.</Notice>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {featured.map((p) => <PlaceCard key={p.id} place={p} />)}
        </div>
      </section>
    </div>
  )
}

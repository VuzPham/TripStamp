import { Link } from 'react-router-dom'
import { ArrowRight, Map, ScanLine, Stamp, Gift, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Postmark from '@/components/Postmark'
import { useCity } from '@/contexts/CityContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Card, Spinner, Notice } from '@/components/ui/card'
import PlaceCard, { PlaceThumb } from '@/components/PlaceCard/PlaceCard'
import { RatingInline } from '@/components/Reviews/RatingStars'
import { usePlaces } from '@/hooks/usePlaces'
import { categoryArt, cityArt } from '@/utils/art'
import LocationBanner from '@/components/Location/LocationBanner'

const steps = [
  { icon: Map, title: 'Khám phá', text: 'Tìm những địa điểm bản địa trên bản đồ thành phố bạn chọn.' },
  { icon: ScanLine, title: 'Quét QR', text: 'Quét mã tại điểm check-in để xác nhận bạn đã ghé.' },
  { icon: Stamp, title: 'Sưu tầm tem', text: 'Mỗi nơi bạn đến để lại một thẻ số trong bộ sưu tập.' },
  { icon: Gift, title: 'Nhận ưu đãi', text: 'Đủ số thẻ để đổi ưu đãi từ các đối tác địa phương.' },
]

function SectionHead({ id, title, to, linkText = 'Xem tất cả' }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 id={id} className="text-xl font-extrabold text-brand-800">{title}</h2>
      {to && <Link to={to} className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">{linkText}</Link>}
    </div>
  )
}

export default function Home() {
  const { places, allPlaces, categories, loading, error } = usePlaces()
  const { city, cities, area, setLocation } = useCity()
  const { user, isDemo } = useAuth()
  const where = area ? area.name : city.name

  const hot = places.filter((p) => p.isHot).sort((a, b) => b.hotScore - a.hotScore).slice(0, 4)
  const used = new Set(hot.map((p) => p.id))
  const spotlight = [...places.filter((p) => p.featured && !used.has(p.id)), ...places.filter((p) => !p.featured && !used.has(p.id))].slice(0, 4)
  spotlight.forEach((p) => used.add(p.id))
  const top = places
    .filter((p) => !used.has(p.id) && p.reviewCount > 0 && (p.rating ?? 0) >= 4)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount)
    .slice(0, 4)
  const otherCities = cities.filter((c) => c.id !== city.id)
  const countIn = (cityId) => allPlaces.filter((p) => p.cityId === cityId).length
  const stats = [
    { value: allPlaces.length, label: 'địa điểm bản địa' },
    { value: cities.length, label: 'thành phố' },
    { value: allPlaces.reduce((n, p) => n + p.reviewCount, 0), label: 'đánh giá' },
    { value: allPlaces.filter((p) => p.isHot).length, label: 'điểm đang hot' },
  ]

  return (
    <div className="space-y-10">
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

      <dl className="grid grid-cols-2 gap-y-4 rounded-2xl border border-black/5 bg-white py-4 shadow-sm md:grid-cols-4 md:divide-x md:divide-black/5">
        {stats.map((st) => (
          <div key={st.label} className="px-4 text-center">
            <dd className="font-display text-3xl font-extrabold text-brand-800">{st.value}</dd>
            <dt className="text-xs font-medium text-gray-600">{st.label}</dt>
          </div>
        ))}
      </dl>

      {error && <Notice tone="error">Không tải được danh sách địa điểm. Vui lòng thử lại sau.</Notice>}
      {loading && <div className="grid place-items-center py-6"><Spinner /></div>}

      <section aria-labelledby="cats" className="space-y-3">
        <SectionHead id="cats" title="Bạn muốn làm gì hôm nay?" />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
          {categories.map((c) => {
            const n = places.filter((p) => p.category?.id === c.id).length
            return (
              <Link
                key={c.id}
                to={`/explore?category=${c.id}`}
                className="group relative aspect-[4/5] w-32 shrink-0 snap-start overflow-hidden rounded-2xl bg-brand-800 md:w-auto"
              >
                <img src={categoryArt(c.id)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 text-white">
                  <span className="block text-2xl">{c.icon}</span>
                  <span className="block text-sm font-bold leading-tight">{c.name}</span>
                  <span className="block text-xs text-white/80">{n} ở {where}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {hot.length > 0 && (
        <section aria-labelledby="hot" className="space-y-3">
          <SectionHead id="hot" title={`🔥 Đang hot ở ${where}`} to="/explore?filter=hot" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {hot.map((p) => <PlaceCard key={p.id} place={p} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="featured" className="space-y-3">
        <SectionHead id="featured" title={`Nổi bật ở ${where}`} to="/explore" />
        {!loading && places.length === 0 && <Notice>Chưa có địa điểm ở khu vực này. Hãy thử chọn khu vực khác.</Notice>}
        {spotlight.length > 0 && (
          <div className="grid gap-3 md:grid-cols-[1.3fr_1fr]">
            <Link to={`/places/${spotlight[0].slug}`} className="group relative block min-h-64 overflow-hidden rounded-3xl bg-brand-800">
              <PlaceThumb place={spotlight[0]} className="absolute inset-0 h-full transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute inset-x-5 bottom-5 space-y-1 text-white">
                <span className="text-xs font-semibold text-white/85">{spotlight[0].category?.icon} {spotlight[0].category?.name}</span>
                <span className="block font-display text-2xl font-extrabold leading-tight">{spotlight[0].name}</span>
                <span className="line-clamp-2 block text-sm text-white/85">{spotlight[0].description}</span>
              </span>
            </Link>
            <ul className="space-y-3">
              {spotlight.slice(1).map((p) => (
                <li key={p.id}>
                  <Link to={`/places/${p.slug}`} className="flex gap-3 rounded-2xl border border-black/5 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
                    <PlaceThumb place={p} className="size-20 shrink-0 rounded-xl" />
                    <span className="min-w-0 flex-1 py-1">
                      <span className="block text-xs text-gray-500">{p.category?.icon} {p.category?.name}</span>
                      <span className="block truncate font-bold">{p.name}</span>
                      <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-600"><MapPin className="size-3 shrink-0" />{p.address}</span>
                      <RatingInline place={p} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {otherCities.length > 0 && (
        <section aria-labelledby="cities" className="space-y-3">
          <SectionHead id="cities" title="Điểm đến khác" />
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {otherCities.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setLocation(c.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="group relative h-44 w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-brand-800 text-left md:w-auto"
              >
                <img
                  src={cityArt(c)}
                  alt=""
                  loading="lazy"
                  onError={(e) => { if (!e.currentTarget.src.endsWith('/images/hero.svg')) e.currentTarget.src = '/images/hero.svg' }}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute inset-x-4 bottom-3 text-white">
                  <span className="block font-display text-xl font-extrabold">{c.name}</span>
                  <span className="block text-xs text-white/85">{c.province || c.name} · {countIn(c.id)} địa điểm</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {top.length > 0 && (
        <section aria-labelledby="top" className="space-y-3">
          <SectionHead id="top" title="⭐ Được đánh giá cao" to="/explore?filter=top" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {top.map((p) => <PlaceCard key={p.id} place={p} />)}
          </div>
        </section>
      )}

      <section id="how" aria-labelledby="how-title" className="scroll-mt-20 space-y-3">
        <SectionHead id="how-title" title="Cách hoạt động" />
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

      <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-brand-800 p-6 text-white md:flex-row md:items-center md:p-8">
        <div className="max-w-md">
          <h2 className="font-display text-2xl font-extrabold">Sẵn sàng sưu tầm con tem đầu tiên?</h2>
          <p className="mt-1 text-white/85">
            {user || isDemo ? 'Quét mã QR tại điểm check-in để nhận thẻ và đổi ưu đãi.' : 'Tạo tài khoản miễn phí để lưu bộ sưu tập và đổi ưu đãi từ đối tác địa phương.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user || isDemo ? (
            <Link to="/scan"><Button variant="accent" size="lg"><ScanLine className="size-4" /> Quét QR</Button></Link>
          ) : (
            <>
              <Link to="/register"><Button variant="accent" size="lg">Đăng ký miễn phí</Button></Link>
              <Link to="/login"><Button size="lg" className="bg-white/15 ring-1 ring-white/30 hover:bg-white/25">Đăng nhập</Button></Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

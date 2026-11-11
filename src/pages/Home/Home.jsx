import { Link } from 'react-router-dom'
import { ArrowRight, Map, ScanLine, Stamp, Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, Spinner, Notice } from '@/components/ui/card'
import PlaceCard from '@/components/PlaceCard/PlaceCard'
import { usePlaces } from '@/hooks/usePlaces'

const steps = [
  { icon: Map, title: 'Khám phá', text: 'Tìm những địa điểm bản địa trên bản đồ Nha Trang.' },
  { icon: ScanLine, title: 'Quét QR', text: 'Quét mã tại điểm check-in để xác nhận bạn đã ghé.' },
  { icon: Stamp, title: 'Sưu tầm tem', text: 'Mỗi nơi bạn đến để lại một thẻ số trong bộ sưu tập.' },
  { icon: Gift, title: 'Nhận ưu đãi', text: 'Đủ số thẻ để đổi ưu đãi từ các đối tác địa phương.' },
]

export default function Home() {
  const { places, categories, loading, error } = usePlaces()
  const hot = [...places].filter((p) => p.isHot).sort((a, b) => b.hotScore - a.hotScore).slice(0, 4)
  const featured = places.slice(0, 4)

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-brand-800 p-6 text-white md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 size-56 rotate-12 rounded-2xl border-[6px] border-dashed border-white/20" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative max-w-xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-100">Nha Trang · Local discovery</p>
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">Every Trip Leaves a Stamp.</h1>
          <p className="text-brand-50/90">
            Khám phá quán ngon, góc cà phê và trải nghiệm bản địa. Quét QR tại nơi bạn đến để sưu tầm thẻ số và đổi ưu đãi.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link to="/explore"><Button variant="accent" size="lg">Khám phá bản đồ <ArrowRight className="size-4" /></Button></Link>
            <Link to="/scan"><Button size="lg" className="bg-white/15 hover:bg-white/25">Quét QR</Button></Link>
          </div>
        </motion.div>
      </section>

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
            <h2 id="hot" className="text-xl font-extrabold text-brand-800">🔥 Địa điểm đang hot</h2>
            <Link to="/explore?filter=hot" className="text-sm font-semibold text-brand-700 hover:underline">Xem tất cả</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {hot.map((p) => <PlaceCard key={p.id} place={p} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="featured" className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 id="featured" className="text-xl font-extrabold text-brand-800">Địa điểm nổi bật</h2>
          <Link to="/explore" className="text-sm font-semibold text-brand-700 hover:underline">Xem tất cả</Link>
        </div>
        {loading && <div className="grid place-items-center py-10"><Spinner /></div>}
        {error && <Notice tone="error">Không tải được danh sách địa điểm. Vui lòng thử lại sau.</Notice>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {featured.map((p) => <PlaceCard key={p.id} place={p} />)}
        </div>
      </section>
    </div>
  )
}

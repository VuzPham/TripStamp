import { Notice, Spinner, Card } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { adminStats } from '../services/adminService'
import { PageHeader, errorText } from '../components/ui'

export default function Dashboard() {
  const { data, loading, error } = useAsync(adminStats, [])

  if (loading) return <div className="grid place-items-center py-20"><Spinner /></div>
  if (error) return <Notice tone="error">{errorText(error)}</Notice>

  const maxDay = Math.max(1, ...data.by_day.map((d) => d.count))
  const maxPlace = Math.max(1, ...data.by_place.map((d) => d.count))
  const tiles = [
    ['Người dùng', data.users],
    ['Địa điểm đang hiển thị', data.places],
    ['Thẻ đã được nhận', data.stamps_claimed],
    ['Ưu đãi đã đổi', data.redemptions],
    ['Đã sử dụng tại quầy', data.redemptions_used],
  ]

  return (
    <>
      <PageHeader title="Tổng quan" subtitle="Số liệu hoạt động của TripStamp." />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-2xl font-extrabold text-brand-800">{value}</p>
            <p className="text-xs text-gray-600">{label}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 font-bold">Thẻ nhận theo ngày (14 ngày gần nhất)</h2>
          {data.by_day.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có lượt nhận thẻ nào.</p>
          ) : (
            <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Biểu đồ cột số thẻ nhận theo ngày">
              {data.by_day.map((d) => (
                <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-gray-600">{d.count}</span>
                  <div className="w-full rounded-t bg-brand-600" style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: 4 }} />
                  <span className="text-[9px] text-gray-500">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 font-bold">Địa điểm được quét nhiều nhất</h2>
          {data.by_place.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-2">
              {data.by_place.map((p) => (
                <li key={p.name} className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="truncate">{p.name}</span>
                    <b>{p.count}</b>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-stamp" style={{ width: `${(p.count / maxPlace) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}

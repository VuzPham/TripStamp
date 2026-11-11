import { useState } from 'react'
import { Search, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { adminListRedemptions, adminMarkRedeemed } from '../services/adminService'
import { PageHeader, errorText, inputCls } from '../components/ui'

const statusMeta = {
  issued: ['Chưa dùng', 'bg-amber-100 text-amber-800'],
  used: ['Đã sử dụng', 'bg-emerald-100 text-emerald-800'],
  cancelled: ['Đã huỷ', 'bg-gray-200 text-gray-700'],
}
const markMessages = {
  ok: ['success', 'Đã đánh dấu sử dụng.'],
  already_used: ['warn', 'Mã này đã được sử dụng trước đó.'],
  cancelled: ['warn', 'Mã này đã bị huỷ.'],
  not_found: ['error', 'Không tìm thấy mã.'],
  forbidden: ['error', 'Bạn không có quyền thực hiện.'],
}

export default function Redemptions() {
  const [code, setCode] = useState('')
  const [filter, setFilter] = useState('')
  const list = useAsync(() => adminListRedemptions(filter || null), [filter])
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(null)

  async function mark(c) {
    setBusy(c)
    setMessage(null)
    try {
      const res = await adminMarkRedeemed(c)
      const [tone, text] = markMessages[res.status] ?? ['error', 'Không thể xử lý.']
      setMessage({ tone, text })
      list.reload()
    } catch (e) {
      setMessage({ tone: 'error', text: errorText(e) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <PageHeader title="Đổi thưởng" subtitle="Tra mã khách đưa ra tại quầy và đánh dấu đã sử dụng." />
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setFilter(code.trim())
        }}
      >
        <input className={`${inputCls} font-mono uppercase`} placeholder="Nhập mã, ví dụ TS-1A2B3C4D" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button type="submit" variant="outline"><Search className="size-4" /> Tra mã</Button>
        {filter && <Button type="button" variant="ghost" onClick={() => { setFilter(''); setCode('') }}>Xoá lọc</Button>}
      </form>
      {message && <Notice tone={message.tone} className="mb-3">{message.text}</Notice>}
      {list.loading && <div className="grid place-items-center py-12"><Spinner /></div>}
      {list.error && <Notice tone="error">{errorText(list.error)}</Notice>}
      {list.data?.length === 0 && <Notice>{filter ? 'Không tìm thấy mã này.' : 'Chưa có lượt đổi thưởng nào.'}</Notice>}
      <div className="grid gap-2">
        {list.data?.map((r) => {
          const [label, cls] = statusMeta[r.status] ?? [r.status, 'bg-gray-100']
          return (
            <Card key={r.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-mono text-lg font-extrabold text-brand-800">{r.code}</p>
                <p className="text-sm font-semibold">{r.reward_title}{r.partner_name ? ` · ${r.partner_name}` : ''}</p>
                <p className="truncate text-xs text-gray-500">{r.display_name ?? '—'} · {r.email} · {new Date(r.created_at).toLocaleString('vi-VN')}</p>
              </div>
              <Badge className={cls}>{label}</Badge>
              {r.status === 'issued' && (
                <Button size="sm" variant="accent" disabled={busy === r.code} onClick={() => window.confirm(`Xác nhận khách đã nhận ưu đãi ${r.code}?`) && mark(r.code)}>
                  <CheckCircle2 className="size-4" /> Đánh dấu đã dùng
                </Button>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}

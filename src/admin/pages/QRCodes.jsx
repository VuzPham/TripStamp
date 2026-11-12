import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Plus, Printer, Ban, RotateCcw, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { adminListQr, adminListPlaces, createQr, setQrActive, deleteQr } from '../services/adminService'
import { Field, Modal, PageHeader, errorText, inputCls } from '../components/ui'
import { buildClaimUrl } from '@/utils/token'

const one = (v) => (Array.isArray(v) ? v[0] : v) ?? null

function qrState(q) {
  if (!q.is_active) return ['Đã thu hồi', 'bg-gray-200 text-gray-700']
  if (q.expires_at && new Date(q.expires_at) < new Date()) return ['Hết hạn', 'bg-red-100 text-red-800']
  if (q.max_total_claims != null && q.claim_count >= q.max_total_claims) return ['Hết lượt', 'bg-amber-100 text-amber-800']
  return ['Đang hoạt động', 'bg-emerald-100 text-emerald-800']
}

export default function QRCodes() {
  const qrs = useAsync(adminListQr, [])
  const places = useAsync(adminListPlaces, [])
  const [creating, setCreating] = useState(false)
  const [printing, setPrinting] = useState(null)
  const [error, setError] = useState('')

  async function run(fn) {
    setError('')
    try {
      await fn()
      qrs.reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  return (
    <>
      <PageHeader
        title="Mã QR"
        subtitle="Tạo mã ngẫu nhiên cho từng địa điểm, in và dán tại quầy. Mã chứa liên kết nhận thẻ."
        action={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> Tạo mã QR</Button>}
      />
      {error && <Notice tone="error" className="mb-3">{error}</Notice>}
      {qrs.loading && <div className="grid place-items-center py-16"><Spinner /></div>}
      {qrs.error && <Notice tone="error">{errorText(qrs.error)}</Notice>}
      <div className="grid gap-2">
        {qrs.data?.map((q) => {
          const [label, cls] = qrState(q)
          return (
            <Card key={q.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{one(q.places)?.name ?? '(địa điểm đã xoá)'}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
                  <Badge className={cls}>{label}</Badge>
                  <span>{q.claim_count}{q.max_total_claims != null ? `/${q.max_total_claims}` : ''} lượt nhận</span>
                  {q.expires_at && <span>· hạn {new Date(q.expires_at).toLocaleDateString('vi-VN')}</span>}
                  <span className="font-mono text-gray-400">· …{q.token.slice(-6)}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPrinting(q)}><Printer className="size-4" /> Xem / In</Button>
              <Button variant="ghost" size="sm" onClick={() => run(() => setQrActive(q.id, !q.is_active))}>
                {q.is_active ? <><Ban className="size-4" /> Thu hồi</> : <><RotateCcw className="size-4" /> Kích hoạt</>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Xoá mã QR"
                onClick={() => window.confirm('Xoá mã QR này? Mã đã in sẽ không dùng được nữa.') && run(() => deleteQr(q.id))}
              >
                <Trash2 className="size-4 text-red-600" />
              </Button>
            </Card>
          )
        })}
        {qrs.data?.length === 0 && <Notice>Chưa có mã QR nào. Nhấn “Tạo mã QR” để bắt đầu.</Notice>}
      </div>

      {creating && (
        <CreateForm
          places={places.data ?? []}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            qrs.reload()
          }}
        />
      )}
      {printing && <PrintView qr={printing} onClose={() => setPrinting(null)} />}
    </>
  )
}

function CreateForm({ places, onClose, onSaved }) {
  const [f, setF] = useState({ place_id: '', expires_at: '', max_total_claims: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createQr({ ...f, expires_at: f.expires_at ? new Date(`${f.expires_at}T23:59:59`).toISOString() : null })
      onSaved()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Tạo mã QR" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Địa điểm *">
          <select required className={inputCls} value={f.place_id} onChange={set('place_id')}>
            <option value="">— Chọn địa điểm —</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Hạn sử dụng (tuỳ chọn)" hint="Bỏ trống = không hết hạn."><input type="date" className={inputCls} value={f.expires_at} onChange={set('expires_at')} /></Field>
        <Field label="Giới hạn tổng lượt nhận (tuỳ chọn)">
          <input type="number" min="1" className={inputCls} value={f.max_total_claims} onChange={set('max_total_claims')} />
        </Field>
        <p className="text-xs text-gray-500">Mỗi người dùng chỉ nhận được một thẻ cho mỗi địa điểm, bất kể quét bao nhiêu lần.</p>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Đang tạo…' : 'Tạo mã'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function PrintView({ qr, onClose }) {
  const url = buildClaimUrl(qr.token)
  const [copied, setCopied] = useState(false)
  return (
    <Modal title="Mã QR để in" onClose={onClose}>
      <div className="print-area">
        <div className="mx-auto w-full max-w-sm rounded-3xl border-4 border-dashed border-brand-700 bg-white p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-700">TripStamp · Nha Trang</p>
          <h3 className="mt-2 text-2xl font-extrabold text-gray-900">{one(qr.places)?.name}</h3>
          <div className="my-4 flex justify-center">
            <QRCodeSVG value={url} size={240} level="M" marginSize={2} />
          </div>
          <p className="text-sm font-semibold text-gray-800">Quét để nhận thẻ sưu tầm</p>
          <p className="mt-1 text-xs text-gray-500">Every Trip Leaves a Stamp.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2 print:hidden">
        <Button onClick={() => window.print()}><Printer className="size-4" /> In</Button>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url)
              setCopied(true)
            } catch {
              window.prompt('Sao chép liên kết:', url)
            }
          }}
        >
          <Copy className="size-4" /> {copied ? 'Đã sao chép' : 'Sao chép liên kết'}
        </Button>
      </div>
    </Modal>
  )
}

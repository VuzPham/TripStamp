import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { adminListRewards, adminListPartners, saveReward, deleteReward } from '../services/adminService'
import { Field, Modal, PageHeader, errorText, inputCls } from '../components/ui'

const one = (v) => (Array.isArray(v) ? v[0] : v) ?? null
const empty = { id: null, title: '', description: '', partner_id: '', required_stamps: 3, quantity: '', expires_at: '', is_active: true }

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '')

export default function Rewards() {
  const rewards = useAsync(adminListRewards, [])
  const partners = useAsync(adminListPartners, [])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  async function remove(r) {
    if (!window.confirm(`Xoá ưu đãi "${r.title}"? Lịch sử đổi thưởng của ưu đãi này cũng bị xoá. Cân nhắc tắt thay vì xoá.`)) return
    try {
      await deleteReward(r.id)
      rewards.reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  return (
    <>
      <PageHeader
        title="Ưu đãi"
        subtitle="Ưu đãi người dùng đổi bằng số thẻ đã sưu tầm."
        action={<Button onClick={() => setEditing(empty)}><Plus className="size-4" /> Thêm ưu đãi</Button>}
      />
      {error && <Notice tone="error" className="mb-3">{error}</Notice>}
      {rewards.loading && <div className="grid place-items-center py-16"><Spinner /></div>}
      {rewards.error && <Notice tone="error">{errorText(rewards.error)}</Notice>}
      <div className="grid gap-2 md:grid-cols-2">
        {rewards.data?.map((r) => (
          <Card key={r.id} className="flex items-start gap-3 p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-bold">{r.title}</p>
              {one(r.partners)?.name && <p className="text-xs text-gray-500">{one(r.partners).name}</p>}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Badge className="bg-brand-100 text-brand-800">Cần {r.required_stamps} thẻ</Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  Đã đổi {r.redeemed_count}{r.quantity != null ? `/${r.quantity}` : ''}
                </Badge>
                {!r.is_active && <Badge className="bg-gray-200 text-gray-700">Đang tắt</Badge>}
                {r.expires_at && <Badge className="bg-gray-100 text-gray-700">Hạn {new Date(r.expires_at).toLocaleDateString('vi-VN')}</Badge>}
              </div>
            </div>
            <Button variant="ghost" size="sm" aria-label={`Sửa ${r.title}`} onClick={() => setEditing({ ...r, partner_id: r.partner_id ?? '', quantity: r.quantity ?? '', description: r.description ?? '', expires_at: toDateInput(r.expires_at) })}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" aria-label={`Xoá ${r.title}`} onClick={() => remove(r)}><Trash2 className="size-4 text-red-600" /></Button>
          </Card>
        ))}
      </div>
      {editing && (
        <RewardForm
          initial={editing}
          partners={partners.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            rewards.reload()
          }}
        />
      )}
    </>
  )
}

function RewardForm({ initial, partners, onClose, onSaved }) {
  const [f, setF] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await saveReward(f)
      onSaved()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={f.id ? 'Sửa ưu đãi' : 'Thêm ưu đãi'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Tên ưu đãi *"><input required className={inputCls} value={f.title} onChange={set('title')} /></Field>
        <Field label="Mô tả / điều kiện áp dụng"><textarea rows={2} className={`${inputCls} h-auto py-2`} value={f.description} onChange={set('description')} /></Field>
        <Field label="Đối tác">
          <select className={inputCls} value={f.partner_id} onChange={set('partner_id')}>
            <option value="">— Không có —</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Số thẻ cần có *"><input required type="number" min="1" className={inputCls} value={f.required_stamps} onChange={set('required_stamps')} /></Field>
          <Field label="Số lượng ưu đãi" hint="Bỏ trống = không giới hạn."><input type="number" min="0" className={inputCls} value={f.quantity} onChange={set('quantity')} /></Field>
        </div>
        <Field label="Hạn đổi (tuỳ chọn)"><input type="date" className={inputCls} value={f.expires_at} onChange={set('expires_at')} /></Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF((s) => ({ ...s, is_active: e.target.checked }))} /> Đang mở cho người dùng đổi
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</Button>
        </div>
      </form>
    </Modal>
  )
}

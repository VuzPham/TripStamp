import { useState } from 'react'
import { Pencil, Plus, Trash2, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { adminListPartners, savePartner, deletePartner } from '../services/adminService'
import { Field, Modal, PageHeader, errorText, inputCls } from '../components/ui'

const statusLabel = { active: 'Đang hợp tác', pending: 'Chờ duyệt', paused: 'Tạm dừng' }
const empty = { id: null, name: '', contact_name: '', contact_phone: '', contact_email: '', status: 'pending' }

export default function Partners() {
  const partners = useAsync(adminListPartners, [])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  async function remove(p) {
    if (!window.confirm(`Xoá đối tác "${p.name}"? Các địa điểm và ưu đãi liên quan sẽ không còn gắn với đối tác này.`)) return
    try {
      await deletePartner(p.id)
      partners.reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  return (
    <>
      <PageHeader
        title="Đối tác"
        subtitle="Cửa hàng, địa điểm hợp tác. Thông tin liên hệ chỉ admin nhìn thấy."
        action={<Button onClick={() => setEditing(empty)}><Plus className="size-4" /> Thêm đối tác</Button>}
      />
      {error && <Notice tone="error" className="mb-3">{error}</Notice>}
      {partners.loading && <div className="grid place-items-center py-16"><Spinner /></div>}
      {partners.error && <Notice tone="error">{errorText(partners.error)}</Notice>}
      <div className="grid gap-2 md:grid-cols-2">
        {partners.data?.map((p) => (
          <Card key={p.id} className="flex items-start gap-3 p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate font-bold">{p.name}</p>
              <Badge className={p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}>{statusLabel[p.status]}</Badge>
              {p.contact_name && <p className="text-sm text-gray-700">{p.contact_name}</p>}
              {p.contact_phone && <p className="flex items-center gap-1 text-xs text-gray-600"><Phone className="size-3" /> {p.contact_phone}</p>}
              {p.contact_email && <p className="flex items-center gap-1 text-xs text-gray-600"><Mail className="size-3" /> {p.contact_email}</p>}
            </div>
            <Button variant="ghost" size="sm" aria-label={`Sửa ${p.name}`} onClick={() => setEditing(p)}><Pencil className="size-4" /></Button>
            <Button variant="ghost" size="sm" aria-label={`Xoá ${p.name}`} onClick={() => remove(p)}><Trash2 className="size-4 text-red-600" /></Button>
          </Card>
        ))}
      </div>
      {editing && (
        <PartnerForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            partners.reload()
          }}
        />
      )}
    </>
  )
}

function PartnerForm({ initial, onClose, onSaved }) {
  const [f, setF] = useState({ ...empty, ...initial, contact_name: initial.contact_name ?? '', contact_phone: initial.contact_phone ?? '', contact_email: initial.contact_email ?? '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await savePartner(f)
      onSaved()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={f.id ? 'Sửa đối tác' : 'Thêm đối tác'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Tên đối tác *"><input required className={inputCls} value={f.name} onChange={set('name')} /></Field>
        <Field label="Người liên hệ"><input className={inputCls} value={f.contact_name} onChange={set('contact_name')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Điện thoại"><input className={inputCls} type="tel" value={f.contact_phone} onChange={set('contact_phone')} /></Field>
          <Field label="Email"><input className={inputCls} type="email" value={f.contact_email} onChange={set('contact_email')} /></Field>
        </div>
        <Field label="Trạng thái hợp tác" hint="Chỉ đối tác “Đang hợp tác” hiển thị tên ở app công khai.">
          <select className={inputCls} value={f.status} onChange={set('status')}>
            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</Button>
        </div>
      </form>
    </Modal>
  )
}

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { slugify } from '@/utils/text'
import { adminListAreas, adminListCities, saveArea, deleteArea } from '../services/adminService'
import { Field, Modal, PageHeader, errorText, inputCls } from '../components/ui'

const empty = { id: '', city_id: '', name: '', sort_order: 10, is_active: true }

export default function Areas() {
  const areas = useAsync(adminListAreas, [])
  const cities = useAsync(adminListCities, [])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  async function remove(a) {
    if (!window.confirm(`Xoá khu vực "${a.name}"? Các địa điểm thuộc khu vực này sẽ không còn khu vực.`)) return
    try {
      await deleteArea(a.id)
      areas.reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  return (
    <>
      <PageHeader
        title="Khu vực"
        subtitle="Quận/huyện hoặc khu vực trong từng thành phố, dùng cho bộ chọn vị trí và bộ lọc ở trang Khám phá."
        action={<Button onClick={() => setEditing({ form: empty, isNew: true })}><Plus className="size-4" /> Thêm khu vực</Button>}
      />
      {error && <Notice tone="error" className="mb-3">{error}</Notice>}
      {areas.loading && <div className="grid place-items-center py-16"><Spinner /></div>}
      {areas.error && <Notice tone="error">{errorText(areas.error)} Bạn đã chạy supabase/cities.sql chưa?</Notice>}
      <div className="space-y-4">
        {cities.data?.map((c) => {
          const list = (areas.data ?? []).filter((a) => a.city_id === c.id)
          return (
            <Card key={c.id} className="p-4">
              <h2 className="mb-2 font-bold">{c.name}</h2>
              {list.length === 0 && <p className="text-sm text-gray-500">Chưa có khu vực nào.</p>}
              <ul className="divide-y divide-black/5">
                {list.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.name}</span>
                    {!a.is_active && <Badge className="bg-gray-200 text-gray-700">Đang ẩn</Badge>}
                    <Button variant="ghost" size="sm" aria-label={`Sửa ${a.name}`} onClick={() => setEditing({ form: { ...empty, ...a }, isNew: false })}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="sm" aria-label={`Xoá ${a.name}`} onClick={() => remove(a)}><Trash2 className="size-4 text-red-600" /></Button>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
      {editing && (
        <AreaForm
          initial={editing.form}
          isNew={editing.isNew}
          cities={cities.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            areas.reload()
          }}
        />
      )}
    </>
  )
}

function AreaForm({ initial, isNew, cities, onClose, onSaved }) {
  const [f, setF] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  function onName(e) {
    const name = e.target.value
    setF((s) => ({ ...s, name, id: isNew ? slugify(`${s.city_id}-${name}`) : s.id }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await saveArea(f, isNew)
      onSaved()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isNew ? 'Thêm khu vực' : 'Sửa khu vực'} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3">
        <Field label="Thành phố *">
          <select required className={inputCls} value={f.city_id} onChange={set('city_id')} disabled={!isNew}>
            <option value="">— Chọn thành phố —</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Tên khu vực *"><input required className={inputCls} value={f.name} onChange={onName} placeholder="Ví dụ: Quận 1" /></Field>
        <Field label="Mã (slug)" hint="Tự tạo từ tên, không đổi được sau khi tạo.">
          <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputCls} value={f.id} onChange={set('id')} disabled={!isNew} />
        </Field>
        <Field label="Thứ tự hiển thị"><input type="number" className={inputCls} value={f.sort_order} onChange={set('sort_order')} /></Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF((s) => ({ ...s, is_active: e.target.checked }))} /> Hiển thị cho người dùng
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</Button>
        </div>
      </form>
    </Modal>
  )
}

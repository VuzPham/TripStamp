import { useState } from 'react'
import { Pencil, Plus, Trash2, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { fetchCategories } from '@/services/placeService'
import { slugify } from '@/utils/text'
import { adminListPlaces, adminListPartners, savePlace, deletePlace, uploadPlaceImage } from '../services/adminService'
import { Field, Modal, PageHeader, errorText, inputCls } from '../components/ui'
import MapPicker from '../components/MapPicker'

const one = (v) => (Array.isArray(v) ? v[0] : v) ?? null

const emptyForm = {
  id: null, name: '', slug: '', description: '', category_id: '', partner_id: '',
  latitude: '', longitude: '', address: '', image_url: '', tagsText: '', status: 'active', is_featured: false,
  stampName: '', stampDescription: '', rarity: 'common',
}

function toForm(p) {
  const s = one(p.stamps)
  return {
    id: p.id, name: p.name, slug: p.slug, description: p.description ?? '', category_id: p.category_id ?? '',
    partner_id: p.partner_id ?? '', latitude: String(p.latitude), longitude: String(p.longitude),
    address: p.address ?? '', image_url: p.image_url ?? '', tagsText: (p.tags ?? []).join(', '), status: p.status, is_featured: Boolean(p.is_featured),
    stampName: s?.name ?? '', stampDescription: s?.description ?? '', rarity: s?.rarity ?? 'common',
  }
}

export default function Places() {
  const places = useAsync(adminListPlaces, [])
  const categories = useAsync(fetchCategories, [])
  const partners = useAsync(adminListPartners, [])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  async function remove(p) {
    if (!window.confirm(`Xoá "${p.name}"? Thẻ, mã QR và thẻ người dùng đã nhận của địa điểm này cũng sẽ bị xoá. Cân nhắc dùng "Ẩn" thay vì xoá.`)) return
    try {
      await deletePlace(p.id)
      places.reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  return (
    <>
      <PageHeader
        title="Địa điểm"
        subtitle="Quản lý địa điểm hiển thị trên bản đồ và thẻ sưu tầm tương ứng."
        action={<Button onClick={() => setEditing(emptyForm)}><Plus className="size-4" /> Thêm địa điểm</Button>}
      />
      {error && <Notice tone="error" className="mb-3">{error}</Notice>}
      {places.loading && <div className="grid place-items-center py-16"><Spinner /></div>}
      {places.error && <Notice tone="error">{errorText(places.error)}</Notice>}
      <div className="grid gap-2">
        {places.data?.map((p) => (
          <Card key={p.id} className="flex items-center gap-3 p-3">
            {p.image_url ? (
              <img src={p.image_url} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-brand-50 text-2xl">📍</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{p.name}</p>
              <p className="truncate text-xs text-gray-500">{p.address}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge className="bg-brand-100 text-brand-800">{p.category_id ?? '—'}</Badge>
                {p.is_featured && <Badge className="bg-orange-100 text-orange-700">🔥 Ghim Hot</Badge>}
                {p.status === 'hidden' && <Badge className="bg-gray-200 text-gray-700">Đang ẩn</Badge>}
                {one(p.partners)?.name && <Badge className="bg-orange-100 text-orange-800">{one(p.partners).name}</Badge>}
              </div>
            </div>
            <Button variant="ghost" size="sm" aria-label={`Sửa ${p.name}`} onClick={() => setEditing(toForm(p))}><Pencil className="size-4" /></Button>
            <Button variant="ghost" size="sm" aria-label={`Xoá ${p.name}`} onClick={() => remove(p)}><Trash2 className="size-4 text-red-600" /></Button>
          </Card>
        ))}
      </div>

      {editing && (
        <PlaceForm
          initial={editing}
          categories={categories.data ?? []}
          partners={partners.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            places.reload()
          }}
        />
      )}
    </>
  )
}

function PlaceForm({ initial, categories, partners, onClose, onSaved }) {
  const [f, setF] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const isNew = !f.id

  function onName(e) {
    const name = e.target.value
    setF((s) => ({
      ...s,
      name,
      slug: isNew ? slugify(name) : s.slug,
      stampName: isNew || s.stampName === `Tem ${s.name}` ? `Tem ${name}` : s.stampName,
    }))
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadPlaceImage(file)
      setF((s) => ({ ...s, image_url: url }))
    } catch (err) {
      setError(errorText(err))
    } finally {
      setUploading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    const lat = Number(f.latitude)
    const lng = Number(f.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      setError('Hãy chọn vị trí trên bản đồ hoặc nhập toạ độ hợp lệ.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await savePlace({
        ...f,
        tags: f.tagsText.split(',').map((t) => t.trim()).filter(Boolean),
        stampName: f.stampName || `Tem ${f.name}`,
      })
      onSaved()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isNew ? 'Thêm địa điểm' : 'Sửa địa điểm'} onClose={onClose} wide>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <Field label="Tên địa điểm *"><input required className={inputCls} value={f.name} onChange={onName} /></Field>
        <Field label="Slug (đường dẫn) *" hint="Chữ thường, không dấu, ngăn cách bằng dấu gạch ngang.">
          <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputCls} value={f.slug} onChange={set('slug')} />
        </Field>
        <Field label="Danh mục">
          <select className={inputCls} value={f.category_id} onChange={set('category_id')}>
            <option value="">— Chọn —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </Field>
        <Field label="Đối tác">
          <select className={inputCls} value={f.partner_id} onChange={set('partner_id')}>
            <option value="">— Không có —</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Mô tả ngắn" className="md:col-span-2">
          <textarea rows={2} className={`${inputCls} h-auto py-2`} value={f.description} onChange={set('description')} />
        </Field>
        <Field label="Địa chỉ" className="md:col-span-2"><input className={inputCls} value={f.address} onChange={set('address')} /></Field>

        <div className="space-y-2 md:col-span-2">
          <span className="text-xs font-semibold text-gray-700">Vị trí (bấm lên bản đồ để chọn)</span>
          <MapPicker
            lat={Number(f.latitude)}
            lng={Number(f.longitude)}
            onPick={(lat, lng) => setF((s) => ({ ...s, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vĩ độ"><input className={inputCls} inputMode="decimal" value={f.latitude} onChange={set('latitude')} /></Field>
            <Field label="Kinh độ"><input className={inputCls} inputMode="decimal" value={f.longitude} onChange={set('longitude')} /></Field>
          </div>
        </div>

        <Field label="Ảnh địa điểm" hint="Ảnh được nén về tối đa 1200px trước khi tải lên." className="md:col-span-2">
          <div className="flex items-center gap-3">
            {f.image_url && <img src={f.image_url} alt="" className="size-16 rounded-lg object-cover" />}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-brand-50">
              <ImagePlus className="size-4" /> {uploading ? 'Đang tải lên…' : 'Chọn ảnh'}
              <input type="file" accept="image/*" className="sr-only" onChange={onFile} disabled={uploading} />
            </label>
            {f.image_url && <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setF((s) => ({ ...s, image_url: '' }))}>Bỏ ảnh</button>}
          </div>
        </Field>

        <Field label="Thẻ (cách nhau bằng dấu phẩy)"><input className={inputCls} value={f.tagsText} onChange={set('tagsText')} /></Field>
        <Field label="Trạng thái">
          <select className={inputCls} value={f.status} onChange={set('status')}>
            <option value="active">Hiển thị</option>
            <option value="hidden">Ẩn</option>
          </select>
        </Field>

        <label className="flex items-start gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={f.is_featured}
            onChange={(e) => setF((s) => ({ ...s, is_featured: e.target.checked }))}
          />
          <span>
            <b>🔥 Ghim là địa điểm Hot</b>
            <span className="block text-xs text-gray-500">Địa điểm cũng tự động lên Hot khi có nhiều lượt nhận thẻ và đánh giá trong 14 ngày gần nhất.</span>
          </span>
        </label>

        <fieldset className="grid gap-3 rounded-xl border border-black/10 p-3 md:col-span-2 md:grid-cols-3">
          <legend className="px-1 text-xs font-bold text-brand-800">Thẻ số của địa điểm</legend>
          <Field label="Tên thẻ"><input className={inputCls} value={f.stampName} onChange={set('stampName')} /></Field>
          <Field label="Độ hiếm">
            <select className={inputCls} value={f.rarity} onChange={set('rarity')}>
              <option value="common">Thường</option>
              <option value="rare">Hiếm</option>
              <option value="epic">Huyền thoại</option>
            </select>
          </Field>
          <Field label="Mô tả thẻ"><input className={inputCls} value={f.stampDescription} onChange={set('stampDescription')} /></Field>
        </fieldset>

        {error && <Notice tone="error" className="md:col-span-2">{error}</Notice>}
        <div className="flex justify-end gap-2 md:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={busy || uploading}>{busy ? 'Đang lưu…' : 'Lưu'}</Button>
        </div>
      </form>
    </Modal>
  )
}

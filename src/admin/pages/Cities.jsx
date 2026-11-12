import { useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Card, Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { contrastWithWhite } from '@/utils/color'
import { adminListCities, saveCity, deleteCity, uploadPlaceImage } from '../services/adminService'
import { Field, Modal, PageHeader, errorText, inputCls } from '../components/ui'
import MapPicker from '../components/MapPicker'

const empty = {
  id: '', name: '', province: '', tagline: '', slogan: '', latitude: '', longitude: '', zoom: 13,
  color_primary: '#0f6b66', color_accent: '#ff6b4a', hero_image: '', sort_order: 10, is_active: true,
}

export default function Cities() {
  const cities = useAsync(adminListCities, [])
  const [editing, setEditing] = useState(null) // { form, isNew }
  const [error, setError] = useState('')

  async function remove(c) {
    if (!window.confirm(`Xoá thành phố "${c.name}"? Chỉ xoá được khi chưa còn địa điểm nào thuộc thành phố này.`)) return
    try {
      await deleteCity(c.id)
      cities.reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  return (
    <>
      <PageHeader
        title="Thành phố"
        subtitle="Mỗi thành phố có bảng màu và ảnh nền trang chủ riêng. Tải ảnh nền của bạn lên đây."
        action={<Button onClick={() => setEditing({ form: empty, isNew: true })}><Plus className="size-4" /> Thêm thành phố</Button>}
      />
      {error && <Notice tone="error" className="mb-3">{error}</Notice>}
      {cities.loading && <div className="grid place-items-center py-16"><Spinner /></div>}
      {cities.error && <Notice tone="error">{errorText(cities.error)}</Notice>}
      <div className="grid gap-3 md:grid-cols-2">
        {cities.data?.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="relative h-28 bg-gray-200" style={{ background: c.color_primary }}>
              {c.hero_image && <img src={c.hero_image} alt="" className="size-full object-cover" />}
              <span className="absolute bottom-2 left-2 flex gap-1.5">
                <span className="size-5 rounded-full ring-2 ring-white" style={{ background: c.color_primary }} title="Màu chủ đạo" />
                <span className="size-5 rounded-full ring-2 ring-white" style={{ background: c.color_accent }} title="Màu nhấn" />
              </span>
            </div>
            <div className="flex items-start gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{c.name}</p>
                <p className="truncate text-xs text-gray-500">{c.tagline}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge className="bg-gray-100 text-gray-700">{c.id}</Badge>
                  {!c.is_active && <Badge className="bg-gray-200 text-gray-700">Đang ẩn</Badge>}
                  {!c.hero_image && <Badge className="bg-amber-100 text-amber-800">Chưa có ảnh nền</Badge>}
                </div>
              </div>
              <Button variant="ghost" size="sm" aria-label={`Sửa ${c.name}`} onClick={() => setEditing({ form: { ...empty, ...c, latitude: String(c.latitude), longitude: String(c.longitude), province: c.province ?? '', tagline: c.tagline ?? '', slogan: c.slogan ?? '', hero_image: c.hero_image ?? '' }, isNew: false })}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" aria-label={`Xoá ${c.name}`} onClick={() => remove(c)}><Trash2 className="size-4 text-red-600" /></Button>
            </div>
          </Card>
        ))}
      </div>
      {editing && (
        <CityForm
          initial={editing.form}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            cities.reload()
          }}
        />
      )}
    </>
  )
}

function CityForm({ initial, isNew, onClose, onSaved }) {
  const [f, setF] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const lowContrast = contrastWithWhite(f.color_primary) < 4.5

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadPlaceImage(file, { folder: 'cities/', maxSize: 1800 })
      setF((s) => ({ ...s, hero_image: url }))
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
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Hãy chọn tâm bản đồ trên bản đồ hoặc nhập toạ độ hợp lệ.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await saveCity(f, isNew)
      onSaved()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isNew ? 'Thêm thành phố' : `Sửa ${initial.name}`} onClose={onClose} wide>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <Field label="Tên hiển thị *"><input required className={inputCls} value={f.name} onChange={set('name')} /></Field>
        <Field label="Mã (slug) *" hint={isNew ? 'Chữ thường không dấu, ví dụ: vung-tau. Không đổi được sau khi tạo.' : 'Không đổi được.'}>
          <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputCls} value={f.id} onChange={set('id')} disabled={!isNew} />
        </Field>
        <Field label="Tỉnh / thành"><input className={inputCls} value={f.province} onChange={set('province')} /></Field>
        <Field label="Thứ tự hiển thị"><input type="number" className={inputCls} value={f.sort_order} onChange={set('sort_order')} /></Field>
        <Field label="Slogan (hiện dưới “Discover …” ở đầu trang)" className="md:col-span-2"><input className={inputCls} value={f.slogan} onChange={set('slogan')} placeholder="Ví dụ: Explore beautiful destinations and collect unforgettable memories." /></Field>
        <Field label="Câu giới thiệu ngắn" className="md:col-span-2"><input className={inputCls} value={f.tagline} onChange={set('tagline')} placeholder="Ví dụ: Sương sớm, rừng thông và những góc phố se lạnh." /></Field>

        <div className="space-y-2 md:col-span-2">
          <span className="text-xs font-semibold text-gray-700">Tâm bản đồ (bấm lên bản đồ để chọn)</span>
          <MapPicker lat={Number(f.latitude)} lng={Number(f.longitude)} onPick={(lat, lng) => setF((s) => ({ ...s, latitude: lat.toFixed(5), longitude: lng.toFixed(5) }))} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Vĩ độ"><input className={inputCls} inputMode="decimal" value={f.latitude} onChange={set('latitude')} /></Field>
            <Field label="Kinh độ"><input className={inputCls} inputMode="decimal" value={f.longitude} onChange={set('longitude')} /></Field>
            <Field label="Mức zoom (5–18)"><input type="number" min="5" max="18" className={inputCls} value={f.zoom} onChange={set('zoom')} /></Field>
          </div>
        </div>

        <Field label="Màu chủ đạo" hint="Dùng cho thanh điều hướng, nút và nền trang chủ. Nên chọn màu đủ đậm.">
          <input type="color" className="h-10 w-full cursor-pointer rounded-lg border border-black/10" value={f.color_primary} onChange={set('color_primary')} />
        </Field>
        <Field label="Màu nhấn" hint="Dùng cho nút chính và điểm nhấn.">
          <input type="color" className="h-10 w-full cursor-pointer rounded-lg border border-black/10" value={f.color_accent} onChange={set('color_accent')} />
        </Field>
        {lowContrast && (
          <Notice tone="warn" className="md:col-span-2">Màu chủ đạo hơi nhạt, chữ trắng trên nền này có thể khó đọc. Hãy chọn màu đậm hơn.</Notice>
        )}

        <Field label="Ảnh nền trang chủ" hint="Ảnh ngang hoặc dọc đều được (nên rộng từ 1600px). Ảnh được nén còn tối đa 1800px, lưu trên Supabase Storage." className="md:col-span-2">
          <div className="flex items-center gap-3">
            {f.hero_image && <img src={f.hero_image} alt="" className="h-20 w-32 rounded-lg object-cover" />}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-brand-50">
              <ImagePlus className="size-4" /> {uploading ? 'Đang tải lên…' : f.hero_image ? 'Đổi ảnh' : 'Chọn ảnh'}
              <input type="file" accept="image/*" className="sr-only" onChange={onFile} disabled={uploading} />
            </label>
            {f.hero_image && <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setF((s) => ({ ...s, hero_image: '' }))}>Bỏ ảnh</button>}
          </div>
        </Field>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF((s) => ({ ...s, is_active: e.target.checked }))} /> Hiển thị cho người dùng
        </label>

        {error && <Notice tone="error" className="md:col-span-2">{error}</Notice>}
        <div className="flex justify-end gap-2 md:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={busy || uploading}>{busy ? 'Đang lưu…' : 'Lưu'}</Button>
        </div>
      </form>
    </Modal>
  )
}

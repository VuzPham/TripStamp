import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const inputCls =
  'h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 disabled:bg-gray-50'

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn('block space-y-1', className)}>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray-500">{hint}</span>}
    </label>
  )
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3">
      <div className={cn('max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-xl', wide ? 'max-w-3xl' : 'max-w-lg')}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-5 py-3">
          <h2 className="text-lg font-extrabold text-brand-800">{title}</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function errorText(e) {
  const m = String(e?.message ?? e ?? '')
  if (/row-level security|forbidden|permission denied/i.test(m)) return 'Bạn không có quyền thực hiện thao tác này.'
  if (/duplicate key/i.test(m)) return 'Dữ liệu bị trùng (ví dụ slug đã tồn tại).'
  return m || 'Đã có lỗi xảy ra.'
}

import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('rounded-2xl border border-black/5 bg-white shadow-sm', className)} {...props} />
}

export function Badge({ className, color, children, ...props }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}
      style={color ? { backgroundColor: `${color}1a`, color } : undefined}
      {...props}
    >
      {children}
    </span>
  )
}

export function Spinner({ className }) {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className={cn('size-6 animate-spin rounded-full border-2 border-brand-700 border-t-transparent', className)}
    />
  )
}

export function Notice({ tone = 'info', className, children }) {
  const tones = {
    info: 'bg-brand-50 text-brand-800 border-brand-100',
    warn: 'bg-amber-50 text-amber-900 border-amber-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }
  return <div className={cn('rounded-xl border px-4 py-3 text-sm', tones[tone], className)}>{children}</div>
}

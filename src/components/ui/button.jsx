import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm',
  accent: 'bg-stamp text-white hover:bg-orange-600 shadow-sm',
  outline: 'border border-brand-700/30 text-brand-800 bg-white hover:bg-brand-50',
  ghost: 'text-brand-800 hover:bg-brand-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}
const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-5 text-base', lg: 'h-12 px-6 text-base' }

export function Button({ variant = 'primary', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
        'disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

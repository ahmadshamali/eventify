import { forwardRef, type ComponentPropsWithoutRef } from 'react'

type InputProps = ComponentPropsWithoutRef<'input'>

const baseInputClassName =
  'w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition duration-200 placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20 [color-scheme:dark]'

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`${baseInputClassName} ${className}`} {...props} />
})

export default Input

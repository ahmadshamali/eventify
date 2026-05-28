import { forwardRef, type ComponentPropsWithoutRef } from 'react'

type InputProps = ComponentPropsWithoutRef<'input'>

const baseInputClassName =
  'w-full rounded-[14px] border border-slate-400/25 bg-slate-900/70 px-4 py-4 text-slate-50 outline-none transition duration-200 focus:-translate-y-px focus:border-blue-400/90 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.16)] [color-scheme:dark]'

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`${baseInputClassName} ${className}`} {...props} />
})

export default Input
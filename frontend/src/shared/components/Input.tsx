import { forwardRef, type ComponentPropsWithoutRef } from 'react'

type InputProps = ComponentPropsWithoutRef<'input'>

const baseInputClassName =
  'w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition duration-200 placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20 [color-scheme:dark]'

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`${baseInputClassName} ${className}`} {...props} />
})

export default Input

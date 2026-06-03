import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import Input from './Input'

type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  showPassword: boolean
  onToggle: () => void
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { showPassword, onToggle, className = '', ...props },
  ref,
) {
  return (
    <div className="relative">
      <Input ref={ref} type={showPassword ? 'text' : 'password'} className={`pr-20 ${className}`} {...props} />
      <button
        className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)] hover:text-[var(--primary)]"
        type="button"
        onClick={onToggle}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
      >
        {showPassword ? (
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.5 10.6a3 3 0 004 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.5 7.8A10.5 10.5 0 003 12c1.8 3.4 5.1 6 9 6 1.2 0 2.4-.2 3.5-.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.7 5.2A10.5 10.5 0 0121 12c-1.1 2.1-2.8 4-4.9 5.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span>{showPassword ? 'Hide' : 'Show'}</span>
      </button>
    </div>
  )
})

export default PasswordInput

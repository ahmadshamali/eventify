import type { ReactNode } from 'react'

type EventCardShellProps = {
  children: ReactNode
  className?: string
}

function EventCardShell({ children, className = '' }: EventCardShellProps) {
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm transition duration-200 hover:border-[var(--primary-fixed-dim)]/60 hover:bg-[var(--surface-container)] ${className}`.trim()}>
      {children}
    </div>
  )
}

export default EventCardShell

import type { ReactNode } from 'react'

type EventStatusTone = 'available' | 'full' | 'completed' | 'active' | 'neutral'

type EventStatusBadgeProps = {
  tone: EventStatusTone
  children: ReactNode
}

const toneClasses: Record<EventStatusTone, string> = {
  available: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  full: 'border-[var(--error)]/40 bg-[var(--error-container)]/30 text-[var(--on-error-container)]',
  completed: 'border-[var(--outline-variant)] bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]',
  active: 'border-[var(--tertiary-container)]/40 bg-[var(--secondary-container)]/20 text-[var(--tertiary)]',
  neutral: 'border-[var(--outline-variant)] bg-[var(--surface-container-highest)] text-[var(--on-surface)]',
}

function EventStatusBadge({ tone, children }: EventStatusBadgeProps) {
  return (
    <span className={['rounded border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider', toneClasses[tone]].join(' ')}>
      {children}
    </span>
  )
}

export default EventStatusBadge

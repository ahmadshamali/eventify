import type { ReactNode } from 'react'

type EventStatusTone = 'available' | 'full' | 'completed' | 'active' | 'neutral'

type EventStatusBadgeProps = {
  tone: EventStatusTone
  children: ReactNode
}

const toneClasses: Record<EventStatusTone, string> = {
  available: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200',
  full: 'border-red-400/40 bg-red-500/20 text-red-200',
  completed: 'border-slate-400/40 bg-slate-500/20 text-slate-100',
  active: 'border-cyan-400/40 bg-cyan-500/20 text-cyan-100',
  neutral: 'border-white/20 bg-white/10 text-slate-200',
}

function EventStatusBadge({ tone, children }: EventStatusBadgeProps) {
  return (
    <span className={['rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide', toneClasses[tone]].join(' ')}>
      {children}
    </span>
  )
}

export default EventStatusBadge
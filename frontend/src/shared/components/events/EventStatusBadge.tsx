import type { ReactNode } from 'react'

type EventStatusTone = 'available' | 'full' | 'completed' | 'active' | 'neutral'

type EventStatusBadgeProps = {
  tone: EventStatusTone
  children: ReactNode
}

const toneClasses: Record<EventStatusTone, string> = {
  available: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  full: 'border-[#ffb4ab]/40 bg-[#93000a]/30 text-[#ffdad6]',
  completed: 'border-[#4f4633] bg-[#222a3d] text-[#d3c5ac]',
  active: 'border-[#34daff]/40 bg-[#00a6e0]/20 text-[#b6edff]',
  neutral: 'border-[#4f4633] bg-[#2d3449] text-[#dae2fd]',
}

function EventStatusBadge({ tone, children }: EventStatusBadgeProps) {
  return (
    <span className={['rounded border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider', toneClasses[tone]].join(' ')}>
      {children}
    </span>
  )
}

export default EventStatusBadge

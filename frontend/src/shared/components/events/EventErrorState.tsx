import type { ReactNode } from 'react'

type EventErrorStateProps = {
  children: ReactNode
}

function EventErrorState({ children }: EventErrorStateProps) {
  return <div className="mb-8 rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-6 text-center text-[var(--on-error-container)]">{children}</div>
}

export default EventErrorState

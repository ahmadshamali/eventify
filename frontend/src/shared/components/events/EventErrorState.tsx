import type { ReactNode } from 'react'

type EventErrorStateProps = {
  children: ReactNode
}

function EventErrorState({ children }: EventErrorStateProps) {
  return <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">{children}</div>
}

export default EventErrorState
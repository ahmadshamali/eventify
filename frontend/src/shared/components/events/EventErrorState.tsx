import type { ReactNode } from 'react'

type EventErrorStateProps = {
  children: ReactNode
}

function EventErrorState({ children }: EventErrorStateProps) {
  return <div className="mb-8 rounded-xl border border-[#ffb4ab]/40 bg-[#93000a]/30 p-6 text-center text-[#ffdad6]">{children}</div>
}

export default EventErrorState

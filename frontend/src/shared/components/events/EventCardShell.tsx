import type { ReactNode } from 'react'

type EventCardShellProps = {
  children: ReactNode
}

function EventCardShell({ children }: EventCardShellProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#4f4633] bg-[#131b2e] p-6 shadow-sm transition duration-200 hover:border-[#f9bd22]/60 hover:bg-[#171f33]">
      {children}
    </div>
  )
}

export default EventCardShell

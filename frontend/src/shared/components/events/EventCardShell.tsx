import type { ReactNode } from 'react'

type EventCardShellProps = {
  children: ReactNode
}

function EventCardShell({ children }: EventCardShellProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.4)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      {children}
    </div>
  )
}

export default EventCardShell
import type { ReactNode } from 'react'

type EventEmptyStateProps = {
  title: string
  description: ReactNode
  children?: ReactNode
  className?: string
}

function EventEmptyState({ title, description, children, className = '' }: EventEmptyStateProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-20 text-center backdrop-blur-sm',
        className,
      ].join(' ')}
    >
      <h3 className="mb-4 text-2xl font-semibold text-white">{title}</h3>
      <p className="text-slate-300">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}

export default EventEmptyState
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
        'rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-8 py-20 text-center',
        className,
      ].join(' ')}
    >
      <h3 className="mb-4 font-['Hanken_Grotesk'] text-2xl font-semibold text-[var(--on-surface)]">{title}</h3>
      <p className="text-[var(--on-surface-variant)]">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}

export default EventEmptyState

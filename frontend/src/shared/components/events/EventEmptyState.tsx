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
        'rounded-xl border border-dashed border-[#4f4633] bg-[#131b2e] px-8 py-20 text-center',
        className,
      ].join(' ')}
    >
      <h3 className="mb-4 font-['Hanken_Grotesk'] text-2xl font-semibold text-[#dae2fd]">{title}</h3>
      <p className="text-[#d3c5ac]">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}

export default EventEmptyState

import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type EventPrimaryLinkButtonProps = {
  to: LinkProps['to']
  children: ReactNode
}

function EventPrimaryLinkButton({ to, children }: EventPrimaryLinkButtonProps) {
  return (
    <Link className="rounded-lg bg-[var(--primary-container)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:bg-[var(--primary-fixed-dim)]" to={to}>
      {children}
    </Link>
  )
}

export default EventPrimaryLinkButton

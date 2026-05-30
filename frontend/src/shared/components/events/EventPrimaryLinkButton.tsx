import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type EventPrimaryLinkButtonProps = {
  to: LinkProps['to']
  children: ReactNode
}

function EventPrimaryLinkButton({ to, children }: EventPrimaryLinkButtonProps) {
  return (
    <Link className="rounded-lg bg-[#fbbf24] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#402d00] transition hover:bg-[#f9bd22]" to={to}>
      {children}
    </Link>
  )
}

export default EventPrimaryLinkButton

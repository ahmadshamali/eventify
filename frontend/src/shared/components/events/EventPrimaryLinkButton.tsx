import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type EventPrimaryLinkButtonProps = {
  to: LinkProps['to']
  children: ReactNode
}

function EventPrimaryLinkButton({ to, children }: EventPrimaryLinkButtonProps) {
  return (
    <Link className="rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-600" to={to}>
      {children}
    </Link>
  )
}

export default EventPrimaryLinkButton
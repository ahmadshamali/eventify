import type { ReactNode } from 'react'

import Spinner from '../Spinner'

type EventLoadingStateProps = {
  message: ReactNode
  className?: string
}

function EventLoadingState({ message, className = '' }: EventLoadingStateProps) {
  return (
    <div className={['flex items-center justify-center text-2xl text-slate-400', className].join(' ')}>
      <Spinner className="mr-4 h-10 w-10" />
      <span>{message}</span>
    </div>
  )
}

export default EventLoadingState
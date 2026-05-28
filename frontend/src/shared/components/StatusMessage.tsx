import type { ReactNode } from 'react'

type StatusMessageProps = {
  tone: 'success' | 'error'
  children: ReactNode
}

const toneClasses = {
  success: 'border-emerald-400/35 bg-emerald-900/45 text-emerald-200',
  error: 'border-red-400/35 bg-red-900/45 text-red-200',
} as const

function StatusMessage({ tone, children }: StatusMessageProps) {
  return <div className={`rounded-[14px] border px-4 py-3 text-[0.95rem] ${toneClasses[tone]}`}>{children}</div>
}

export default StatusMessage
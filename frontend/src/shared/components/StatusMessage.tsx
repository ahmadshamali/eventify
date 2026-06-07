import type { ReactNode } from 'react'

type StatusMessageProps = {
  tone: 'success' | 'error'
  children: ReactNode
}

const toneClasses = {
  success: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  error: 'border-[var(--error)]/40 bg-[var(--error-container)]/30 text-[var(--on-error-container)]',
} as const

function StatusMessage({ tone, children }: StatusMessageProps) {
  return <div className={`rounded-lg border px-4 py-3 text-sm ${toneClasses[tone]}`}>{children}</div>
}

export default StatusMessage

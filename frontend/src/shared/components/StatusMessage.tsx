import type { ReactNode } from 'react'

type StatusMessageProps = {
  tone: 'success' | 'error'
  children: ReactNode
}

const toneClasses = {
  success: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  error: 'border-[#ffb4ab]/40 bg-[#93000a]/30 text-[#ffdad6]',
} as const

function StatusMessage({ tone, children }: StatusMessageProps) {
  return <div className={`rounded-lg border px-4 py-3 text-sm ${toneClasses[tone]}`}>{children}</div>
}

export default StatusMessage

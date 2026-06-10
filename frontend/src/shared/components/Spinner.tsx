import type { HTMLAttributes } from 'react'

type SpinnerProps = HTMLAttributes<HTMLDivElement>

function Spinner({ className = '', ...props }: SpinnerProps) {
	return <div className={`animate-spin rounded-full border-3 border-[var(--outline-variant)] border-t-[var(--primary-fixed-dim)] ${className}`.trim()} {...props} />
}

export default Spinner

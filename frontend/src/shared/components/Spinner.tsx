import type { HTMLAttributes } from 'react'

type SpinnerProps = HTMLAttributes<HTMLDivElement>

function Spinner({ className = '', ...props }: SpinnerProps) {
	return <div className={`animate-spin rounded-full border-3 border-white/10 border-t-blue-500 ${className}`.trim()} {...props} />
}

export default Spinner

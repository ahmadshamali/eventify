import type { HTMLAttributes } from 'react'

type SpinnerProps = HTMLAttributes<HTMLDivElement>

function Spinner({ className = '', ...props }: SpinnerProps) {
	return <div className={`animate-spin rounded-full border-3 border-[#4f4633] border-t-[#f9bd22] ${className}`.trim()} {...props} />
}

export default Spinner

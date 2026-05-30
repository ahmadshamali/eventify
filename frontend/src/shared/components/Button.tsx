import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode
}

function Button({ children, className = '', ...props }: ButtonProps) {
	return (
		<button
			className={`cursor-pointer rounded-lg bg-[#fbbf24] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#402d00] transition duration-200 hover:bg-[#f9bd22] disabled:cursor-wait disabled:opacity-70 ${className}`}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button

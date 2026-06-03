import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode
}

function Button({ children, className = '', ...props }: ButtonProps) {
	return (
		<button
			className={`cursor-pointer rounded-lg bg-[var(--primary-container)] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition duration-200 hover:bg-[var(--primary-fixed-dim)] disabled:cursor-wait disabled:opacity-70 ${className}`}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode
}

function Button({ children, className = '', ...props }: ButtonProps) {
	return (
		<button
			className={`cursor-pointer rounded-[14px] bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4 font-semibold text-white transition duration-200 hover:-translate-y-px hover:shadow-[0_18px_30px_rgba(14,165,233,0.2)] disabled:cursor-wait disabled:opacity-70 ${className}`}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button
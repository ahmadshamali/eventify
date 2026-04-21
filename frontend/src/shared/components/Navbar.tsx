import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type NavItem = {
	label: string
	to: string
	roles: string[]
}

const navItems: NavItem[] = [
	{ label: 'Events', to: '/events', roles: ['student', 'organizer', 'admin'] },
	{ label: 'My Registrations', to: '/my-registrations', roles: ['student'] },
	{ label: 'Certificates', to: '/certificates', roles: ['student'] },
	{ label: 'My Events', to: '/my-events', roles: ['organizer'] },
	{ label: 'Create Event', to: '/events/create', roles: ['organizer', 'admin'] },
	{ label: 'Dashboard', to: '/dashboard', roles: ['organizer'] },
	{ label: 'Admin Dashboard', to: '/admin/dashboard', roles: ['admin'] },
	{ label: 'Users', to: '/admin/users', roles: ['admin'] },
	{ label: 'Pending', to: '/admin/pending', roles: ['admin'] },
]

function NavButton({ to, label }: { to: string; label: string }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				[
					'rounded-full border px-3 py-2 text-sm font-medium transition',
					isActive
						? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-100'
						: 'border-white/10 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10',
				].join(' ')
			}
		>
			{label}
		</NavLink>
	)
}

export default function Navbar() {
	const navigate = useNavigate()
	const { role, fullName, signOut } = useAuth()

	const visibleItems = navItems.filter((item) => (role ? item.roles.includes(role) : false))

	const handleSignOut = () => {
		signOut()
		navigate('/login', { replace: true })
	}

	return (
		<nav className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
			<div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
				<NavLink className="text-lg font-semibold tracking-wide text-white" to="/events">
					Eventify
				</NavLink>

				<div className="flex flex-wrap items-center justify-center gap-2 justify-self-center">
					{visibleItems.map((item) => (
						<NavButton key={item.to} to={item.to} label={item.label} />
					))}
				</div>

				<div className="flex items-center gap-2 justify-self-end">
					<span className="max-w-[200px] truncate rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
						{fullName || 'User'}
					</span>
					<button
						type="button"
						onClick={handleSignOut}
						className="rounded-full border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
					>
						Logout
					</button>
				</div>
			</div>
		</nav>
	)
}
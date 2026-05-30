import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type NavItem = {
	label: string
	to: string
	roles: string[]
	icon: string
}

const navItems: NavItem[] = [
	{ label: 'Events', to: '/events', roles: ['student', 'organizer', 'admin'], icon: 'event' },
	{ label: 'My Registrations', to: '/my-registrations', roles: ['student'], icon: 'confirmation_number' },
	{ label: 'Certificates', to: '/certificates', roles: ['student'], icon: 'workspace_premium' },
	{ label: 'Dashboard', to: '/dashboard', roles: ['organizer'], icon: 'dashboard' },
	{ label: 'Create Event', to: '/events/create', roles: ['organizer', 'admin'], icon: 'add_circle' },
	{ label: 'Admin Dashboard', to: '/admin/dashboard', roles: ['admin'], icon: 'analytics' },
	//{ label: 'Users', to: '/admin/users', roles: ['admin'] },
	//{ label: 'Pending', to: '/admin/pending', roles: ['admin'] },
]

function NavButton({ to, label, icon, compact = false }: { to: string; label: string; icon: string; compact?: boolean }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				[
					'group flex items-center gap-3 transition',
					compact
						? 'flex-col justify-center text-[10px] font-mono uppercase tracking-wide'
						: 'px-4 py-3 font-mono text-xs uppercase tracking-wider',
					isActive
						? compact
							? 'text-[#ffe1a7]'
							: 'border-l-4 border-[#f9bd22] bg-[#222a3d] text-[#ffe1a7]'
						: compact
							? 'text-[#d3c5ac] hover:text-[#ffe1a7]'
							: 'border-l-4 border-transparent text-[#dae2fd] hover:bg-[#171f33] hover:text-[#ffe1a7]',
				].join(' ')
			}
		>
			<span className="material-symbols-outlined text-[22px]" aria-hidden="true">{icon}</span>
			<span className={compact ? 'max-w-[64px] truncate' : ''}>{label}</span>
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
		<>
			<aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col border-r border-[#4f4633] bg-[#060e20] lg:flex">
				<div className="flex h-full flex-col px-6 py-8">
					<NavLink className="mb-10 flex items-center gap-3" to="/events">
						<span className="material-symbols-outlined text-3xl text-[#f9bd22]" aria-hidden="true">school</span>
						<span>
							<span className="block font-['Hanken_Grotesk'] text-2xl font-bold text-[#dae2fd]">Eventify</span>
							<span className="block font-mono text-xs uppercase tracking-wider text-[#d3c5ac]">University Admin</span>
						</span>
					</NavLink>

					<nav className="flex-1 space-y-1">
						{visibleItems.map((item) => (
							<NavButton key={item.to} to={item.to} label={item.label} icon={item.icon} />
						))}
					</nav>

					<div className="mt-8 border-t border-[#4f4633] pt-6">
						{role === 'organizer' || role === 'admin' ? (
							<NavLink
								to="/events/create"
								className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fbbf24] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#402d00] transition hover:bg-[#f9bd22]"
							>
								<span className="material-symbols-outlined text-lg" aria-hidden="true">add</span>
								New Event
							</NavLink>
						) : null}
						<button
							type="button"
							onClick={handleSignOut}
							className="flex w-full items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-wider text-[#d3c5ac] transition hover:bg-[#171f33] hover:text-[#ffb4ab]"
						>
							<span className="material-symbols-outlined" aria-hidden="true">logout</span>
							Logout
						</button>
					</div>
				</div>
			</aside>

			<header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#4f4633] bg-[#171f33] px-4 shadow-sm lg:left-[280px] lg:px-8">
				<div className="flex min-w-0 items-center gap-4">
					<NavLink className="flex items-center gap-2 font-['Hanken_Grotesk'] text-xl font-bold text-[#ffe1a7] lg:hidden" to="/events">
						<span className="material-symbols-outlined" aria-hidden="true">school</span>
						Eventify
					</NavLink>
					<div className="relative hidden w-[min(32vw,420px)] md:block">
						<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#d3c5ac]" aria-hidden="true">search</span>
						<input
							className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] py-2 pr-4 pl-10 text-sm text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
							placeholder="Search events, users, or reports..."
							type="search"
						/>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<button
						type="button"
						className="relative rounded-full p-2 text-[#d3c5ac] transition hover:bg-[#222a3d] hover:text-[#dae2fd]"
						aria-label="Notifications"
					>
						<span className="material-symbols-outlined" aria-hidden="true">notifications</span>
						<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#ffb4ab]" />
					</button>
					<div className="hidden h-8 w-px bg-[#4f4633] sm:block" />
					<div className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-[#222a3d]">
						<div className="hidden text-right sm:block">
							<p className="max-w-[180px] truncate text-sm font-semibold text-[#dae2fd]">{fullName || 'User'}</p>
							<p className="font-mono text-[10px] uppercase tracking-wider text-[#d3c5ac]">{role || 'Member'}</p>
						</div>
						<div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4f4633] bg-[#2d3449] text-[#ffe1a7]">
							<span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
						</div>
					</div>
				</div>
			</header>

			<nav className="fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t border-[#4f4633] bg-[#060e20] px-2 lg:hidden">
				{visibleItems.slice(0, 5).map((item) => (
					<NavButton key={item.to} to={item.to} label={item.label} icon={item.icon} compact />
				))}
			</nav>
		</>
	)
}

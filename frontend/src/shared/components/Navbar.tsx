import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
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
							? 'text-[var(--primary)]'
							: 'border-l-4 border-[var(--nav-accent)] bg-[var(--nav-surface-active)] text-[var(--nav-accent)]'
						: compact
							? 'text-[var(--on-surface-variant)] hover:text-[var(--primary)]'
							: 'border-l-4 border-transparent text-[var(--nav-text)] hover:bg-[var(--nav-surface-hover)] hover:text-[var(--nav-accent)]',
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
	const location = useLocation()
	const { role, fullName, signOut } = useAuth()
	const [isLight, setIsLight] = useState(() => localStorage.getItem('eventify-theme') === 'light')
	const [searchTerm, setSearchTerm] = useState('')

	const visibleItems = navItems.filter((item) => (role ? item.roles.includes(role) : false))

	useEffect(() => {
		const currentSearch = new URLSearchParams(location.search).get('search') ?? ''
		setSearchTerm(currentSearch)
	}, [location.search])

	useEffect(() => {
		document.documentElement.classList.toggle('light', isLight)
		localStorage.setItem('eventify-theme', isLight ? 'light' : 'dark')
	}, [isLight])

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const query = searchTerm.trim()
		navigate(query ? `/events?search=${encodeURIComponent(query)}` : '/events')
	}

	const handleSignOut = () => {
		signOut()
		navigate('/login', { replace: true })
	}

	return (
		<>
			<aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col border-r border-[var(--nav-border)] bg-[var(--nav-surface)] lg:flex">
				<div className="flex h-full flex-col px-6 py-8">
					<NavLink className="mb-10 flex items-center gap-3" to="/events">
						<span className="material-symbols-outlined text-3xl text-[var(--nav-accent)]" aria-hidden="true">school</span>
						<span>
							<span className="block font-['Hanken_Grotesk'] text-2xl font-bold text-[var(--nav-text)]">Eventify</span>
							<span className="block font-mono text-xs uppercase tracking-wider text-[var(--nav-muted)]">University Admin</span>
						</span>
					</NavLink>

					<nav className="flex-1 space-y-1">
						{visibleItems.map((item) => (
							<NavButton key={item.to} to={item.to} label={item.label} icon={item.icon} />
						))}
					</nav>

					<div className="mt-8 border-t border-[var(--nav-border)] pt-6">
						{role === 'organizer' || role === 'admin' ? (
							<NavLink
								to="/events/create"
								className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--nav-button)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--nav-button-text)] transition hover:bg-[var(--nav-button-hover)]"
							>
								<span className="material-symbols-outlined text-lg" aria-hidden="true">add</span>
								New Event
							</NavLink>
						) : null}
						<button
							type="button"
							onClick={handleSignOut}
							className="flex w-full items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-wider text-[var(--nav-text)] transition hover:bg-[var(--nav-surface-hover)] hover:text-[var(--error)]"
						>
							<span className="material-symbols-outlined" aria-hidden="true">logout</span>
							Logout
						</button>
					</div>
				</div>
			</aside>

			<header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 shadow-sm lg:left-[280px] lg:px-8">
				<div className="flex min-w-0 items-center gap-4">
					<NavLink className="flex items-center gap-2 font-['Hanken_Grotesk'] text-xl font-bold text-[var(--primary)] lg:hidden" to="/events">
						<span className="material-symbols-outlined" aria-hidden="true">school</span>
						Eventify
					</NavLink>
					<form className="relative hidden w-[min(32vw,420px)] md:block" onSubmit={handleSearchSubmit}>
						<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" aria-hidden="true">search</span>
						<input
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] py-2 pr-12 pl-10 text-sm text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
							placeholder="Search events by title, category, or date..."
							type="search"
							aria-label="Search events"
						/>
						<button
							type="submit"
							className="absolute top-1/2 right-1 inline-flex h-8 -translate-y-1/2 items-center justify-center rounded-md px-2 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--primary)]"
							aria-label="Search events"
						>
							<span className="material-symbols-outlined text-[20px]" aria-hidden="true">search</span>
						</button>
					</form>
				</div>

				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => setIsLight((value) => !value)}
						className="rounded-full p-2 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
						aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
						title={isLight ? 'Dark mode' : 'Light mode'}
					>
						<span className="material-symbols-outlined" aria-hidden="true">{isLight ? 'dark_mode' : 'light_mode'}</span>
					</button>
					<button
						type="button"
						className="relative rounded-full p-2 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
						aria-label="Notifications"
					>
						<span className="material-symbols-outlined" aria-hidden="true">notifications</span>
						<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--error)]" />
					</button>
					<div className="hidden h-8 w-px bg-[var(--outline-variant)] sm:block" />
					<div className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-[var(--surface-container-high)]">
						<div className="hidden text-right sm:block">
							<p className="max-w-[180px] truncate text-sm font-semibold text-[var(--on-surface)]">{fullName || 'User'}</p>
							<p className="font-mono text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)]">{role || 'Member'}</p>
						</div>
						<div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-highest)] text-[var(--primary)]">
							<span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
						</div>
					</div>
				</div>
			</header>

			<nav className="fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-2 lg:hidden">
				{visibleItems.slice(0, 5).map((item) => (
					<NavButton key={item.to} to={item.to} label={item.label} icon={item.icon} compact />
				))}
				<button
					type="button"
					onClick={handleSignOut}
					className="group flex flex-col items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wide text-[var(--on-surface-variant)] transition hover:text-[var(--error)]"
					aria-label="Logout"
				>
					<span className="material-symbols-outlined text-[22px]" aria-hidden="true">logout</span>
					<span>Logout</span>
				</button>
			</nav>
		</>
	)
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

const TOKEN_STORAGE_KEY = 'eventify_access_token'
const USER_NAME_STORAGE_KEY = 'eventify_user_name'

type JwtPayload = {
	sub?: string
	role?: string
	exp?: number
}

type AuthState = {
	token: string | null
	role: string | null
	userId: string | null
	fullName: string | null
}

type AuthContextValue = AuthState & {
	isAuthenticated: boolean
	signIn: (token: string, fullName?: string) => void
	signOut: () => void
	canAccess: (allowedRoles?: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function decodeJwtPayload(token: string): JwtPayload | null {
	try {
		const parts = token.split('.')
		if (parts.length !== 3) {
			return null
		}

		const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
		const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
		const payload = JSON.parse(window.atob(padded)) as JwtPayload
		return payload
	} catch {
		return null
	}
}

function isPayloadExpired(payload: JwtPayload): boolean {
	if (typeof payload.exp !== 'number') {
		return true
	}

	return payload.exp * 1000 <= Date.now()
}

function buildStateFromToken(token: string | null, fullName: string | null): AuthState {
	if (!token) {
		return { token: null, role: null, userId: null, fullName: null }
	}

	const payload = decodeJwtPayload(token)
	if (!payload || isPayloadExpired(payload)) {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		localStorage.removeItem(USER_NAME_STORAGE_KEY)
		return { token: null, role: null, userId: null, fullName: null }
	}

	return {
		token,
		role: payload.role ?? null,
		userId: payload.sub ?? null,
		fullName: fullName ?? null,
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>(() => {
		const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
		const storedUserName = localStorage.getItem(USER_NAME_STORAGE_KEY)
		return buildStateFromToken(storedToken, storedUserName)
	})

	const signIn = useCallback((token: string, fullName?: string) => {
		const resolvedFullName = typeof fullName === 'string' ? fullName.trim() : ''
		const nextState = buildStateFromToken(token, resolvedFullName || null)
		if (!nextState.token) {
			throw new Error('Invalid or expired login session. Please sign in again.')
		}

		localStorage.setItem(TOKEN_STORAGE_KEY, token)
		if (nextState.fullName) {
			localStorage.setItem(USER_NAME_STORAGE_KEY, nextState.fullName)
		} else {
			localStorage.removeItem(USER_NAME_STORAGE_KEY)
		}
		setAuthState(nextState)
	}, [])

	const signOut = useCallback(() => {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		localStorage.removeItem(USER_NAME_STORAGE_KEY)
		setAuthState({ token: null, role: null, userId: null, fullName: null })
	}, [])

	const canAccess = useCallback(
		(allowedRoles?: string[]) => {
			if (!authState.token) {
				return false
			}

			if (!allowedRoles || allowedRoles.length === 0) {
				return true
			}

			if (!authState.role) {
				return false
			}

			return allowedRoles.includes(authState.role)
		},
		[authState.role, authState.token],
	)

	const contextValue = useMemo<AuthContextValue>(
		() => ({
			...authState,
			isAuthenticated: Boolean(authState.token),
			signIn,
			signOut,
			canAccess,
		}),
		[authState, canAccess, signIn, signOut],
	)

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used inside AuthProvider')
	}

	return context
}

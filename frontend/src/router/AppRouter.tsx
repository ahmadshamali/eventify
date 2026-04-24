import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../shared/components/Navbar'

// Auth
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import VerifyEmailPage from '../features/auth/VerifyEmailPage'

// Events
import EventsPage from '../features/events/EventsPage'
import CreateEventPage from '../features/events/CreateEventPage'
import AdminDashboardPage from '../features/admin/AdminDashboardPage'

function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-slate-900 px-4 py-10 text-slate-50">
      <div className="pointer-events-none fixed -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-blue-500/25 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-cyan-500/20 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[900px] rounded-3xl border border-white/10 bg-slate-800/60 p-8 text-center backdrop-blur-md md:p-14">
        <h1 className="mb-3 text-3xl font-semibold text-white md:text-4xl">{title}</h1>
        <p className="text-slate-300">{subtitle}</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, canAccess } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!canAccess(allowedRoles)) {
    return <Navigate to="/events" replace />
  }

  return <Outlet />
}

function GuestOnlyRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/events" replace />
  }

  return <Outlet />
}

export default function AppRouter() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/events' : '/login'} replace />} />

        {/* Auth */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Events */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/events" element={<EventsPage />} />

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route
                path="/my-registrations"
                element={<PlaceholderPage title="My Registrations" subtitle="Track your event registrations in one place." />}
              />
              <Route
                path="/certificates"
                element={<PlaceholderPage title="Certificates" subtitle="View and download your earned certificates." />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
              <Route
                path="/my-events"
                element={<PlaceholderPage title="My Events" subtitle="Manage your published and draft events." />}
              />
              <Route
                path="/dashboard"
                element={<PlaceholderPage title="Organizer Dashboard" subtitle="See attendance, performance, and engagement at a glance." />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
              <Route path="/events/create" element={<CreateEventPage />} />
              <Route path="/events/:eventId/edit" element={<CreateEventPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route
                path="/admin/users"
                element={<PlaceholderPage title="Users" subtitle="Review and manage platform users." />}
              />
              <Route
                path="/admin/pending"
                element={<PlaceholderPage title="Pending Approvals" subtitle="Approve or reject pending organizer requests." />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? '/events' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

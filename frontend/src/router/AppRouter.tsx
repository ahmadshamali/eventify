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
import OrganizerDashboardPage from '../features/organizer/OrganizerDashboardPage'
import EventDetailsPage from '../features/events/EventDetailsPage'
import MyRegistrationsPage from '../features/events/MyRegistrationsPage.tsx'
import EventFeedbacksPage from '../features/feedback/EventFeedbacksPage'
import AdminDashboardPage from '../features/admin/AdminDashboardPage'

function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0b1326] pt-16 pb-20 text-[#dae2fd] lg:ml-[280px] lg:pb-0">
        <Outlet />
        <footer className="border-t border-[#4f4633] bg-[#060e20] px-4 py-6 md:px-8">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col justify-between gap-4 text-sm text-[#d3c5ac] md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <span className="font-['Hanken_Grotesk'] text-xl font-bold text-[#ffe1a7]">Eventify</span>
              <span>University Eventify Platform.</span>
            </div>
            <div className="flex flex-wrap gap-5">
              <a className="transition hover:text-[#ffe1a7]" href="#">Terms</a>
              <a className="transition hover:text-[#ffe1a7]" href="#">Privacy</a>
              <a className="transition hover:text-[#ffe1a7]" href="#">Accessibility</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-[1000px] rounded-xl border border-[#4f4633] bg-[#131b2e] p-6 shadow-sm md:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[#ffe1a7]">Eventify</p>
        <h1 className="mt-3 font-['Hanken_Grotesk'] text-3xl font-semibold text-[#dae2fd] md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-[#d3c5ac]">{subtitle}</p>
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
            <Route path="/events/:eventId/details" element={<EventDetailsPage />} />

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route
                path="/my-registrations"
                element={<MyRegistrationsPage />}
              />
              <Route
                path="/certificates"
                element={<PlaceholderPage title="Certificates" subtitle="View and download your earned certificates." />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
              <Route
                path="/my-events"
                element={<Navigate to="/dashboard" replace />}
              />
              <Route path="/events/:eventId/feedbacks" element={<EventFeedbacksPage />} />
              <Route
                path="/dashboard"
                element={<OrganizerDashboardPage />}
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

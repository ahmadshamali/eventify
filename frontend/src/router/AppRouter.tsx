import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../shared/components/Navbar'

// Auth
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import VerifyEmailPage from '../features/auth/VerifyEmailPage'
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/ResetPasswordPage'

// Events
import EventsPage from '../features/events/EventsPage'
import CreateEventPage from '../features/events/CreateEventPage'
import OrganizerDashboardPage from '../features/organizer/OrganizerDashboardPage'
import AttendanceScanPage from '../features/organizer/AttendanceScanPage'
import EventDetailsPage from '../features/events/EventDetailsPage'
import MyRegistrationsPage from '../features/events/MyRegistrationsPage.tsx'
import EventFeedbacksPage from '../features/feedback/EventFeedbacksPage'
import AdminDashboardPage from '../features/admin/AdminDashboardPage'
import CertificatesPage from '../features/certificates/CertificatesPage'
import CertificateDetailPage from '../features/certificates/CertificateDetailPage'

function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] pt-16 pb-20 text-[var(--on-surface)] lg:ml-[280px] lg:pb-0">
        <Outlet />
        <footer className="border-t border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-6 md:px-8">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col justify-between gap-4 text-sm text-[var(--on-surface-variant)] md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <span className="font-['Hanken_Grotesk'] text-xl font-bold text-[var(--primary)]">Eventify</span>
              <span>University Eventify Platform.</span>
            </div>
            <div className="flex flex-wrap gap-5">
              <a className="transition hover:text-[var(--primary)]" href="#">Terms</a>
              <a className="transition hover:text-[var(--primary)]" href="#">Privacy</a>
              <a className="transition hover:text-[var(--primary)]" href="#">Accessibility</a>
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
      <div className="mx-auto w-full max-w-[1000px] rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Eventify</p>
        <h1 className="mt-3 font-['Hanken_Grotesk'] text-3xl font-semibold text-[var(--on-surface)] md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-[var(--on-surface-variant)]">{subtitle}</p>
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

        <Route path="/certificate/:attendanceId" element={<CertificateDetailPage />} />

        {/* Auth */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
                element={<CertificatesPage />}
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
              <Route
                path="/attendance/scan"
                element={<AttendanceScanPage />}
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

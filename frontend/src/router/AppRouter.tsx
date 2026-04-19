import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import VerifyEmailPage from '../features/auth/VerifyEmailPage'

// Events
import EventsPage from '../features/events/EventsPage'
import CreateEventPage from '../features/events/CreateEventPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        {/* Events */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
      </Routes>
    </BrowserRouter>
  )
}

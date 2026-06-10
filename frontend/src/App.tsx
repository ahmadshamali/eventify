import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { ToastContainer } from './shared/components/Toast'

function AppContent() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <AppRouter />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}
import './App.css'
import AppRouter from './router/AppRouter'
//import { AuthProvider } from './context/AuthContext'

export default function App() {

  return (
   // <AuthProvider>
      <AppRouter />
   // </AuthProvider> // remove comments when AuthContext.tsx is ready
  )
}
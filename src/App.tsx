import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { blink } from './lib/blink'
import { LandingPage } from './pages/LandingPage'
import { PractitionerDashboard } from './pages/PractitionerDashboard'
import { PatientPortal } from './pages/PatientPortal'
import { AdminPanel } from './pages/AdminPanel'
import { LoadingScreen } from './components/LoadingScreen'

interface User {
  id: string
  email: string
  role: 'practitioner' | 'patient' | 'admin'
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user as User | null)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/practitioner/*" 
            element={
              user?.role === 'practitioner' ? 
                <PractitionerDashboard /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/patient/*" 
            element={
              user?.role === 'patient' ? 
                <PatientPortal /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              user?.role === 'admin' ? 
                <AdminPanel /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { blink } from './lib/blink'
import { LandingPage } from './pages/LandingPage'
import { PractitionerDashboard } from './pages/PractitionerDashboard'
import { PatientPortal } from './pages/PatientPortal'
import { AdminPanel } from './pages/AdminPanel'
import { LoadingScreen } from './components/LoadingScreen'
import { RoleSelection } from './components/RoleSelection'

interface User {
  id: string
  email: string
  role?: 'practitioner' | 'patient' | 'admin'
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRoleSelection, setShowRoleSelection] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        // Check if user has a role stored in localStorage
        const storedRole = localStorage.getItem(`user_role_${state.user.id}`)
        if (storedRole) {
          setUser({
            ...state.user,
            role: storedRole as 'practitioner' | 'patient' | 'admin'
          })
          setShowRoleSelection(false)
        } else {
          setUser(state.user)
          setShowRoleSelection(true)
        }
      } else {
        setUser(null)
        setShowRoleSelection(false)
      }
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleRoleSelect = (role: 'practitioner' | 'patient' | 'admin') => {
    if (user) {
      // Store role in localStorage
      localStorage.setItem(`user_role_${user.id}`, role)
      setUser({ ...user, role })
      setShowRoleSelection(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  // Show role selection if user is authenticated but has no role
  if (user && showRoleSelection) {
    return <RoleSelection onRoleSelect={handleRoleSelect} userEmail={user.email} />
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
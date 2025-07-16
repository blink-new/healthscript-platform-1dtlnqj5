import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Stethoscope, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  LogOut
} from 'lucide-react'
import { blink } from '@/lib/blink'

export function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<'practitioner' | 'patient' | 'admin' | null>(null)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        const storedRole = localStorage.getItem(`user_role_${state.user.id}`)
        if (storedRole) {
          setUser({ ...state.user, role: storedRole })
          // Redirect to appropriate dashboard
          navigate(`/${storedRole}`)
        } else {
          setUser(state.user)
        }
      } else {
        setUser(null)
      }
    })
    return unsubscribe
  }, [navigate])

  const handleGetStarted = () => {
    blink.auth.login('/')
  }

  const handleLogout = () => {
    if (user) {
      localStorage.removeItem(`user_role_${user.id}`)
    }
    blink.auth.logout()
  }

  const roles = [
    {
      id: 'practitioner' as const,
      title: 'Healthcare Practitioner',
      description: 'Manage patients, create protocols, and grow your practice',
      icon: Stethoscope,
      features: [
        'Patient management dashboard',
        'Digital supplement protocols',
        'Custom branded storefront',
        'Revenue tracking & analytics'
      ],
      color: 'bg-primary'
    },
    {
      id: 'patient' as const,
      title: 'Patient',
      description: 'Access personalized recommendations from your practitioner',
      icon: Users,
      features: [
        'Personalized supplement plans',
        'Easy ordering & autoship',
        'Secure health profile',
        'Order tracking & history'
      ],
      color: 'bg-accent'
    },
    {
      id: 'admin' as const,
      title: 'Platform Administrator',
      description: 'Manage the marketplace, products, and compliance',
      icon: Shield,
      features: [
        'Product catalog management',
        'Practitioner verification',
        'Compliance monitoring',
        'Platform analytics'
      ],
      color: 'bg-secondary-600'
    }
  ]

  const platformFeatures = [
    {
      icon: Zap,
      title: 'Streamlined Workflows',
      description: 'Reduce administrative burden with automated processes'
    },
    {
      icon: ShoppingCart,
      title: 'Seamless Commerce',
      description: 'Professional-grade supplements with trusted fulfillment'
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Insights',
      description: 'Track outcomes and optimize patient care with analytics'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">HealthScript</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.email}
                  </span>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleGetStarted}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Professional Healthcare Platform
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Connect Practitioners
            <span className="text-primary block">with Patients</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The comprehensive platform for prescribing, managing, and delivering 
            professional-grade supplements with seamless practitioner-patient workflows.
          </p>
          
          {/* Platform Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Role
            </h2>
            <p className="text-lg text-muted-foreground">
              Select how you'll be using HealthScript to get started
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {roles.map((role) => (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                  selectedRole === role.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <role.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-8 py-3 text-lg"
              disabled={!selectedRole}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {selectedRole && (
              <p className="text-sm text-muted-foreground mt-3">
                Continue as {roles.find(r => r.id === selectedRole)?.title}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">HealthScript</span>
              </div>
              <p className="text-secondary-300">
                Empowering healthcare practitioners and patients through seamless supplement management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Practitioners</h3>
              <ul className="space-y-2 text-secondary-300">
                <li>Patient Management</li>
                <li>Protocol Builder</li>
                <li>Custom Storefronts</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Patients</h3>
              <ul className="space-y-2 text-secondary-300">
                <li>Personalized Plans</li>
                <li>Easy Ordering</li>
                <li>Autoship Options</li>
                <li>Health Tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-secondary-300">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Training Resources</li>
                <li>API Documentation</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 HealthScript. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
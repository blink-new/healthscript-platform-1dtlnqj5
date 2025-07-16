import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Stethoscope, 
  Users, 
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface RoleSelectionProps {
  onRoleSelect: (role: 'practitioner' | 'patient' | 'admin') => void
  userEmail: string
}

export function RoleSelection({ onRoleSelect, userEmail }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'practitioner' | 'patient' | 'admin' | null>(null)

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

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to HealthScript!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Hi {userEmail}
          </p>
          <p className="text-muted-foreground">
            Please select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
            onClick={handleContinue}
            className="px-8 py-3 text-lg"
            disabled={!selectedRole}
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          {selectedRole && (
            <p className="text-sm text-muted-foreground mt-3">
              Continue as {roles.find(r => r.id === selectedRole)?.title}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
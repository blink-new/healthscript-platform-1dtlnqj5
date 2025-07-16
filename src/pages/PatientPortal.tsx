import { Routes, Route } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  FileText, 
  Calendar, 
  Package,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export function PatientPortal() {
  const currentProtocols = [
    {
      name: 'Immune Support Protocol',
      practitioner: 'Dr. Sarah Mitchell',
      status: 'active',
      progress: 75,
      nextRefill: '5 days'
    },
    {
      name: 'Digestive Health Plan',
      practitioner: 'Dr. Sarah Mitchell',
      status: 'completed',
      progress: 100,
      nextRefill: null
    }
  ]

  const recentOrders = [
    {
      id: '#HS-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: '$89.99',
      items: 3
    },
    {
      id: '#HS-2024-002',
      date: '2024-01-10',
      status: 'shipped',
      total: '$124.50',
      items: 4
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">My Health Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Book Consultation
              </Button>
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shop Supplements
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<PatientHome currentProtocols={currentProtocols} recentOrders={recentOrders} />} />
      </Routes>
    </div>
  )
}

function PatientHome({ currentProtocols, recentOrders }: { 
  currentProtocols: any[], 
  recentOrders: any[] 
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, Sarah!</h2>
        <p className="text-muted-foreground">Here's your health journey overview</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Current Protocols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Current Protocols
            </CardTitle>
            <CardDescription>Your active supplement plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentProtocols.map((protocol, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{protocol.name}</h3>
                    <p className="text-sm text-muted-foreground">by {protocol.practitioner}</p>
                  </div>
                  <Badge variant={protocol.status === 'active' ? 'default' : 'secondary'}>
                    {protocol.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{protocol.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${protocol.progress}%` }}
                    />
                  </div>
                  {protocol.nextRefill && (
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Clock className="h-4 w-4 mr-1" />
                      Next refill in {protocol.nextRefill}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your health journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              View All Protocols
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Package className="h-4 w-4 mr-2" />
              Order History
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Health Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
          <CardDescription>Your latest supplement orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-500' : 
                    order.status === 'shipped' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.items} items • {order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.total}</p>
                  <div className="flex items-center text-sm">
                    {order.status === 'delivered' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
                    )}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
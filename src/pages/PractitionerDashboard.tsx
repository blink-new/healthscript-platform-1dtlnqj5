import { Routes, Route } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  Store, 
  BarChart3, 
  Plus,
  Activity,
  DollarSign,
  ShoppingBag
} from 'lucide-react'

export function PractitionerDashboard() {
  const stats = [
    {
      title: 'Active Patients',
      value: '127',
      change: '+12%',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Protocols Created',
      value: '43',
      change: '+8%',
      icon: FileText,
      color: 'text-accent'
    },
    {
      title: 'Monthly Revenue',
      value: '$12,450',
      change: '+23%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Orders This Month',
      value: '89',
      change: '+15%',
      icon: ShoppingBag,
      color: 'text-blue-600'
    }
  ]

  const recentActivity = [
    { patient: 'Sarah Johnson', action: 'Completed Immune Support Protocol', time: '2 hours ago' },
    { patient: 'Michael Chen', action: 'New order placed', time: '4 hours ago' },
    { patient: 'Emma Davis', action: 'Protocol updated', time: '6 hours ago' },
    { patient: 'James Wilson', action: 'First consultation scheduled', time: '1 day ago' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Practitioner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Protocol
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<DashboardHome stats={stats} recentActivity={recentActivity} />} />
      </Routes>
    </div>
  )
}

function DashboardHome({ stats, recentActivity }: { 
  stats: any[], 
  recentActivity: any[] 
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change} from last month</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Add New Patient
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Create Protocol
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Store className="h-4 w-4 mr-2" />
              Manage Storefront
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest patient interactions and orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.patient}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
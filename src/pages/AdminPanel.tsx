import { Routes, Route } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Package, 
  Shield, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

export function AdminPanel() {
  const platformStats = [
    {
      title: 'Total Practitioners',
      value: '1,247',
      change: '+8.2%',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Active Patients',
      value: '15,892',
      change: '+12.5%',
      icon: Users,
      color: 'text-accent'
    },
    {
      title: 'Products Listed',
      value: '3,456',
      change: '+5.1%',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly GMV',
      value: '$2.4M',
      change: '+18.7%',
      icon: TrendingUp,
      color: 'text-green-600'
    }
  ]

  const pendingApprovals = [
    {
      type: 'Practitioner',
      name: 'Dr. Michael Rodriguez',
      submitted: '2 days ago',
      status: 'pending'
    },
    {
      type: 'Product',
      name: 'Advanced Omega-3 Complex',
      submitted: '1 day ago',
      status: 'pending'
    },
    {
      type: 'Protocol',
      name: 'Cardiovascular Support Protocol',
      submitted: '3 hours ago',
      status: 'pending'
    }
  ]

  const recentActivity = [
    { action: 'New practitioner verified', user: 'Dr. Sarah Chen', time: '1 hour ago' },
    { action: 'Product compliance review completed', user: 'System', time: '2 hours ago' },
    { action: 'Platform policy updated', user: 'Admin Team', time: '4 hours ago' },
    { action: 'Monthly analytics report generated', user: 'System', time: '6 hours ago' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Compliance
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<AdminHome platformStats={platformStats} pendingApprovals={pendingApprovals} recentActivity={recentActivity} />} />
      </Routes>
    </div>
  )
}

function AdminHome({ platformStats, pendingApprovals, recentActivity }: { 
  platformStats: any[], 
  pendingApprovals: any[],
  recentActivity: any[]
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platformStats.map((stat, index) => (
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
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring admin review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.submitted}
                  </Badge>
                </div>
                <p className="font-medium text-sm">{item.name}</p>
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    Review
                  </Button>
                  <Button size="sm" className="flex-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Platform Activity
            </CardTitle>
            <CardDescription>Recent system and admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">by {activity.user}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Admin Tools</CardTitle>
          <CardDescription>Platform management and oversight</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Package className="h-6 w-6 mb-2" />
              Product Catalog
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              Compliance
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
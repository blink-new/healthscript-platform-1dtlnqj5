import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Filter,
  Clock,
  Pill,
  Save,
  Copy,
  Share,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  GripVertical,
  DollarSign
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface Supplement {
  id: string
  name: string
  brand: string
  category: string
  form: string
  strength: string
  unit: string
  description: string
  price: number
  isActive: boolean
}

interface ProtocolSupplement {
  id: string
  supplementId: string
  supplement: Supplement
  dosage: string
  frequency: string
  timing: string
  durationDays: number
  instructions: string
  isRequired: boolean
  sortOrder: number
}

interface Protocol {
  id: string
  practitionerId: string
  name: string
  description: string
  category: string
  durationWeeks: number
  status: 'draft' | 'active' | 'archived'
  isTemplate: boolean
  supplements: ProtocolSupplement[]
  createdAt: string
  updatedAt: string
}

const SAMPLE_SUPPLEMENTS: Supplement[] = [
  {
    id: 'supp_001',
    name: 'Vitamin D3',
    brand: 'Pure Encapsulations',
    category: 'Vitamins',
    form: 'Capsule',
    strength: '2000',
    unit: 'IU',
    description: 'High-potency vitamin D3 for immune and bone health support',
    price: 24.99,
    isActive: true
  },
  {
    id: 'supp_002',
    name: 'Omega-3 EPA/DHA',
    brand: 'Nordic Naturals',
    category: 'Essential Fatty Acids',
    form: 'Softgel',
    strength: '1000',
    unit: 'mg',
    description: 'Premium fish oil with optimal EPA/DHA ratio for cardiovascular health',
    price: 39.99,
    isActive: true
  },
  {
    id: 'supp_003',
    name: 'Magnesium Glycinate',
    brand: 'Thorne',
    category: 'Minerals',
    form: 'Capsule',
    strength: '200',
    unit: 'mg',
    description: 'Highly bioavailable magnesium for muscle and nervous system support',
    price: 29.99,
    isActive: true
  },
  {
    id: 'supp_004',
    name: 'Probiotics Multi-Strain',
    brand: 'Klaire Labs',
    category: 'Digestive Health',
    form: 'Capsule',
    strength: '25',
    unit: 'Billion CFU',
    description: 'Multi-strain probiotic formula for digestive and immune support',
    price: 49.99,
    isActive: true
  },
  {
    id: 'supp_005',
    name: 'B-Complex Active',
    brand: 'Seeking Health',
    category: 'Vitamins',
    form: 'Capsule',
    strength: 'High Potency',
    unit: 'Complex',
    description: 'Active B vitamins for energy metabolism and nervous system support',
    price: 34.99,
    isActive: true
  },
  {
    id: 'supp_006',
    name: 'Curcumin Phytosome',
    brand: 'Integrative Therapeutics',
    category: 'Herbs',
    form: 'Capsule',
    strength: '500',
    unit: 'mg',
    description: 'Enhanced absorption curcumin for inflammation support',
    price: 44.99,
    isActive: true
  },
  {
    id: 'supp_007',
    name: 'Zinc Bisglycinate',
    brand: 'Albion',
    category: 'Minerals',
    form: 'Capsule',
    strength: '15',
    unit: 'mg',
    description: 'Chelated zinc for immune function and wound healing',
    price: 19.99,
    isActive: true
  },
  {
    id: 'supp_008',
    name: 'CoQ10 Ubiquinol',
    brand: 'Life Extension',
    category: 'Antioxidants',
    form: 'Softgel',
    strength: '100',
    unit: 'mg',
    description: 'Active form of CoQ10 for cellular energy and heart health',
    price: 54.99,
    isActive: true
  }
]

export function ProtocolBuilder() {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [filteredProtocols, setFilteredProtocols] = useState<Protocol[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadProtocols(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  // Filter protocols whenever dependencies change
  useEffect(() => {
    let filtered = protocols

    if (searchTerm) {
      filtered = filtered.filter(protocol => 
        protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(protocol => protocol.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(protocol => protocol.category === categoryFilter)
    }

    setFilteredProtocols(filtered)
  }, [protocols, searchTerm, statusFilter, categoryFilter])

  const loadProtocols = async (practitionerId: string) => {
    try {
      const storedProtocols = localStorage.getItem(`protocols_${practitionerId}`)
      if (storedProtocols) {
        const parsedProtocols = JSON.parse(storedProtocols)
        setProtocols(parsedProtocols)
      } else {
        // Initialize with sample data
        const sampleProtocols: Protocol[] = [
          {
            id: 'prot_001',
            practitionerId,
            name: 'Immune Support Protocol',
            description: 'Comprehensive immune system support for seasonal wellness',
            category: 'Immune Health',
            durationWeeks: 8,
            status: 'active',
            isTemplate: true,
            supplements: [
              {
                id: 'ps_001',
                supplementId: 'supp_001',
                supplement: SAMPLE_SUPPLEMENTS[0],
                dosage: '1',
                frequency: 'Daily',
                timing: 'With breakfast',
                durationDays: 56,
                instructions: 'Take with food to enhance absorption',
                isRequired: true,
                sortOrder: 1
              },
              {
                id: 'ps_002',
                supplementId: 'supp_007',
                supplement: SAMPLE_SUPPLEMENTS[6],
                dosage: '1',
                frequency: 'Daily',
                timing: 'With dinner',
                durationDays: 56,
                instructions: 'Take on empty stomach if tolerated',
                isRequired: true,
                sortOrder: 2
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'prot_002',
            practitionerId,
            name: 'Cardiovascular Health Protocol',
            description: 'Heart health support with omega-3s and CoQ10',
            category: 'Cardiovascular',
            durationWeeks: 12,
            status: 'active',
            isTemplate: false,
            supplements: [
              {
                id: 'ps_003',
                supplementId: 'supp_002',
                supplement: SAMPLE_SUPPLEMENTS[1],
                dosage: '2',
                frequency: 'Daily',
                timing: 'With meals',
                durationDays: 84,
                instructions: 'Take with food to reduce fishy aftertaste',
                isRequired: true,
                sortOrder: 1
              },
              {
                id: 'ps_004',
                supplementId: 'supp_008',
                supplement: SAMPLE_SUPPLEMENTS[7],
                dosage: '1',
                frequency: 'Daily',
                timing: 'With breakfast',
                durationDays: 84,
                instructions: 'Take with fat-containing meal for better absorption',
                isRequired: true,
                sortOrder: 2
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        setProtocols(sampleProtocols)
        localStorage.setItem(`protocols_${practitionerId}`, JSON.stringify(sampleProtocols))
      }
    } catch (error) {
      console.error('Error loading protocols:', error)
    }
  }

  const saveProtocols = (updatedProtocols: Protocol[]) => {
    if (user) {
      localStorage.setItem(`protocols_${user.id}`, JSON.stringify(updatedProtocols))
      setProtocols(updatedProtocols)
    }
  }

  const createProtocol = (protocolData: Omit<Protocol, 'id' | 'practitionerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return

    const newProtocol: Protocol = {
      ...protocolData,
      id: `prot_${Date.now()}`,
      practitionerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedProtocols = [...protocols, newProtocol]
    saveProtocols(updatedProtocols)
    setIsCreateDialogOpen(false)
  }

  const updateProtocol = (protocolId: string, protocolData: Partial<Protocol>) => {
    const updatedProtocols = protocols.map(protocol => 
      protocol.id === protocolId 
        ? { ...protocol, ...protocolData, updatedAt: new Date().toISOString() }
        : protocol
    )
    saveProtocols(updatedProtocols)
    setIsEditDialogOpen(false)
    setSelectedProtocol(null)
  }

  const deleteProtocol = (protocolId: string) => {
    const updatedProtocols = protocols.filter(protocol => protocol.id !== protocolId)
    saveProtocols(updatedProtocols)
  }

  const duplicateProtocol = (protocol: Protocol) => {
    const duplicatedProtocol: Protocol = {
      ...protocol,
      id: `prot_${Date.now()}`,
      name: `${protocol.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedProtocols = [...protocols, duplicatedProtocol]
    saveProtocols(updatedProtocols)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      archived: 'outline'
    } as const

    const colors = {
      draft: 'text-yellow-600',
      active: 'text-green-600',
      archived: 'text-gray-600'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const categories = Array.from(new Set(protocols.map(p => p.category))).filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Protocol Builder</h2>
          <p className="text-muted-foreground">
            Create and manage supplement protocols for your patients
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Protocol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Protocol</DialogTitle>
              <DialogDescription>
                Build a new supplement protocol for your patients.
              </DialogDescription>
            </DialogHeader>
            <ProtocolForm onSubmit={createProtocol} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Protocols</p>
                <p className="text-2xl font-bold">{protocols.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Protocols</p>
                <p className="text-2xl font-bold">
                  {protocols.filter(p => p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">
                  {protocols.filter(p => p.isTemplate).length}
                </p>
              </div>
              <Copy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search protocols by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protocols Table */}
      <Card>
        <CardHeader>
          <CardTitle>Protocols ({filteredProtocols.length})</CardTitle>
          <CardDescription>
            Manage your supplement protocols and templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocol</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Supplements</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProtocols.map((protocol) => (
                <TableRow key={protocol.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {protocol.name}
                        {protocol.isTemplate && (
                          <Badge variant="outline" className="text-xs">
                            Template
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {protocol.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{protocol.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {protocol.durationWeeks} weeks
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Pill className="h-3 w-3 mr-1" />
                      {protocol.supplements.length} supplements
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(protocol.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(protocol.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProtocol(protocol)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProtocol(protocol)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateProtocol(protocol)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProtocol(protocol.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredProtocols.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No protocols found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first protocol.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Protocol Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Protocol Details</DialogTitle>
            <DialogDescription>
              Complete protocol information and supplement details.
            </DialogDescription>
          </DialogHeader>
          {selectedProtocol && <ProtocolDetails protocol={selectedProtocol} />}
        </DialogContent>
      </Dialog>

      {/* Edit Protocol Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Protocol</DialogTitle>
            <DialogDescription>
              Update the protocol information and supplements.
            </DialogDescription>
          </DialogHeader>
          {selectedProtocol && (
            <ProtocolForm 
              protocol={selectedProtocol}
              onSubmit={(data) => updateProtocol(selectedProtocol.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Protocol Form Component
function ProtocolForm({ 
  protocol, 
  onSubmit 
}: { 
  protocol?: Protocol
  onSubmit: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    name: protocol?.name || '',
    description: protocol?.description || '',
    category: protocol?.category || '',
    durationWeeks: protocol?.durationWeeks || 4,
    status: protocol?.status || 'draft',
    isTemplate: protocol?.isTemplate || false,
    supplements: protocol?.supplements || []
  })

  const [isAddSupplementOpen, setIsAddSupplementOpen] = useState(false)
  const [selectedSupplement, setSelectedSupplement] = useState<ProtocolSupplement | null>(null)
  const [isEditSupplementOpen, setIsEditSupplementOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addSupplement = (supplementData: Omit<ProtocolSupplement, 'id' | 'sortOrder'>) => {
    const newSupplement: ProtocolSupplement = {
      ...supplementData,
      id: `ps_${Date.now()}`,
      sortOrder: formData.supplements.length + 1
    }

    setFormData({
      ...formData,
      supplements: [...formData.supplements, newSupplement]
    })
    setIsAddSupplementOpen(false)
  }

  const updateSupplement = (supplementId: string, supplementData: Partial<ProtocolSupplement>) => {
    setFormData({
      ...formData,
      supplements: formData.supplements.map(supp => 
        supp.id === supplementId ? { ...supp, ...supplementData } : supp
      )
    })
    setIsEditSupplementOpen(false)
    setSelectedSupplement(null)
  }

  const removeSupplement = (supplementId: string) => {
    setFormData({
      ...formData,
      supplements: formData.supplements.filter(supp => supp.id !== supplementId)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Protocol Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Protocol Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Immune Health">Immune Health</SelectItem>
                <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                <SelectItem value="Digestive Health">Digestive Health</SelectItem>
                <SelectItem value="Mental Health">Mental Health</SelectItem>
                <SelectItem value="Women's Health">Women's Health</SelectItem>
                <SelectItem value="Men's Health">Men's Health</SelectItem>
                <SelectItem value="Energy & Metabolism">Energy & Metabolism</SelectItem>
                <SelectItem value="Detoxification">Detoxification</SelectItem>
                <SelectItem value="Anti-Aging">Anti-Aging</SelectItem>
                <SelectItem value="Sports Nutrition">Sports Nutrition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the purpose and benefits of this protocol..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="durationWeeks">Duration (weeks)</Label>
            <Input
              id="durationWeeks"
              type="number"
              min="1"
              max="52"
              value={formData.durationWeeks}
              onChange={(e) => setFormData({ ...formData, durationWeeks: parseInt(e.target.value) || 4 })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="isTemplate"
              checked={formData.isTemplate}
              onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isTemplate">Save as template</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Supplements Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Supplements ({formData.supplements.length})</h3>
          <Dialog open={isAddSupplementOpen} onOpenChange={setIsAddSupplementOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Supplement</DialogTitle>
                <DialogDescription>
                  Add a supplement to this protocol with dosage instructions.
                </DialogDescription>
              </DialogHeader>
              <SupplementForm onSubmit={addSupplement} />
            </DialogContent>
          </Dialog>
        </div>

        {formData.supplements.length > 0 ? (
          <div className="space-y-3">
            {formData.supplements.map((supplement, index) => (
              <Card key={supplement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{supplement.supplement.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {supplement.supplement.brand}
                        </Badge>
                        {supplement.isRequired && (
                          <Badge variant="default" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dosage:</span>
                          <div>{supplement.dosage} {supplement.supplement.form.toLowerCase()}(s)</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>
                          <div>{supplement.frequency}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timing:</span>
                          <div>{supplement.timing}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div>{supplement.durationDays} days</div>
                        </div>
                      </div>
                      {supplement.instructions && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Instructions:</span> {supplement.instructions}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSupplement(supplement)
                          setIsEditSupplementOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupplement(supplement.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No supplements added</h3>
            <p className="text-muted-foreground mb-4">
              Add supplements to create a complete protocol.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {protocol ? 'Update Protocol' : 'Create Protocol'}
        </Button>
      </div>

      {/* Edit Supplement Dialog */}
      <Dialog open={isEditSupplementOpen} onOpenChange={setIsEditSupplementOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplement</DialogTitle>
            <DialogDescription>
              Update the supplement dosage and instructions.
            </DialogDescription>
          </DialogHeader>
          {selectedSupplement && (
            <SupplementForm 
              supplement={selectedSupplement}
              onSubmit={(data) => updateSupplement(selectedSupplement.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>
    </form>
  )
}

// Supplement Form Component
function SupplementForm({ 
  supplement, 
  onSubmit 
}: { 
  supplement?: ProtocolSupplement
  onSubmit: (data: any) => void 
}) {
  const [selectedSupplementId, setSelectedSupplementId] = useState(supplement?.supplementId || '')
  const [formData, setFormData] = useState({
    dosage: supplement?.dosage || '1',
    frequency: supplement?.frequency || 'Daily',
    timing: supplement?.timing || 'With meals',
    durationDays: supplement?.durationDays || 30,
    instructions: supplement?.instructions || '',
    isRequired: supplement?.isRequired ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSupplementId) return

    const selectedSupplement = SAMPLE_SUPPLEMENTS.find(s => s.id === selectedSupplementId)
    if (!selectedSupplement) return

    onSubmit({
      supplementId: selectedSupplementId,
      supplement: selectedSupplement,
      ...formData
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!supplement && (
        <div>
          <Label htmlFor="supplement">Select Supplement *</Label>
          <Select value={selectedSupplementId} onValueChange={setSelectedSupplementId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a supplement" />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_SUPPLEMENTS.map((supp) => (
                <SelectItem key={supp.id} value={supp.id}>
                  <div className="flex flex-col">
                    <span>{supp.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {supp.brand} - {supp.strength} {supp.unit}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            placeholder="e.g., 1, 2, 1/2"
            required
          />
        </div>
        <div>
          <Label htmlFor="frequency">Frequency *</Label>
          <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Twice daily">Twice daily</SelectItem>
              <SelectItem value="Three times daily">Three times daily</SelectItem>
              <SelectItem value="Every other day">Every other day</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="As needed">As needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timing">Timing</Label>
          <Select value={formData.timing} onValueChange={(value) => setFormData({ ...formData, timing: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="With meals">With meals</SelectItem>
              <SelectItem value="With breakfast">With breakfast</SelectItem>
              <SelectItem value="With lunch">With lunch</SelectItem>
              <SelectItem value="With dinner">With dinner</SelectItem>
              <SelectItem value="Between meals">Between meals</SelectItem>
              <SelectItem value="On empty stomach">On empty stomach</SelectItem>
              <SelectItem value="Before bed">Before bed</SelectItem>
              <SelectItem value="Morning">Morning</SelectItem>
              <SelectItem value="Evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="durationDays">Duration (days)</Label>
          <Input
            id="durationDays"
            type="number"
            min="1"
            max="365"
            value={formData.durationDays}
            onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Special Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          placeholder="Any special instructions for taking this supplement..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isRequired"
          checked={formData.isRequired}
          onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isRequired">Required supplement</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          {supplement ? 'Update Supplement' : 'Add Supplement'}
        </Button>
      </div>
    </form>
  )
}

// Protocol Details Component
function ProtocolDetails({ protocol }: { protocol: Protocol }) {
  const totalCost = protocol.supplements.reduce((sum, supp) => sum + supp.supplement.price, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{protocol.name}</h3>
          <p className="text-muted-foreground">{protocol.description}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={protocol.status === 'active' ? 'default' : 'secondary'}>
            {protocol.status.charAt(0).toUpperCase() + protocol.status.slice(1)}
          </Badge>
          {protocol.isTemplate && (
            <Badge variant="outline">Template</Badge>
          )}
        </div>
      </div>

      {/* Protocol Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Protocol Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Category:</span>
              <div>{protocol.category}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Duration:</span>
              <div>{protocol.durationWeeks} weeks</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Supplements:</span>
              <div>{protocol.supplements.length} items</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Created:</span>
              <div>{new Date(protocol.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Last Updated:</span>
              <div>{new Date(protocol.updatedAt).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Cost Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Total Cost:</span>
              <div className="text-lg font-bold">${totalCost.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Per Week:</span>
              <div>${(totalCost / protocol.durationWeeks).toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplements List */}
      <Card>
        <CardHeader>
          <CardTitle>Supplement Details</CardTitle>
          <CardDescription>
            Complete list of supplements in this protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {protocol.supplements.map((supplement, index) => (
              <div key={supplement.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      {supplement.supplement.name}
                      {supplement.isRequired && (
                        <Badge variant="default" className="text-xs">Required</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {supplement.supplement.brand} - {supplement.supplement.strength} {supplement.supplement.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${supplement.supplement.price}</div>
                    <div className="text-sm text-muted-foreground">{supplement.supplement.form}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Dosage:</span>
                    <div className="font-medium">{supplement.dosage} {supplement.supplement.form.toLowerCase()}(s)</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <div className="font-medium">{supplement.frequency}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timing:</span>
                    <div className="font-medium">{supplement.timing}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">{supplement.durationDays} days</div>
                  </div>
                </div>

                {supplement.instructions && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <span className="text-sm font-medium">Instructions:</span>
                    <p className="text-sm mt-1">{supplement.instructions}</p>
                  </div>
                )}

                <div className="mt-3 text-sm text-muted-foreground">
                  {supplement.supplement.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
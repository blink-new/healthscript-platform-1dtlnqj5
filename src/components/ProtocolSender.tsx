import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Send, 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Mail,
  Calendar,
  Filter,
  Plus
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
}

interface Protocol {
  id: string
  name: string
  description: string
  category: string
  durationWeeks: number
  supplements: any[]
}

interface SentProtocol {
  id: string
  protocolId: string
  protocol: Protocol
  patientId: string
  patient: Patient
  practitionerId: string
  message: string
  status: 'sent' | 'viewed' | 'accepted' | 'declined'
  sentAt: string
  viewedAt?: string
  respondedAt?: string
  notes?: string
}

export function ProtocolSender() {
  const [sentProtocols, setSentProtocols] = useState<SentProtocol[]>([])
  const [filteredSentProtocols, setFilteredSentProtocols] = useState<SentProtocol[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSentProtocol, setSelectedSentProtocol] = useState<SentProtocol | null>(null)
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [preSelectedPatientId, setPreSelectedPatientId] = useState<string>('')
  const [preSelectedProtocolId, setPreSelectedProtocolId] = useState<string>('')

  // Check for URL parameters to pre-select patient or protocol
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const patientId = urlParams.get('patient')
    const protocolId = urlParams.get('protocol')
    
    if (patientId) {
      setPreSelectedPatientId(patientId)
      setIsSendDialogOpen(true)
    }
    
    if (protocolId) {
      setPreSelectedProtocolId(protocolId)
      setIsSendDialogOpen(true)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadSentProtocols(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  // Filter sent protocols whenever dependencies change
  useEffect(() => {
    let filtered = sentProtocols

    if (searchTerm) {
      filtered = filtered.filter(sp => 
        sp.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sp => sp.status === statusFilter)
    }

    setFilteredSentProtocols(filtered)
  }, [sentProtocols, searchTerm, statusFilter])

  const loadSentProtocols = async (practitionerId: string) => {
    try {
      const storedSentProtocols = localStorage.getItem(`sent_protocols_${practitionerId}`)
      if (storedSentProtocols) {
        const parsedSentProtocols = JSON.parse(storedSentProtocols)
        setSentProtocols(parsedSentProtocols)
      } else {
        // Initialize with sample data
        const sampleSentProtocols: SentProtocol[] = [
          {
            id: 'sp_001',
            protocolId: 'prot_001',
            protocol: {
              id: 'prot_001',
              name: 'Immune Support Protocol',
              description: 'Comprehensive immune system support for seasonal wellness',
              category: 'Immune Health',
              durationWeeks: 8,
              supplements: []
            },
            patientId: 'pat_001',
            patient: {
              id: 'pat_001',
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah.johnson@email.com',
              status: 'active'
            },
            practitionerId,
            message: 'Hi Sarah, I\'ve created a personalized immune support protocol for you based on our recent consultation. This protocol will help strengthen your immune system during the winter months.',
            status: 'viewed',
            sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'sp_002',
            protocolId: 'prot_002',
            protocol: {
              id: 'prot_002',
              name: 'Cardiovascular Health Protocol',
              description: 'Heart health support with omega-3s and CoQ10',
              category: 'Cardiovascular',
              durationWeeks: 12,
              supplements: []
            },
            patientId: 'pat_002',
            patient: {
              id: 'pat_002',
              firstName: 'Michael',
              lastName: 'Chen',
              email: 'michael.chen@email.com',
              status: 'active'
            },
            practitionerId,
            message: 'Michael, following our discussion about your cardiovascular health goals, I\'ve prepared this protocol to support your heart health and overall wellness.',
            status: 'sent',
            sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ]
        setSentProtocols(sampleSentProtocols)
        localStorage.setItem(`sent_protocols_${practitionerId}`, JSON.stringify(sampleSentProtocols))
      }
    } catch (error) {
      console.error('Error loading sent protocols:', error)
    }
  }

  const saveSentProtocols = (updatedSentProtocols: SentProtocol[]) => {
    if (user) {
      localStorage.setItem(`sent_protocols_${user.id}`, JSON.stringify(updatedSentProtocols))
      setSentProtocols(updatedSentProtocols)
    }
  }

  const sendProtocol = (data: {
    protocolId: string
    patientId: string
    message: string
  }) => {
    if (!user) return

    // Get protocol and patient data from localStorage
    const protocols = JSON.parse(localStorage.getItem(`protocols_${user.id}`) || '[]')
    const patients = JSON.parse(localStorage.getItem(`patients_${user.id}`) || '[]')
    
    const protocol = protocols.find((p: Protocol) => p.id === data.protocolId)
    const patient = patients.find((p: Patient) => p.id === data.patientId)

    if (!protocol || !patient) return

    const newSentProtocol: SentProtocol = {
      id: `sp_${Date.now()}`,
      protocolId: data.protocolId,
      protocol,
      patientId: data.patientId,
      patient,
      practitionerId: user.id,
      message: data.message,
      status: 'sent',
      sentAt: new Date().toISOString()
    }

    const updatedSentProtocols = [...sentProtocols, newSentProtocol]
    saveSentProtocols(updatedSentProtocols)
    setIsSendDialogOpen(false)

    // Also add to patient's received protocols
    const patientReceivedProtocols = JSON.parse(localStorage.getItem(`received_protocols_${data.patientId}`) || '[]')
    patientReceivedProtocols.push(newSentProtocol)
    localStorage.setItem(`received_protocols_${data.patientId}`, JSON.stringify(patientReceivedProtocols))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'secondary',
      viewed: 'default',
      accepted: 'default',
      declined: 'destructive'
    } as const

    const icons = {
      sent: Clock,
      viewed: Eye,
      accepted: CheckCircle,
      declined: AlertCircle
    }

    const Icon = icons[status as keyof typeof icons] || Clock

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'text-yellow-600',
      viewed: 'text-blue-600',
      accepted: 'text-green-600',
      declined: 'text-red-600'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Protocol Communications</h2>
          <p className="text-muted-foreground">
            Send protocols to patients and track their responses
          </p>
        </div>
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Protocol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Protocol to Patient</DialogTitle>
              <DialogDescription>
                Select a protocol and patient to send personalized recommendations.
              </DialogDescription>
            </DialogHeader>
            <SendProtocolForm 
              onSubmit={sendProtocol} 
              practitionerId={user?.id} 
              preSelectedPatientId={preSelectedPatientId}
              preSelectedProtocolId={preSelectedProtocolId}
              onClose={() => {
                setIsSendDialogOpen(false)
                setPreSelectedPatientId('')
                setPreSelectedProtocolId('')
                // Clear URL parameters
                window.history.replaceState({}, '', window.location.pathname)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{sentProtocols.length}</p>
              </div>
              <Send className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Viewed</p>
                <p className="text-2xl font-bold">
                  {sentProtocols.filter(sp => ['viewed', 'accepted', 'declined'].includes(sp.status)).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">
                  {sentProtocols.filter(sp => sp.status === 'accepted').length}
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
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">
                  {sentProtocols.length > 0 
                    ? Math.round((sentProtocols.filter(sp => ['accepted', 'declined'].includes(sp.status)).length / sentProtocols.length) * 100)
                    : 0}%
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search by patient name, protocol, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sent Protocols Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Protocols ({filteredSentProtocols.length})</CardTitle>
          <CardDescription>
            Track the status of protocols sent to your patients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSentProtocols.map((sentProtocol) => (
                <TableRow key={sentProtocol.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {sentProtocol.patient.firstName} {sentProtocol.patient.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {sentProtocol.patient.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sentProtocol.protocol.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {sentProtocol.protocol.category} • {sentProtocol.protocol.durationWeeks} weeks
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(sentProtocol.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(sentProtocol.sentAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {sentProtocol.respondedAt ? (
                        <span>Responded {new Date(sentProtocol.respondedAt).toLocaleDateString()}</span>
                      ) : sentProtocol.viewedAt ? (
                        <span>Viewed {new Date(sentProtocol.viewedAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-muted-foreground">Not viewed</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSentProtocol(sentProtocol)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSentProtocols.length === 0 && (
            <div className="text-center py-8">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No protocols sent</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Start by sending your first protocol to a patient.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Sent Protocol Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Protocol Communication Details</DialogTitle>
            <DialogDescription>
              View the complete protocol communication and patient response.
            </DialogDescription>
          </DialogHeader>
          {selectedSentProtocol && <SentProtocolDetails sentProtocol={selectedSentProtocol} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Send Protocol Form Component
function SendProtocolForm({ 
  onSubmit, 
  practitionerId,
  preSelectedPatientId,
  preSelectedProtocolId,
  onClose
}: { 
  onSubmit: (data: any) => void
  practitionerId: string
  preSelectedPatientId?: string
  preSelectedProtocolId?: string
  onClose?: () => void
}) {
  const [formData, setFormData] = useState({
    protocolId: preSelectedProtocolId || '',
    patientId: preSelectedPatientId || '',
    message: ''
  })
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    if (practitionerId) {
      // Load protocols and patients
      const storedProtocols = localStorage.getItem(`protocols_${practitionerId}`)
      const storedPatients = localStorage.getItem(`patients_${practitionerId}`)
      
      if (storedProtocols) {
        setProtocols(JSON.parse(storedProtocols))
      }
      
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients))
      }
    }
  }, [practitionerId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.protocolId && formData.patientId && formData.message) {
      onSubmit(formData)
      setFormData({ protocolId: '', patientId: '', message: '' })
      onClose?.()
    }
  }

  const selectedProtocol = protocols.find(p => p.id === formData.protocolId)
  const selectedPatient = patients.find(p => p.id === formData.patientId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="protocolId">Select Protocol *</Label>
          <Select value={formData.protocolId} onValueChange={(value) => setFormData({ ...formData, protocolId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a protocol" />
            </SelectTrigger>
            <SelectContent>
              {protocols.filter(p => p.status === 'active').map((protocol) => (
                <SelectItem key={protocol.id} value={protocol.id}>
                  <div className="flex flex-col">
                    <span>{protocol.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {protocol.category} • {protocol.durationWeeks} weeks
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="patientId">Select Patient *</Label>
          <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.filter(p => p.status === 'active').map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  <div className="flex flex-col">
                    <span>{patient.firstName} {patient.lastName}</span>
                    <span className="text-xs text-muted-foreground">{patient.email}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview Selected Items */}
      {(selectedProtocol || selectedPatient) && (
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium">Preview</h4>
          {selectedPatient && (
            <div>
              <span className="text-sm text-muted-foreground">Patient: </span>
              <span>{selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.email})</span>
            </div>
          )}
          {selectedProtocol && (
            <div>
              <span className="text-sm text-muted-foreground">Protocol: </span>
              <span>{selectedProtocol.name} - {selectedProtocol.description}</span>
            </div>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="message">Personal Message *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Write a personalized message to your patient about this protocol..."
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!formData.protocolId || !formData.patientId || !formData.message}>
          <Send className="h-4 w-4 mr-2" />
          Send Protocol
        </Button>
      </div>
    </form>
  )
}

// Sent Protocol Details Component
function SentProtocolDetails({ sentProtocol }: { sentProtocol: SentProtocol }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{sentProtocol.protocol.name}</h3>
          <p className="text-muted-foreground">
            Sent to {sentProtocol.patient.firstName} {sentProtocol.patient.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sentProtocol.status === 'sent' && <Clock className="h-5 w-5 text-yellow-600" />}
          {sentProtocol.status === 'viewed' && <Eye className="h-5 w-5 text-blue-600" />}
          {sentProtocol.status === 'accepted' && <CheckCircle className="h-5 w-5 text-green-600" />}
          {sentProtocol.status === 'declined' && <AlertCircle className="h-5 w-5 text-red-600" />}
          <Badge variant={sentProtocol.status === 'accepted' ? 'default' : 'secondary'}>
            {sentProtocol.status.charAt(0).toUpperCase() + sentProtocol.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Communication Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <div>
                <p className="font-medium">Protocol Sent</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(sentProtocol.sentAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            {sentProtocol.viewedAt && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <div>
                  <p className="font-medium">Viewed by Patient</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sentProtocol.viewedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            
            {sentProtocol.respondedAt && (
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  sentProtocol.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'
                }`} />
                <div>
                  <p className="font-medium">
                    {sentProtocol.status === 'accepted' ? 'Accepted' : 'Declined'} by Patient
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sentProtocol.respondedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Name:</span>
              <div>{sentProtocol.patient.firstName} {sentProtocol.patient.lastName}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email:</span>
              <div>{sentProtocol.patient.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protocol Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Protocol Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Description:</span>
              <p>{sentProtocol.protocol.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Category:</span>
                <div>{sentProtocol.protocol.category}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Duration:</span>
                <div>{sentProtocol.protocol.durationWeeks} weeks</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Personal Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{sentProtocol.message}</p>
        </CardContent>
      </Card>

      {/* Patient Notes (if any) */}
      {sentProtocol.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Response Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{sentProtocol.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
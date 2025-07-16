import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  FileText, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Pill,
  Heart,
  ShoppingCart,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface SentProtocol {
  id: string
  protocolId: string
  protocol: {
    id: string
    name: string
    description: string
    category: string
    durationWeeks: number
    supplements: any[]
  }
  patientId: string
  patient: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  practitionerId: string
  message: string
  status: 'sent' | 'viewed' | 'accepted' | 'declined'
  sentAt: string
  viewedAt?: string
  respondedAt?: string
  notes?: string
}

export function ReceivedProtocols({ patientId }: { patientId: string }) {
  const [receivedProtocols, setReceivedProtocols] = useState<SentProtocol[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState<SentProtocol | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [responseNotes, setResponseNotes] = useState('')

  useEffect(() => {
    if (patientId) {
      loadReceivedProtocols(patientId)
    }
  }, [patientId])

  const loadReceivedProtocols = async (patientId: string) => {
    try {
      const storedProtocols = localStorage.getItem(`received_protocols_${patientId}`)
      if (storedProtocols) {
        const parsedProtocols = JSON.parse(storedProtocols)
        setReceivedProtocols(parsedProtocols)
      }
    } catch (error) {
      console.error('Error loading received protocols:', error)
    }
  }

  const saveReceivedProtocols = (updatedProtocols: SentProtocol[]) => {
    localStorage.setItem(`received_protocols_${patientId}`, JSON.stringify(updatedProtocols))
    setReceivedProtocols(updatedProtocols)
  }

  const markAsViewed = (protocolId: string) => {
    const updatedProtocols = receivedProtocols.map(protocol => {
      if (protocol.id === protocolId && protocol.status === 'sent') {
        const updatedProtocol = {
          ...protocol,
          status: 'viewed' as const,
          viewedAt: new Date().toISOString()
        }
        
        // Also update in practitioner's sent protocols
        const practitionerSentProtocols = JSON.parse(
          localStorage.getItem(`sent_protocols_${protocol.practitionerId}`) || '[]'
        )
        const updatedPractitionerProtocols = practitionerSentProtocols.map((p: SentProtocol) =>
          p.id === protocolId ? updatedProtocol : p
        )
        localStorage.setItem(
          `sent_protocols_${protocol.practitionerId}`, 
          JSON.stringify(updatedPractitionerProtocols)
        )
        
        return updatedProtocol
      }
      return protocol
    })
    
    saveReceivedProtocols(updatedProtocols)
  }

  const respondToProtocol = (protocolId: string, response: 'accepted' | 'declined', notes: string) => {
    const updatedProtocols = receivedProtocols.map(protocol => {
      if (protocol.id === protocolId) {
        const updatedProtocol = {
          ...protocol,
          status: response,
          respondedAt: new Date().toISOString(),
          notes: notes
        }
        
        // Also update in practitioner's sent protocols
        const practitionerSentProtocols = JSON.parse(
          localStorage.getItem(`sent_protocols_${protocol.practitionerId}`) || '[]'
        )
        const updatedPractitionerProtocols = practitionerSentProtocols.map((p: SentProtocol) =>
          p.id === protocolId ? updatedProtocol : p
        )
        localStorage.setItem(
          `sent_protocols_${protocol.practitionerId}`, 
          JSON.stringify(updatedPractitionerProtocols)
        )
        
        return updatedProtocol
      }
      return protocol
    })
    
    saveReceivedProtocols(updatedProtocols)
    setIsResponseDialogOpen(false)
    setResponseNotes('')
    setSelectedProtocol(null)
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

  const handleViewProtocol = (protocol: SentProtocol) => {
    setSelectedProtocol(protocol)
    setIsViewDialogOpen(true)
    
    // Mark as viewed if not already viewed
    if (protocol.status === 'sent') {
      markAsViewed(protocol.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Protocols</h2>
          <p className="text-muted-foreground">
            Supplement protocols recommended by your healthcare provider
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">{receivedProtocols.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New</p>
                <p className="text-2xl font-bold">
                  {receivedProtocols.filter(p => p.status === 'sent').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">
                  {receivedProtocols.filter(p => p.status === 'accepted').length}
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
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {receivedProtocols.filter(p => p.status === 'accepted').length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocols List */}
      <Card>
        <CardHeader>
          <CardTitle>Received Protocols ({receivedProtocols.length})</CardTitle>
          <CardDescription>
            Protocols sent to you by your healthcare provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {receivedProtocols.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivedProtocols.map((protocol) => (
                  <TableRow key={protocol.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {protocol.protocol.name}
                          {protocol.status === 'sent' && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {protocol.protocol.category} • {protocol.protocol.durationWeeks} weeks
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Dr. Healthcare Provider</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(protocol.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(protocol.sentAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProtocol(protocol)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {protocol.status === 'accepted' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Shop supplements"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        )}
                        {['sent', 'viewed'].includes(protocol.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProtocol(protocol)
                              setIsResponseDialogOpen(true)
                            }}
                            title="Respond to protocol"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No protocols received</h3>
              <p className="text-muted-foreground">
                Your healthcare provider hasn't sent you any protocols yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Protocol Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Protocol Details</DialogTitle>
            <DialogDescription>
              Review the complete protocol information and recommendations.
            </DialogDescription>
          </DialogHeader>
          {selectedProtocol && <ProtocolDetails protocol={selectedProtocol} />}
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Protocol</DialogTitle>
            <DialogDescription>
              Let your provider know if you accept or decline this protocol.
            </DialogDescription>
          </DialogHeader>
          {selectedProtocol && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedProtocol.protocol.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedProtocol.protocol.description}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Optional Notes</label>
                <Textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Add any questions or comments for your provider..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => respondToProtocol(selectedProtocol.id, 'accepted', responseNotes)}
                  className="flex-1"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Accept Protocol
                </Button>
                <Button
                  variant="outline"
                  onClick={() => respondToProtocol(selectedProtocol.id, 'declined', responseNotes)}
                  className="flex-1"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Protocol Details Component for Patient View
function ProtocolDetails({ protocol }: { protocol: SentProtocol }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{protocol.protocol.name}</h3>
          <p className="text-muted-foreground">{protocol.protocol.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {protocol.status === 'sent' && <Clock className="h-5 w-5 text-yellow-600" />}
          {protocol.status === 'viewed' && <Eye className="h-5 w-5 text-blue-600" />}
          {protocol.status === 'accepted' && <CheckCircle className="h-5 w-5 text-green-600" />}
          {protocol.status === 'declined' && <AlertCircle className="h-5 w-5 text-red-600" />}
          <Badge variant={protocol.status === 'accepted' ? 'default' : 'secondary'}>
            {protocol.status.charAt(0).toUpperCase() + protocol.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Protocol Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>{protocol.protocol.category}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Duration:</span>
              <div>{protocol.protocol.durationWeeks} weeks</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Supplements:</span>
              <div>{protocol.protocol.supplements?.length || 0} items</div>
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
              <span className="text-sm text-muted-foreground">Received:</span>
              <div>{new Date(protocol.sentAt).toLocaleDateString()}</div>
            </div>
            {protocol.viewedAt && (
              <div>
                <span className="text-sm text-muted-foreground">Viewed:</span>
                <div>{new Date(protocol.viewedAt).toLocaleDateString()}</div>
              </div>
            )}
            {protocol.respondedAt && (
              <div>
                <span className="text-sm text-muted-foreground">Responded:</span>
                <div>{new Date(protocol.respondedAt).toLocaleDateString()}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personal Message from Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Message from Your Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{protocol.message}</p>
        </CardContent>
      </Card>

      {/* Supplement Information */}
      {protocol.protocol.supplements && protocol.protocol.supplements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2" />
              Recommended Supplements
            </CardTitle>
            <CardDescription>
              Supplements included in this protocol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {protocol.protocol.supplements.map((supplement: any, index: number) => (
                <div key={supplement.id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        {supplement.supplement?.name || supplement.name}
                        {supplement.isRequired && (
                          <Badge variant="default" className="text-xs">Required</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {supplement.supplement?.brand || supplement.brand} - {supplement.supplement?.strength || supplement.strength} {supplement.supplement?.unit || supplement.unit}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dosage:</span>
                      <div className="font-medium">{supplement.dosage} {supplement.supplement?.form?.toLowerCase() || 'capsule'}(s)</div>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Notes */}
      {protocol.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Your Response</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{protocol.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
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
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  Pill,
  FileText,
  Filter,
  Send
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface Patient {
  id: string
  practitionerId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  medicalConditions?: string
  allergies?: string
  currentMedications?: string
  notes?: string
  status: 'active' | 'inactive' | 'archived'
  createdAt: string
  updatedAt: string
}

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadPatients(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  // Filter patients whenever dependencies change
  useEffect(() => {
    let filtered = patients

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter)
    }

    setFilteredPatients(filtered)
  }, [patients, searchTerm, statusFilter])

  const loadPatients = async (practitionerId: string) => {
    try {
      // For now, we'll use localStorage to simulate database
      const storedPatients = localStorage.getItem(`patients_${practitionerId}`)
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients)
        setPatients(parsedPatients)
      } else {
        // Initialize with sample data
        const samplePatients: Patient[] = [
          {
            id: 'pat_001',
            practitionerId,
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1 (555) 123-4567',
            dateOfBirth: '1985-03-15',
            gender: 'female',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'US',
            medicalConditions: 'Hypothyroidism, Vitamin D deficiency',
            allergies: 'Shellfish, Peanuts',
            currentMedications: 'Levothyroxine 50mcg daily',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'pat_002',
            practitionerId,
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@email.com',
            phone: '+1 (555) 987-6543',
            dateOfBirth: '1978-11-22',
            gender: 'male',
            addressLine1: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'US',
            medicalConditions: 'Type 2 Diabetes, Hypertension',
            allergies: 'None known',
            currentMedications: 'Metformin 500mg twice daily, Lisinopril 10mg daily',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        setPatients(samplePatients)
        localStorage.setItem(`patients_${practitionerId}`, JSON.stringify(samplePatients))
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  const savePatients = (updatedPatients: Patient[]) => {
    if (user) {
      localStorage.setItem(`patients_${user.id}`, JSON.stringify(updatedPatients))
      setPatients(updatedPatients)
    }
  }

  const addPatient = (patientData: Omit<Patient, 'id' | 'practitionerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return

    const newPatient: Patient = {
      ...patientData,
      id: `pat_${Date.now()}`,
      practitionerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedPatients = [...patients, newPatient]
    savePatients(updatedPatients)
    setIsAddDialogOpen(false)
  }

  const updatePatient = (patientId: string, patientData: Partial<Patient>) => {
    const updatedPatients = patients.map(patient => 
      patient.id === patientId 
        ? { ...patient, ...patientData, updatedAt: new Date().toISOString() }
        : patient
    )
    savePatients(updatedPatients)
    setIsEditDialogOpen(false)
    setSelectedPatient(null)
  }

  const deletePatient = (patientId: string) => {
    const updatedPatients = patients.filter(patient => patient.id !== patientId)
    savePatients(updatedPatients)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      archived: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
          <p className="text-muted-foreground">
            Manage your patient records and information
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter the patient's information to create a new record.
              </DialogDescription>
            </DialogHeader>
            <PatientForm onSubmit={addPatient} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-2xl font-bold">
                  {patients.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">
                  {patients.filter(p => {
                    const created = new Date(p.createdAt)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Allergies</p>
                <p className="text-2xl font-bold">
                  {patients.filter(p => p.allergies && p.allergies.toLowerCase() !== 'none known').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
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
                  placeholder="Search patients by name or email..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patients ({filteredPatients.length})</CardTitle>
          <CardDescription>
            A list of all your patients and their information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {patient.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {patient.email}
                      </div>
                      {patient.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.dateOfBirth ? (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {calculateAge(patient.dateOfBirth)} years
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(patient.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(patient.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsViewDialogOpen(true)
                        }}
                        title="View patient details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Navigate to communications page with patient pre-selected
                          window.location.href = `/practitioner/communications?patient=${patient.id}`
                        }}
                        title="Send protocol to patient"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsEditDialogOpen(true)
                        }}
                        title="Edit patient"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePatient(patient.id)}
                        title="Delete patient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No patients found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by adding your first patient.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete patient information and medical history.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && <PatientDetails patient={selectedPatient} />}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update the patient's information.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <PatientForm 
              patient={selectedPatient}
              onSubmit={(data) => updatePatient(selectedPatient.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Patient Form Component
function PatientForm({ 
  patient, 
  onSubmit 
}: { 
  patient?: Patient
  onSubmit: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || '',
    addressLine1: patient?.addressLine1 || '',
    addressLine2: patient?.addressLine2 || '',
    city: patient?.city || '',
    state: patient?.state || '',
    zipCode: patient?.zipCode || '',
    country: patient?.country || 'US',
    emergencyContactName: patient?.emergencyContactName || '',
    emergencyContactPhone: patient?.emergencyContactPhone || '',
    medicalConditions: patient?.medicalConditions || '',
    allergies: patient?.allergies || '',
    currentMedications: patient?.currentMedications || '',
    notes: patient?.notes || '',
    status: patient?.status || 'active'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Information</h3>
        <div>
          <Label htmlFor="addressLine1">Address Line 1</Label>
          <Input
            id="addressLine1"
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            value={formData.addressLine2}
            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Emergency Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContactName">Contact Name</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Medical Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Medical Information</h3>
        <div>
          <Label htmlFor="medicalConditions">Medical Conditions</Label>
          <Textarea
            id="medicalConditions"
            value={formData.medicalConditions}
            onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
            placeholder="List any known medical conditions..."
          />
        </div>
        <div>
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea
            id="allergies"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            placeholder="List any known allergies..."
          />
        </div>
        <div>
          <Label htmlFor="currentMedications">Current Medications</Label>
          <Textarea
            id="currentMedications"
            value={formData.currentMedications}
            onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
            placeholder="List current medications and dosages..."
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about the patient..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          {patient ? 'Update Patient' : 'Add Patient'}
        </Button>
      </div>
    </form>
  )
}

// Patient Details Component
function PatientDetails({ patient }: { patient: Patient }) {
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            {patient.firstName} {patient.lastName}
          </h3>
          <p className="text-muted-foreground">Patient ID: {patient.id}</p>
        </div>
        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
        </Badge>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{patient.email}</span>
            </div>
            {patient.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.dateOfBirth && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {new Date(patient.dateOfBirth).toLocaleDateString()} 
                  ({calculateAge(patient.dateOfBirth)} years old)
                </span>
              </div>
            )}
            {patient.gender && (
              <div>
                <span className="text-sm text-muted-foreground">Gender: </span>
                <span className="capitalize">{patient.gender.replace('_', ' ')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.addressLine1 ? (
              <div className="space-y-1">
                <div>{patient.addressLine1}</div>
                {patient.addressLine2 && <div>{patient.addressLine2}</div>}
                <div>
                  {patient.city && `${patient.city}, `}
                  {patient.state && `${patient.state} `}
                  {patient.zipCode}
                </div>
                {patient.country && <div>{patient.country}</div>}
              </div>
            ) : (
              <p className="text-muted-foreground">No address on file</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contact */}
      {(patient.emergencyContactName || patient.emergencyContactPhone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patient.emergencyContactName && (
                <div>
                  <span className="text-sm text-muted-foreground">Name: </span>
                  <span>{patient.emergencyContactName}</span>
                </div>
              )}
              {patient.emergencyContactPhone && (
                <div>
                  <span className="text-sm text-muted-foreground">Phone: </span>
                  <span>{patient.emergencyContactPhone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Information */}
      <div className="grid grid-cols-1 gap-6">
        {patient.medicalConditions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Medical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{patient.medicalConditions}</p>
            </CardContent>
          </Card>
        )}

        {patient.allergies && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{patient.allergies}</p>
            </CardContent>
          </Card>
        )}

        {patient.currentMedications && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{patient.currentMedications}</p>
            </CardContent>
          </Card>
        )}

        {patient.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{patient.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timestamps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Created: {new Date(patient.createdAt).toLocaleString()}</span>
            <span>Last Updated: {new Date(patient.updatedAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
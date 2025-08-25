"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail,
  Shield,
  Heart,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity,
  Star,
  Building,
  Calendar,
  Ban
} from "lucide-react"
import { z } from "zod"
import axios from "axios"

// Schema matching your actual Prisma Guest model
const createGuestSchema = z.object({
  // Foreign Key for the required relation
  businessUnitId: z.string().uuid("Business Unit is required"),

  // Personal Information
  title: z.string().optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  
  // Identification
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  idNumber: z.string().optional(),
  idType: z.string().optional(),
  
  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  
  // Guest Status
  vipStatus: z.boolean().optional(),
  loyaltyNumber: z.string().optional(),
  preferences: z.any().optional(), // JSON field
  notes: z.string().optional(),
  firstStayDate: z.string().optional(),
  lastStayDate: z.string().optional(),
  blacklistedAt: z.string().optional(),
  totalSpent: z.number().min(0).optional(),
  
  // Marketing Preferences
  marketingOptIn: z.boolean().optional(),
  source: z.string().optional(),
});

type CreateGuestData = z.infer<typeof createGuestSchema>

interface BusinessUnit {
  id: string;
  name: string;
}

export default function NewGuestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [loadingBusinessUnits, setLoadingBusinessUnits] = useState(true)
  
  const [formData, setFormData] = useState<CreateGuestData>({
    businessUnitId: "",
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    idNumber: "",
    idType: "",
    address: "",
    city: "",
    state: "",
    country: "Philippines",
    postalCode: "",
    vipStatus: false,
    loyaltyNumber: "",
    preferences: {},
    notes: "",
    firstStayDate: "",
    lastStayDate: "",
    blacklistedAt: "",
    totalSpent: 0,
    marketingOptIn: false,
    source: "",
  })

  // Fetch business units on component mount
  useEffect(() => {
    const fetchBusinessUnits = async () => {
      try {
        const response = await axios.get('/api/business-units')
        setBusinessUnits(response.data)
      } catch (error) {
        console.error('Failed to fetch business units:', error)
        setErrors({ general: 'Failed to load business units' })
      } finally {
        setLoadingBusinessUnits(false)
      }
    }

    fetchBusinessUnits()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setCreateSuccess(false)
    setErrors({})
    
    try {
      const validatedData = createGuestSchema.parse(formData)
      
      // Use the correct API endpoint from your route
      const response = await axios.post('/api/admin/operations/guest', validatedData)
      
      setCreateSuccess(true)
      setTimeout(() => {
        router.push(`/admin/operations/guests/${response.data.id}`)
      }, 2000)
    } catch (error) {
      console.error('Failed to create guest:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.error || 'Failed to create guest' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getError = (field: string) => errors[field]

  if (loadingBusinessUnits) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading business units...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/admin/operations/guests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guests
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Add New Guest</span>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="border-0"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Guest
            </>
          )}
        </Button>
      </div>

      {/* Success Alert */}
      {createSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 font-medium">
            Guest created successfully! You will be redirected to the guest profile.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Please fix the following errors:</div>
            <ul className="space-y-1 text-sm">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Business Unit Selection */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <Building className="h-5 w-5 text-orange-600" />
                  </div>
                  Business Unit
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select the business unit for this guest
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessUnitId" className="text-sm font-medium">
                    Business Unit
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select 
                    value={formData.businessUnitId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, businessUnitId: value }))}
                  >
                    <SelectTrigger className={getError('businessUnitId') ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getError('businessUnitId') && (
                    <p className="text-sm text-destructive">{getError('businessUnitId')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  Personal Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Basic guest details and identification
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title
                    </Label>
                    <Select 
                      value={formData.title || undefined} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, title: value === "none" ? undefined : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Title</SelectItem>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                        <SelectItem value="Mrs.">Mrs.</SelectItem>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                        <SelectItem value="Prof.">Prof.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      className={getError('firstName') ? 'border-destructive' : ''}
                    />
                    {getError('firstName') && (
                      <p className="text-sm text-destructive">{getError('firstName')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      className={getError('lastName') ? 'border-destructive' : ''}
                    />
                    {getError('lastName') && (
                      <p className="text-sm text-destructive">{getError('lastName')}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-sm font-medium">
                      Nationality
                    </Label>
                    <Input
                      id="nationality"
                      value={formData.nationality || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                      placeholder="Filipino"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  Contact Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Email, phone, and address details
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@example.com"
                      className={getError('email') ? 'border-destructive' : ''}
                    />
                    {getError('email') && (
                      <p className="text-sm text-destructive">{getError('email')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Complete address..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Manila"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      value={formData.state || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Metro Manila"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={formData.country || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Philippines"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identification */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Shield className="h-5 w-5 text-amber-600" />
                  </div>
                  Identification
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  ID and passport information
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="idType" className="text-sm font-medium">
                      ID Type
                    </Label>
                    <Select 
                      value={formData.idType || undefined} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, idType: value === "none" ? undefined : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No ID</SelectItem>
                        <SelectItem value="DRIVERS_LICENSE">Driver&apos;s License</SelectItem>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                        <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                        <SelectItem value="SSS_ID">SSS ID</SelectItem>
                        <SelectItem value="PHILHEALTH_ID">PhilHealth ID</SelectItem>
                        <SelectItem value="VOTERS_ID">Voter&apos;s ID</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-sm font-medium">
                      ID Number
                    </Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                      placeholder="ID number"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber" className="text-sm font-medium">
                      Passport Number
                    </Label>
                    <Input
                      id="passportNumber"
                      value={formData.passportNumber || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                      placeholder="P1234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportExpiry" className="text-sm font-medium">
                      Passport Expiry
                    </Label>
                    <Input
                      id="passportExpiry"
                      type="date"
                      value={formData.passportExpiry || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, passportExpiry: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Preferences */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Heart className="h-5 w-5 text-purple-600" />
                  </div>
                  Guest Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Special preferences and requirements (stored as JSON)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="preferences" className="text-sm font-medium">
                    Preferences (JSON)
                  </Label>
                  <Textarea
                    id="preferences"
                    value={JSON.stringify(formData.preferences || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        setFormData(prev => ({ ...prev, preferences: parsed }))
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder='{"roomType": "ocean view", "bedType": "king", "floor": "high"}'
                    className="min-h-[120px] resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter preferences as valid JSON format
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guest Status */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <Star className="h-4 w-4 text-violet-600" />
                  </div>
                  Guest Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">VIP Status</Label>
                    <p className="text-xs text-muted-foreground">Mark as VIP guest</p>
                  </div>
                  <Switch 
                    checked={formData.vipStatus || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vipStatus: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loyaltyNumber" className="text-sm font-medium">
                    Loyalty Number
                  </Label>
                  <Input
                    id="loyaltyNumber"
                    value={formData.loyaltyNumber || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, loyaltyNumber: e.target.value }))}
                    placeholder="LOY123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalSpent" className="text-sm font-medium">
                    Total Spent
                  </Label>
                  <Input
                    id="totalSpent"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalSpent || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalSpent: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stay Information */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  Stay Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstStayDate" className="text-sm font-medium">
                    First Stay Date
                  </Label>
                  <Input
                    id="firstStayDate"
                    type="date"
                    value={formData.firstStayDate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstStayDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastStayDate" className="text-sm font-medium">
                    Last Stay Date
                  </Label>
                  <Input
                    id="lastStayDate"
                    type="date"
                    value={formData.lastStayDate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastStayDate: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Settings className="h-4 w-4 text-green-600" />
                  </div>
                  Marketing Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Marketing Opt-in</Label>
                    <p className="text-xs text-muted-foreground">Receive promotional offers</p>
                  </div>
                  <Switch 
                    checked={formData.marketingOptIn || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingOptIn: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source" className="text-sm font-medium">
                    Source
                  </Label>
                  <Input
                    id="source"
                    value={formData.source || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="Website, referral, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Blacklist Information */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                    <Ban className="h-4 w-4 text-red-600" />
                  </div>
                  Blacklist Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Only fill if guest is blacklisted
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blacklistedAt" className="text-sm font-medium">
                    Blacklisted Date
                  </Label>
                  <Input
                    id="blacklistedAt"
                    type="date"
                    value={formData.blacklistedAt || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, blacklistedAt: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Activity className="h-4 w-4 text-slate-600" />
                  </div>
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional guest information..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
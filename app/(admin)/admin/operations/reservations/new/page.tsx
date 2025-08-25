"use client"

import { useState, useEffect, useCallback } from "react"
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
  Calendar, 
  User,
  Building,
  Bed,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity,
  Users,
  DollarSign,
  Tag,
  Settings,
  Plus,
  X
} from "lucide-react"
import { z } from "zod"
import axios from "axios"
import { PaymentStatus, ReservationSource, ReservationStatus } from "@prisma/client"
import { BusinessUnit, Guest, Room, RoomAddon, RoomType_Model } from "@/types/reservation-types"




// Updated Zod schema to match backend API expectations
const createReservationSchema = z.object({
  businessUnitId: z.string().uuid("Please select a property"),
  guestId: z.string().uuid("Please select a guest"),
  roomTypeId: z.string().uuid("Please select a room type"),
  roomId: z.string().uuid().optional(),
  
  source: z.nativeEnum(ReservationSource).default(ReservationSource.DIRECT),
  status: z.nativeEnum(ReservationStatus).default(ReservationStatus.CONFIRMED),
  
  // Date fields
  checkInDate: z.string().min(1, "Check-in date is required"),
  checkOutDate: z.string().min(1, "Check-out date is required"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  nights: z.number().int().min(1),
  
  // Guest count
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  
  // Main reservation pricing
  subtotal: z.number().min(0),
  taxes: z.number().min(0).default(0),
  serviceFee: z.number().min(0).default(0),
  discounts: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  currency: z.string().default("PHP"),
  
  // Payment information
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paymentDue: z.string().optional(),
  depositRequired: z.number().min(0).optional(),
  depositPaid: z.number().min(0).default(0),
  
  // Room-specific pricing
  baseRate: z.number().min(0),
  discountedRate: z.number().min(0).optional(),
  extraPersonRate: z.number().min(0).default(0),
  childRate: z.number().min(0).default(0),
  roomSubtotal: z.number().min(0),
  extrasSubtotal: z.number().min(0).default(0),
  addonsSubtotal: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  
  // Notes and requests
  specialRequests: z.string().optional(),
  guestNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  
  // Booking metadata
  bookedBy: z.string().optional(),
  confirmationNumber: z.string().min(1),
  
  // Room preferences
  roomPreferences: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  roomSpecialRequests: z.string().optional(),
  
  // Room addons
  addons: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    unitPrice: z.number().min(0),
    quantity: z.number().int().min(1).default(1),
    totalAmount: z.number().min(0),
    isOptional: z.boolean().default(true),
    isChargeable: z.boolean().default(true)
  })).optional()
}).refine(
  (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
  {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"]
  }
)

type CreateReservationData = z.infer<typeof createReservationSchema>

export default function NewReservationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType_Model[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false)
  const [newAddon, setNewAddon] = useState<Partial<RoomAddon>>({
    name: "",
    description: "",
    category: "",
    unitPrice: 0,
    quantity: 1,
    isOptional: true,
    isChargeable: true
  })
  
  const [formData, setFormData] = useState<CreateReservationData>({
    businessUnitId: "",
    guestId: "",
    roomTypeId: "",
    roomId: undefined,
    source: ReservationSource.DIRECT,
    status: ReservationStatus.CONFIRMED,
    checkInDate: "",
    checkOutDate: "",
    checkInTime: undefined,
    checkOutTime: undefined,
    nights: 1,
    adults: 1,
    children: 0,
    infants: 0,
    subtotal: 0,
    taxes: 0,
    serviceFee: 0,
    discounts: 0,
    totalAmount: 0,
    currency: "PHP",
    paymentStatus: PaymentStatus.PENDING,
    paymentDue: undefined,
    depositRequired: undefined,
    depositPaid: 0,
    baseRate: 0,
    discountedRate: undefined,
    extraPersonRate: 0,
    childRate: 0,
    roomSubtotal: 0,
    extrasSubtotal: 0,
    addonsSubtotal: 0,
    discountAmount: 0,
    specialRequests: undefined,
    guestNotes: undefined,
    internalNotes: undefined,
    bookedBy: undefined,
    confirmationNumber: "",
    roomPreferences: undefined,
    roomSpecialRequests: undefined,
    addons: []
  })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [businessUnitsResponse, guestsResponse] = await Promise.all([
          axios.get('/api/business-units'),
          axios.get('/api/admin/operations/guest')
        ])
        
        setBusinessUnits(Array.isArray(businessUnitsResponse.data) ? businessUnitsResponse.data : [])
        setGuests(Array.isArray(guestsResponse.data) ? guestsResponse.data : [])
      } catch (error) {
        console.error('Failed to load data:', error)
        setBusinessUnits([])
        setGuests([])
      }
    }
    loadData()
  }, [])

  // Load rooms and room types when business unit changes
  useEffect(() => {
    if (formData.businessUnitId) {
      const loadRoomsAndTypes = async () => {
        setIsLoadingRoomTypes(true)
        
        try {
          const [roomsResponse, roomTypesResponse] = await Promise.all([
            axios.get(`/api/admin/operations/rooms?businessUnitId=${formData.businessUnitId}`),
            axios.get(`/api/admin/operations/room-types?businessUnitId=${formData.businessUnitId}`)
          ])
          
          // Handle the response structure - check if data is wrapped in a 'data' property
          const roomsData = roomsResponse.data?.data || roomsResponse.data || []
          const roomTypesData = roomTypesResponse.data?.data || roomTypesResponse.data || []
          
          setRooms(Array.isArray(roomsData) ? roomsData : [])
          setRoomTypes(Array.isArray(roomTypesData) ? roomTypesData : [])
          
        } catch (error) {
          console.error('Failed to load rooms and types:', error)
          if (axios.isAxiosError(error)) {
            console.error('Error details:', error.response?.data)
          }
          setRooms([])
          setRoomTypes([])
          
          setErrors(prev => ({
            ...prev,
            roomTypes: `Failed to load room types: ${error instanceof Error ? error.message : 'Unknown error'}`
          }))
        } finally {
          setIsLoadingRoomTypes(false)
        }
      }
      
      loadRoomsAndTypes()
    } else {
      setRooms([])
      setRoomTypes([])
      setIsLoadingRoomTypes(false)
      setErrors(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { roomTypes, ...rest } = prev
        return rest
      })
    }
  }, [formData.businessUnitId])

  // Memoize the confirmation number generation function
  const generateConfirmation = useCallback((businessUnitId: string, businessUnits: BusinessUnit[]) => {
    const prefix = businessUnits.find(bu => bu.id === businessUnitId)?.name.substring(0, 3).toUpperCase() || 'TWC'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }, [])

  // Auto-generate confirmation number
  useEffect(() => {
    if (!formData.confirmationNumber && formData.businessUnitId && businessUnits.length > 0) {
      setFormData(prev => ({
        ...prev,
        confirmationNumber: generateConfirmation(formData.businessUnitId, businessUnits)
      }))
    }
  }, [formData.businessUnitId, formData.confirmationNumber, businessUnits, generateConfirmation])

  // Calculate pricing when dates or room type changes
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate && formData.roomTypeId) {
      const checkIn = new Date(formData.checkInDate)
      const checkOut = new Date(formData.checkOutDate)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      
      const selectedRoomType = roomTypes.find(rt => rt.id === formData.roomTypeId)
      if (selectedRoomType) {
        const baseRate = Number(selectedRoomType.baseRate)
        const roomSubtotal = baseRate * nights
        
        // Calculate addon total
        const addonsTotal = formData.addons?.reduce((sum, addon) => sum + addon.totalAmount, 0) || 0
        
        const subtotal = roomSubtotal + formData.extrasSubtotal + addonsTotal - formData.discountAmount
        const taxes = subtotal * 0.12 // 12% tax
        const serviceFee = subtotal * 0.05 // 5% service fee
        const totalAmount = subtotal + taxes + serviceFee
        
        setFormData(prev => ({
          ...prev,
          nights,
          baseRate,
          roomSubtotal,
          addonsSubtotal: addonsTotal,
          subtotal,
          taxes,
          serviceFee,
          totalAmount
        }))
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.roomTypeId, formData.addons, formData.extrasSubtotal, formData.discountAmount, roomTypes])

  const handleAddAddon = () => {
    if (newAddon.name && newAddon.unitPrice !== undefined) {
      const totalAmount = newAddon.unitPrice * (newAddon.quantity || 1)
      const addon: RoomAddon = {
        name: newAddon.name,
        description: newAddon.description,
        category: newAddon.category,
        unitPrice: newAddon.unitPrice,
        quantity: newAddon.quantity || 1,
        totalAmount,
        isOptional: newAddon.isOptional ?? true,
        isChargeable: newAddon.isChargeable ?? true
      }
      
      setFormData(prev => ({
        ...prev,
        addons: [...(prev.addons || []), addon]
      }))
      
      // Reset new addon form
      setNewAddon({
        name: "",
        description: "",
        category: "",
        unitPrice: 0,
        quantity: 1,
        isOptional: true,
        isChargeable: true
      })
    }
  }

  const handleRemoveAddon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setCreateSuccess(false)
    setErrors({})
    
    try {
      const validatedData = createReservationSchema.parse(formData)
      
      const response = await axios.post('/api/admin/operations/reservations', validatedData)
      
      setCreateSuccess(true)
      setTimeout(() => {
        router.push(`/admin/operations/reservations/${response.data.id}`)
      }, 2000)
    } catch (error) {
      console.error('Failed to create reservation:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.error || 'Failed to create reservation' })
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getError = (field: string) => errors[field]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/admin/operations/reservations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reservations
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">New Reservation</span>
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
              Create Reservation
            </>
          )}
        </Button>
      </div>

      {/* Success Alert */}
      {createSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 font-medium">
            Reservation created successfully! You will be redirected to the reservation details.
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
            {/* Booking Details */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  Booking Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Basic reservation information and confirmation
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessUnitId" className="text-sm font-medium">
                    Property
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select 
                    value={formData.businessUnitId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, businessUnitId: value }))}
                  >
                    <SelectTrigger className={getError('businessUnitId') ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {unit.displayName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getError('businessUnitId') && (
                    <p className="text-sm text-destructive">{getError('businessUnitId')}</p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guestId" className="text-sm font-medium">
                      Guest
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.guestId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, guestId: value }))}
                    >
                      <SelectTrigger className={getError('guestId') ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {guests.map((guest) => (
                          <SelectItem key={guest.id} value={guest.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {guest.firstName} {guest.lastName}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getError('guestId') && (
                      <p className="text-sm text-destructive">{getError('guestId')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomTypeId" className="text-sm font-medium">
                      Room Type
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.roomTypeId} 
                      onValueChange={(value) => {
                        if (value && value !== "loading" && value !== "no-data" && value !== "no-business-unit") {
                          setFormData(prev => ({ ...prev, roomTypeId: value, roomId: undefined }))
                        }
                      }}
                      disabled={!formData.businessUnitId || isLoadingRoomTypes}
                    >
                      <SelectTrigger className={getError('roomTypeId') ? 'border-destructive' : ''}>
                        <SelectValue placeholder={
                          !formData.businessUnitId 
                            ? "Select a property first" 
                            : isLoadingRoomTypes 
                              ? "Loading room types..." 
                              : "Select room type"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {!formData.businessUnitId ? (
                          <SelectItem value="no-business-unit" disabled>
                            Select a property first
                          </SelectItem>
                        ) : isLoadingRoomTypes ? (
                          <SelectItem value="loading" disabled>
                            Loading room types...
                          </SelectItem>
                        ) : !Array.isArray(roomTypes) || roomTypes.length === 0 ? (
                          <SelectItem value="no-data" disabled>
                            No room types found for this property
                          </SelectItem>
                        ) : (
                          roomTypes.map((roomType) => (
                            <SelectItem key={roomType.id} value={roomType.id}>
                              <div className="flex items-center gap-2">
                                <Bed className="h-4 w-4" />
                                {roomType.displayName} - ₱{Number(roomType.baseRate).toLocaleString()}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {getError('roomTypeId') && (
                      <p className="text-sm text-destructive">{getError('roomTypeId')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomId" className="text-sm font-medium">
                    Specific Room (Optional)
                  </Label>
                  <Select 
                    value={formData.roomId || "none"} 
                    onValueChange={(value) => {
                      if (value === "none") {
                        setFormData(prev => ({ ...prev, roomId: undefined }))
                      } else if (value !== "no-rooms" && value !== "loading" && value !== "no-room-type") {
                        setFormData(prev => ({ ...prev, roomId: value }))
                      }
                    }}
                    disabled={!formData.roomTypeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specific room (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific room (assign later)</SelectItem>
                      {!formData.roomTypeId ? (
                        <SelectItem value="no-room-type" disabled>
                          Select a room type first
                        </SelectItem>
                      ) : Array.isArray(rooms) && rooms.filter(room => room.roomTypeId === formData.roomTypeId).length > 0 ? (
                        rooms
                          .filter(room => room.roomTypeId === formData.roomTypeId)
                          .map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Room {room.roomNumber}
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-rooms" disabled>
                          No rooms available for this room type
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmationNumber" className="text-sm font-medium">
                    Confirmation Number
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="confirmationNumber"
                    value={formData.confirmationNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmationNumber: e.target.value }))}
                    placeholder="TWC123456ABC"
                    className={getError('confirmationNumber') ? 'border-destructive' : ''}
                  />
                  {getError('confirmationNumber') && (
                    <p className="text-sm text-destructive">{getError('confirmationNumber')}</p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="source" className="text-sm font-medium">
                      Booking Source
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.source} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as ReservationSource }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ReservationSource.DIRECT}>Direct</SelectItem>
                        <SelectItem value={ReservationSource.ONLINE}>Online</SelectItem>
                        <SelectItem value={ReservationSource.PHONE}>Phone</SelectItem>
                        <SelectItem value={ReservationSource.WALK_IN}>Walk-in</SelectItem>
                        <SelectItem value={ReservationSource.AGENT}>Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Status
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ReservationStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ReservationStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={ReservationStatus.CONFIRMED}>Confirmed</SelectItem>
                        <SelectItem value={ReservationStatus.PROVISIONAL}>Provisional</SelectItem>
                        <SelectItem value={ReservationStatus.CHECKED_IN}>Checked In</SelectItem>
                        <SelectItem value={ReservationStatus.CHECKED_OUT}>Checked Out</SelectItem>
                        <SelectItem value={ReservationStatus.CANCELLED}>Cancelled</SelectItem>
                        <SelectItem value={ReservationStatus.NO_SHOW}>No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus" className="text-sm font-medium">
                      Payment Status
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.paymentStatus} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value as PaymentStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                        <SelectItem value={PaymentStatus.PARTIAL}>Partial</SelectItem>
                        <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                        <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stay Dates */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  Stay Dates & Guests
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Check-in and check-out dates with guest count
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkInDate" className="text-sm font-medium">
                      Check-in Date
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="checkInDate"
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                      className={getError('checkInDate') ? 'border-destructive' : ''}
                    />
                    {getError('checkInDate') && (
                      <p className="text-sm text-destructive">{getError('checkInDate')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutDate" className="text-sm font-medium">
                      Check-out Date
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="checkOutDate"
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                      className={getError('checkOutDate') ? 'border-destructive' : ''}
                    />
                    {getError('checkOutDate') && (
                      <p className="text-sm text-destructive">{getError('checkOutDate')}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime" className="text-sm font-medium">
                      Check-in Time (Optional)
                    </Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkInTime || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value || undefined }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime" className="text-sm font-medium">
                      Check-out Time (Optional)
                    </Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOutTime || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value || undefined }))}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="adults" className="text-sm font-medium">
                      Adults
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="adults"
                      type="number"
                      min="1"
                      value={formData.adults}
                      onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                      className={getError('adults') ? 'border-destructive' : ''}
                    />
                    {getError('adults') && (
                      <p className="text-sm text-destructive">{getError('adults')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="children" className="text-sm font-medium">
                      Children
                    </Label>
                    <Input
                      id="children"
                      type="number"
                      min="0"
                      value={formData.children}
                      onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infants" className="text-sm font-medium">
                      Infants
                    </Label>
                    <Input
                      id="infants"
                      type="number"
                      min="0"
                      value={formData.infants}
                      onChange={(e) => setFormData(prev => ({ ...prev, infants: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Calculated Nights</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                    <span className="text-sm text-muted-foreground">
                      {formData.nights} {formData.nights === 1 ? 'night' : 'nights'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Details */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  Pricing Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Room rates and additional charges breakdown
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Base Rate (per night)</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                      <span className="text-sm text-muted-foreground">
                        ₱{formData.baseRate.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountedRate" className="text-sm font-medium">
                      Discounted Rate (Optional)
                    </Label>
                    <Input
                      id="discountedRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountedRate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountedRate: parseFloat(e.target.value) || undefined }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="extraPersonRate" className="text-sm font-medium">
                      Extra Person Rate
                    </Label>
                    <Input
                      id="extraPersonRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.extraPersonRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, extraPersonRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childRate" className="text-sm font-medium">
                      Child Rate
                    </Label>
                    <Input
                      id="childRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.childRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, childRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Room Subtotal</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                        <span className="text-sm text-muted-foreground">
                          ₱{formData.roomSubtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extrasSubtotal" className="text-sm font-medium">
                        Extras Subtotal
                      </Label>
                      <Input
                        id="extrasSubtotal"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.extrasSubtotal}
                        onChange={(e) => setFormData(prev => ({ ...prev, extrasSubtotal: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Addons Subtotal</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                        <span className="text-sm text-muted-foreground">
                          ₱{formData.addonsSubtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountAmount" className="text-sm font-medium">
                        Discount Amount
                      </Label>
                      <Input
                        id="discountAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discountAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Subtotal</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                      <span className="text-sm text-muted-foreground">
                        ₱{formData.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Taxes (12%)</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                      <span className="text-sm text-muted-foreground">
                        ₱{formData.taxes.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Service Fee (5%)</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                      <span className="text-sm text-muted-foreground">
                        ₱{formData.serviceFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <div className="flex items-center h-12 px-3 rounded-md border-2 bg-emerald-50 border-emerald-200">
                    <span className="text-lg font-bold text-emerald-700">
                      ₱{formData.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Addons */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <Tag className="h-5 w-5 text-orange-600" />
                  </div>
                  Room Addons
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Additional services and amenities
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Addons List */}
                {formData.addons && formData.addons.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Current Addons</Label>
                    {formData.addons.map((addon, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{addon.name}</span>
                            {addon.category && (
                              <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">{addon.category}</span>
                            )}
                          </div>
                          {addon.description && (
                            <p className="text-sm text-muted-foreground">{addon.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>₱{addon.unitPrice.toLocaleString()} × {addon.quantity}</span>
                            <span className="font-medium">₱{addon.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAddon(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Addon Form */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium">Add New Addon</Label>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="addonName" className="text-sm font-medium">
                        Name *
                      </Label>
                      <Input
                        id="addonName"
                        value={newAddon.name || ""}
                        onChange={(e) => setNewAddon(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Airport Transfer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addonCategory" className="text-sm font-medium">
                        Category
                      </Label>
                      <Input
                        id="addonCategory"
                        value={newAddon.category || ""}
                        onChange={(e) => setNewAddon(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Transportation"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addonDescription" className="text-sm font-medium">
                      Description
                    </Label>
                    <Input
                      id="addonDescription"
                      value={newAddon.description || ""}
                      onChange={(e) => setNewAddon(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the addon"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="addonUnitPrice" className="text-sm font-medium">
                        Unit Price *
                      </Label>
                      <Input
                        id="addonUnitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newAddon.unitPrice || ''}
                        onChange={(e) => setNewAddon(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addonQuantity" className="text-sm font-medium">
                        Quantity *
                      </Label>
                      <Input
                        id="addonQuantity"
                        type="number"
                        min="1"
                        value={newAddon.quantity || 1}
                        onChange={(e) => setNewAddon(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Total</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                        <span className="text-sm text-muted-foreground">
                          ₱{((newAddon.unitPrice || 0) * (newAddon.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="addonOptional"
                        checked={newAddon.isOptional ?? true}
                        onCheckedChange={(checked) => setNewAddon(prev => ({ ...prev, isOptional: checked }))}
                      />
                      <Label htmlFor="addonOptional" className="text-sm">Optional</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="addonChargeable"
                        checked={newAddon.isChargeable ?? true}
                        onCheckedChange={(checked) => setNewAddon(prev => ({ ...prev, isChargeable: checked }))}
                      />
                      <Label htmlFor="addonChargeable" className="text-sm">Chargeable</Label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddAddon}
                    disabled={!newAddon.name || !newAddon.unitPrice}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Addon
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guest Requests & Notes */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  Guest Requests & Notes
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Special requests and additional information
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="specialRequests" className="text-sm font-medium">
                    Special Requests
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value || undefined }))}
                    placeholder="Any special requests from the guest..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomSpecialRequests" className="text-sm font-medium">
                    Room-Specific Requests
                  </Label>
                  <Textarea
                    id="roomSpecialRequests"
                    value={formData.roomSpecialRequests || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomSpecialRequests: e.target.value || undefined }))}
                    placeholder="Room-specific requests (high floor, ocean view, etc.)..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestNotes" className="text-sm font-medium">
                    Guest Notes
                  </Label>
                  <Textarea
                    id="guestNotes"
                    value={formData.guestNotes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestNotes: e.target.value || undefined }))}
                    placeholder="Additional notes about the guest..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internalNotes" className="text-sm font-medium">
                    Internal Notes
                  </Label>
                  <Textarea
                    id="internalNotes"
                    value={formData.internalNotes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value || undefined }))}
                    placeholder="Internal staff notes..."
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentDue" className="text-sm font-medium">
                    Payment Due Date
                  </Label>
                  <Input
                    id="paymentDue"
                    type="date"
                    value={formData.paymentDue || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDue: e.target.value || undefined }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositRequired" className="text-sm font-medium">
                    Deposit Required
                  </Label>
                  <Input
                    id="depositRequired"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.depositRequired || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, depositRequired: parseFloat(e.target.value) || undefined }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositPaid" className="text-sm font-medium">
                    Deposit Paid
                  </Label>
                  <Input
                    id="depositPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.depositPaid}
                    onChange={(e) => setFormData(prev => ({ ...prev, depositPaid: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <Activity className="h-4 w-4 text-violet-600" />
                  </div>
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bookedBy" className="text-sm font-medium">
                    Booked By
                  </Label>
                  <Input
                    id="bookedBy"
                    value={formData.bookedBy || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, bookedBy: e.target.value || undefined }))}
                    placeholder="Staff member or agent name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency
                  </Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Room Preferences */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <Settings className="h-4 w-4 text-indigo-600" />
                  </div>
                  Room Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preferences (JSON)</Label>
                  <Textarea
                    value={formData.roomPreferences ? JSON.stringify(formData.roomPreferences, null, 2) : ""}
                    onChange={(e) => {
                      try {
                        const parsed = e.target.value ? JSON.parse(e.target.value) : undefined
                        setFormData(prev => ({ ...prev, roomPreferences: parsed }))
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder='{"view": "ocean", "floor": "high", "bedType": "king"}'
                    className="min-h-[100px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter room preferences as JSON. Example: {"{"}&quot;view&quot;: &quot;ocean&quot;, &quot;floor&quot;: &quot;high&quot;{"}"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
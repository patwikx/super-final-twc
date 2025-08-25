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
import { 
  Save, 
  ArrowLeft, 
  Bed, 
  Settings,
  AlertCircle
} from "lucide-react"
import { RoomStatus, HousekeepingStatus, RoomType_Model } from "@prisma/client"
import { z } from "zod"
import axios from "axios"

// Zod schema for validation
const createRoomSchema = z.object({
  businessUnitId: z.string().uuid(),
  roomTypeId: z.string().uuid("Please select a room type"),
  roomNumber: z.string().min(1, "Room number is required"),
  floor: z.number().int().optional(),
  wing: z.string().optional(),
  status: z.nativeEnum(RoomStatus).default('AVAILABLE'),
  housekeeping: z.nativeEnum(HousekeepingStatus).default('CLEAN'),
  notes: z.string().optional(),
  specialFeatures: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
})

type CreateRoomData = z.infer<typeof createRoomSchema>

interface NewRoomPageProps {
  params: Promise<{ slug: string }>
}

export default function NewRoomPage({ params }: NewRoomPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [businessUnitId, setBusinessUnitId] = useState("")
  const [roomTypes, setRoomTypes] = useState<RoomType_Model[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CreateRoomData>({
    businessUnitId: "",
    roomTypeId: "",
    roomNumber: "",
    floor: 1,
    wing: "",
    status: "AVAILABLE",
    housekeeping: "CLEAN",
    notes: "",
    specialFeatures: [],
    isActive: true
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const { slug } = await params
        
        // Get property details
        const propertyResponse = await axios.get(`/api/properties/${slug}`)
        const property = propertyResponse.data
        setBusinessUnitId(property.id)
        
        // Get room types for this property
        const roomTypesResponse = await axios.get(`/api/properties/${slug}/room-types`)
        setRoomTypes(roomTypesResponse.data)
        
        setFormData(prev => ({ ...prev, businessUnitId: property.id }))
      } catch (error) {
        console.error('Failed to load data:', error)
        router.back()
      }
    }
    loadData()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    
    try {
      const validatedData = createRoomSchema.parse(formData)
      const { slug } = await params
      
      const response = await axios.post(`/api/properties/${slug}/rooms`, validatedData)
      
      if (response.status === 201) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to create room:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.error || 'Failed to create room' })
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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Add New Room</h1>
            <p className="text-slate-600 mt-1">Create a new room for this property</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Room
            </>
          )}
        </Button>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-amber-600" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber" className="text-sm font-semibold text-slate-700">
                      Room Number *
                    </Label>
                    <Input
                      id="roomNumber"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      placeholder="101"
                      className={`h-12 ${getError('roomNumber') ? 'border-red-500' : ''}`}
                    />
                    {getError('roomNumber') && (
                      <p className="text-sm text-red-600">{getError('roomNumber')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomTypeId" className="text-sm font-semibold text-slate-700">
                      Room Type *
                    </Label>
                    <Select 
                      value={formData.roomTypeId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, roomTypeId: value }))}
                    >
                      <SelectTrigger className={`h-12 ${getError('roomTypeId') ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getError('roomTypeId') && (
                      <p className="text-sm text-red-600">{getError('roomTypeId')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-sm font-semibold text-slate-700">
                      Floor
                    </Label>
                    <Input
                      id="floor"
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) || 0 }))}
                      placeholder="1"
                      className="h-12"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wing" className="text-sm font-semibold text-slate-700">
                      Wing/Building
                    </Label>
                    <Input
                      id="wing"
                      value={formData.wing}
                      onChange={(e) => setFormData(prev => ({ ...prev, wing: e.target.value }))}
                      placeholder="North Wing"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special notes about this room..."
                    className="h-24"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Status Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Initial Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Room Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as RoomStatus }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="OCCUPIED">Occupied</SelectItem>
                      <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Housekeeping Status</Label>
                  <Select 
                    value={formData.housekeeping} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, housekeeping: value as HousekeepingStatus }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLEAN">Clean</SelectItem>
                      <SelectItem value="DIRTY">Dirty</SelectItem>
                      <SelectItem value="INSPECTED">Inspected</SelectItem>
                      <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Active</Label>
                    <p className="text-xs text-slate-500">Room is operational</p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
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
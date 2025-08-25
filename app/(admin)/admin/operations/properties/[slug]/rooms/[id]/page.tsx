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
  Wrench,
  AlertCircle,
  Trash2
} from "lucide-react"
import { Room, RoomStatus, HousekeepingStatus, RoomType_Model } from "@prisma/client"
import { z } from "zod"
import axios from "axios"

// Zod schema for validation
const updateRoomSchema = z.object({
  roomTypeId: z.string().uuid().optional(),
  roomNumber: z.string().min(1, "Room number is required").optional(),
  floor: z.number().int().optional(),
  wing: z.string().optional(),
  status: z.nativeEnum(RoomStatus).optional(),
  housekeeping: z.nativeEnum(HousekeepingStatus).optional(),
  lastCleaned: z.string().datetime().optional().nullable(),
  lastInspected: z.string().datetime().optional().nullable(),
  lastMaintenance: z.string().datetime().optional().nullable(),
  outOfOrderUntil: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
  specialFeatures: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

type UpdateRoomData = z.infer<typeof updateRoomSchema>

interface EditRoomPageProps {
  params: Promise<{ slug: string; id: string }>
}

export default function EditRoomPage({ params }: EditRoomPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType_Model[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<UpdateRoomData>({
    roomTypeId: "",
    roomNumber: "",
    floor: 0,
    wing: "",
    status: "AVAILABLE",
    housekeeping: "CLEAN",
    lastCleaned: "",
    lastInspected: "",
    lastMaintenance: "",
    outOfOrderUntil: "",
    notes: "",
    specialFeatures: [],
    isActive: true
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const { slug, id } = await params
        
        // Load room data and room types in parallel
        const [roomResponse, roomTypesResponse] = await Promise.all([
          axios.get(`/api/properties/${slug}/rooms/${id}`),
          axios.get(`/api/properties/${slug}/room-types`)
        ])
        
        const roomData = roomResponse.data
        setRoom(roomData)
        setRoomTypes(roomTypesResponse.data)
        
        setFormData({
          roomTypeId: roomData.roomTypeId || "",
          roomNumber: roomData.roomNumber || "",
          floor: roomData.floor || 0,
          wing: roomData.wing || "",
          status: roomData.status,
          housekeeping: roomData.housekeeping,
          lastCleaned: roomData.lastCleaned ? new Date(roomData.lastCleaned).toISOString().split('T')[0] : "",
          lastInspected: roomData.lastInspected ? new Date(roomData.lastInspected).toISOString().split('T')[0] : "",
          lastMaintenance: roomData.lastMaintenance ? new Date(roomData.lastMaintenance).toISOString().split('T')[0] : "",
          outOfOrderUntil: roomData.outOfOrderUntil ? new Date(roomData.outOfOrderUntil).toISOString().split('T')[0] : "",
          notes: roomData.notes || "",
          specialFeatures: roomData.specialFeatures || [],
          isActive: roomData.isActive ?? true
        })
      } catch (error) {
        console.error('Failed to load room data:', error)
        router.back()
      }
    }
    loadData()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!room) return
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const validatedData = updateRoomSchema.parse(formData)
      const { slug, id } = await params
      
      const response = await axios.patch(`/api/properties/${slug}/rooms/${id}`, validatedData)
      
      if (response.status === 200) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to update room:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.error || 'Failed to update room' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!room || !confirm('Are you sure you want to delete this room?')) return
    
    setIsLoading(true)
    try {
      const { slug, id } = await params
      await axios.delete(`/api/properties/${slug}/rooms/${id}`)
      router.back()
    } catch (error) {
      console.error('Failed to delete room:', error)
      setIsLoading(false)
    }
  }

  const getError = (field: string) => errors[field]

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Room {room.roomNumber}</h1>
            <p className="text-slate-600 mt-1">Update room details and status</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
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
                      value={formData.roomNumber || ""}
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
                      value={formData.roomTypeId || ""} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, roomTypeId: value }))}
                    >
                      <SelectTrigger className="h-12">
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
                      value={formData.floor || 0}
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
                      value={formData.wing || ""}
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
                    value={formData.notes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special notes about this room..."
                    className="h-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Maintenance History */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-amber-600" />
                  Maintenance & Cleaning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="lastCleaned" className="text-sm font-semibold text-slate-700">
                      Last Cleaned
                    </Label>
                    <Input
                      id="lastCleaned"
                      type="date"
                      value={formData.lastCleaned || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastCleaned: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastInspected" className="text-sm font-semibold text-slate-700">
                      Last Inspected
                    </Label>
                    <Input
                      id="lastInspected"
                      type="date"
                      value={formData.lastInspected || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastInspected: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="lastMaintenance" className="text-sm font-semibold text-slate-700">
                      Last Maintenance
                    </Label>
                    <Input
                      id="lastMaintenance"
                      type="date"
                      value={formData.lastMaintenance || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outOfOrderUntil" className="text-sm font-semibold text-slate-700">
                      Out of Order Until
                    </Label>
                    <Input
                      id="outOfOrderUntil"
                      type="date"
                      value={formData.outOfOrderUntil || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, outOfOrderUntil: e.target.value }))}
                      className="h-12"
                    />
                  </div>
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
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Room Status</Label>
                  <Select 
                    value={formData.status || "AVAILABLE"} 
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
                    value={formData.housekeeping || "CLEAN"} 
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
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    housekeeping: "CLEAN",
                    lastCleaned: new Date().toISOString().split('T')[0]
                  }))}
                >
                  Mark as Cleaned
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    housekeeping: "INSPECTED",
                    lastInspected: new Date().toISOString().split('T')[0]
                  }))}
                >
                  Mark as Inspected
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    status: "MAINTENANCE",
                    lastMaintenance: new Date().toISOString().split('T')[0]
                  }))}
                >
                  Schedule Maintenance
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
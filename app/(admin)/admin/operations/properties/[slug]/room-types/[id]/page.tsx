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
  DollarSign,
  Image as ImageIcon,
  Trash2,
  AlertCircle
} from "lucide-react"
import { RoomType, RoomType_Model } from "@prisma/client"
import { z } from "zod"
import axios from "axios"

// Zod schema for validation
const updateRoomTypeSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Name must be lowercase letters, numbers, and hyphens only")
    .optional(),
  displayName: z.string()
    .min(1, "Display name is required")
    .max(200, "Display name must be less than 200 characters")
    .optional(),
  type: z.nativeEnum(RoomType).optional(),
  baseRate: z.number()
    .min(0.01, "Base rate must be greater than 0")
    .max(999999.99, "Base rate is too high")
    .optional(),
  description: z.string().optional(),
  maxOccupancy: z.number()
    .int("Max occupancy must be a whole number")
    .min(1, "Max occupancy must be at least 1")
    .max(20, "Max occupancy cannot exceed 20")
    .optional(),
  maxAdults: z.number()
    .int("Max adults must be a whole number")
    .min(1, "Max adults must be at least 1")
    .max(20, "Max adults cannot exceed 20")
    .optional(),
  maxChildren: z.number()
    .int("Max children must be a whole number")
    .min(0, "Max children cannot be negative")
    .max(20, "Max children cannot exceed 20")
    .optional(),
  maxInfants: z.number()
    .int("Max infants must be a whole number")
    .min(0, "Max infants cannot be negative")
    .max(10, "Max infants cannot exceed 10")
    .optional(),
  bedConfiguration: z.string().optional(),
  roomSize: z.number()
    .min(0, "Room size cannot be negative")
    .max(10000, "Room size is too large")
    .optional(),
  hasBalcony: z.boolean().optional(),
  hasOceanView: z.boolean().optional(),
  hasPoolView: z.boolean().optional(),
  hasKitchenette: z.boolean().optional(),
  hasLivingArea: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  isAccessible: z.boolean().optional(),
  extraPersonRate: z.number()
    .min(0, "Extra person rate cannot be negative")
    .max(999999.99, "Extra person rate is too high")
    .optional(),
  extraChildRate: z.number()
    .min(0, "Extra child rate cannot be negative")
    .max(999999.99, "Extra child rate is too high")
    .optional(),
  primaryImage: z.string().url("Invalid image URL").optional().or(z.literal("")),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  floorPlan: z.string().url("Invalid floor plan URL").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int("Sort order must be a whole number").min(0).optional()
}).refine(
  (data) => !data.maxOccupancy || !data.maxAdults || !data.maxChildren || data.maxOccupancy >= data.maxAdults + data.maxChildren,
  {
    message: "Max occupancy must be at least the sum of max adults and max children",
    path: ["maxOccupancy"]
  }
)

type UpdateRoomTypeData = z.infer<typeof updateRoomTypeSchema>

interface EditRoomTypePageProps {
  params: Promise<{ slug: string; id: string }>
}

export default function EditRoomTypePage({ params }: EditRoomTypePageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [roomType, setRoomType] = useState<RoomType_Model | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<UpdateRoomTypeData>({
    name: "",
    displayName: "",
    type: "STANDARD",
    baseRate: 0,
    description: "",
    maxOccupancy: 2,
    maxAdults: 2,
    maxChildren: 0,
    maxInfants: 0,
    bedConfiguration: "",
    roomSize: 0,
    hasBalcony: false,
    hasOceanView: false,
    hasPoolView: false,
    hasKitchenette: false,
    hasLivingArea: false,
    smokingAllowed: false,
    petFriendly: false,
    isAccessible: false,
    extraPersonRate: 0,
    extraChildRate: 0,
    primaryImage: "",
    images: [],
    floorPlan: "",
    isActive: true,
    sortOrder: 0
  })

  useEffect(() => {
    const loadRoomType = async () => {
      try {
        const { slug, id } = await params
        const response = await axios.get(`/api/properties/${slug}/room-types/${id}`)
        const roomTypeData = response.data
        setRoomType(roomTypeData)
        setFormData({
          name: roomTypeData.name,
          displayName: roomTypeData.displayName,
          type: roomTypeData.type,
          baseRate: Number(roomTypeData.baseRate),
          description: roomTypeData.description || "",
          maxOccupancy: roomTypeData.maxOccupancy || 2,
          maxAdults: roomTypeData.maxAdults || 2,
          maxChildren: roomTypeData.maxChildren || 0,
          maxInfants: roomTypeData.maxInfants || 0,
          bedConfiguration: roomTypeData.bedConfiguration || "",
          roomSize: roomTypeData.roomSize ? Number(roomTypeData.roomSize) : 0,
          hasBalcony: roomTypeData.hasBalcony || false,
          hasOceanView: roomTypeData.hasOceanView || false,
          hasPoolView: roomTypeData.hasPoolView || false,
          hasKitchenette: roomTypeData.hasKitchenette || false,
          hasLivingArea: roomTypeData.hasLivingArea || false,
          smokingAllowed: roomTypeData.smokingAllowed || false,
          petFriendly: roomTypeData.petFriendly || false,
          isAccessible: roomTypeData.isAccessible || false,
          extraPersonRate: Number(roomTypeData.extraPersonRate) || 0,
          extraChildRate: Number(roomTypeData.extraChildRate) || 0,
          primaryImage: roomTypeData.primaryImage || "",
          images: roomTypeData.images || [],
          floorPlan: roomTypeData.floorPlan || "",
          isActive: roomTypeData.isActive,
          sortOrder: roomTypeData.sortOrder || 0
        })
      } catch (error) {
        console.error('Failed to load room type:', error)
        router.back()
      }
    }
    loadRoomType()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomType) return
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const validatedData = updateRoomTypeSchema.parse(formData)
      const { slug, id } = await params
      
      const response = await axios.patch(`/api/properties/${slug}/room-types/${id}`, validatedData)
      
      if (response.status === 200) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to update room type:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.error || 'Failed to update room type' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!roomType || !confirm('Are you sure you want to delete this room type?')) return
    
    setIsLoading(true)
    try {
      const { slug, id } = await params
      await axios.delete(`/api/properties/${slug}/room-types/${id}`)
      router.back()
    } catch (error) {
      console.error('Failed to delete room type:', error)
      setIsLoading(false)
    }
  }

  const getError = (field: string) => errors[field]

  if (!roomType) {
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
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Edit Room Type</h1>
            <p className="text-slate-600 mt-1">Update room type details and configuration</p>
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
                  Room Type Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      Internal Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="deluxe-king"
                      className={`h-12 ${getError('name') ? 'border-red-500' : ''}`}
                    />
                    {getError('name') && (
                      <p className="text-sm text-red-600">{getError('name')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-semibold text-slate-700">
                      Display Name *
                    </Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Deluxe King Room"
                      className={`h-12 ${getError('displayName') ? 'border-red-500' : ''}`}
                    />
                    {getError('displayName') && (
                      <p className="text-sm text-red-600">{getError('displayName')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-semibold text-slate-700">
                      Room Category *
                    </Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as RoomType }))}
                    >
                      <SelectTrigger className={`h-12 ${getError('type') ? 'border-red-500' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="DELUXE">Deluxe</SelectItem>
                        <SelectItem value="SUITE">Suite</SelectItem>
                        <SelectItem value="VILLA">Villa</SelectItem>
                        <SelectItem value="PENTHOUSE">Penthouse</SelectItem>
                        <SelectItem value="FAMILY">Family</SelectItem>
                        <SelectItem value="ACCESSIBLE">Accessible</SelectItem>
                      </SelectContent>
                    </Select>
                    {getError('type') && (
                      <p className="text-sm text-red-600">{getError('type')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseRate" className="text-sm font-semibold text-slate-700">
                      Base Rate (₱) *
                    </Label>
                    <Input
                      id="baseRate"
                      type="number"
                      value={formData.baseRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="5000"
                      className={`h-12 ${getError('baseRate') ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                    />
                    {getError('baseRate') && (
                      <p className="text-sm text-red-600">{getError('baseRate')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the room type..."
                    className={`h-24 ${getError('description') ? 'border-red-500' : ''}`}
                  />
                  {getError('description') && (
                    <p className="text-sm text-red-600">{getError('description')}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedConfiguration" className="text-sm font-semibold text-slate-700">
                      Bed Configuration
                    </Label>
                    <Input
                      id="bedConfiguration"
                      value={formData.bedConfiguration}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedConfiguration: e.target.value }))}
                      placeholder="1 King Bed"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomSize" className="text-sm font-semibold text-slate-700">
                      Room Size (sqm)
                    </Label>
                    <Input
                      id="roomSize"
                      type="number"
                      value={formData.roomSize || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomSize: parseFloat(e.target.value) || 0 }))}
                      placeholder="35"
                      className={`h-12 ${getError('roomSize') ? 'border-red-500' : ''}`}
                      min="0"
                    />
                    {getError('roomSize') && (
                      <p className="text-sm text-red-600">{getError('roomSize')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxOccupancy" className="text-sm font-semibold text-slate-700">
                      Max Occupancy *
                    </Label>
                    <Input
                      id="maxOccupancy"
                      type="number"
                      value={formData.maxOccupancy}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxOccupancy: parseInt(e.target.value) || 0 }))}
                      placeholder="2"
                      className={`h-12 ${getError('maxOccupancy') ? 'border-red-500' : ''}`}
                      min="1"
                    />
                    {getError('maxOccupancy') && (
                      <p className="text-sm text-red-600">{getError('maxOccupancy')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxAdults" className="text-sm font-semibold text-slate-700">
                      Max Adults *
                    </Label>
                    <Input
                      id="maxAdults"
                      type="number"
                      value={formData.maxAdults}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAdults: parseInt(e.target.value) || 0 }))}
                      placeholder="2"
                      className={`h-12 ${getError('maxAdults') ? 'border-red-500' : ''}`}
                      min="1"
                    />
                    {getError('maxAdults') && (
                      <p className="text-sm text-red-600">{getError('maxAdults')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxChildren" className="text-sm font-semibold text-slate-700">
                      Max Children
                    </Label>
                    <Input
                      id="maxChildren"
                      type="number"
                      value={formData.maxChildren}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxChildren: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className={`h-12 ${getError('maxChildren') ? 'border-red-500' : ''}`}
                      min="0"
                    />
                    {getError('maxChildren') && (
                      <p className="text-sm text-red-600">{getError('maxChildren')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxInfants" className="text-sm font-semibold text-slate-700">
                      Max Infants
                    </Label>
                    <Input
                      id="maxInfants"
                      type="number"
                      value={formData.maxInfants}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxInfants: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className={`h-12 ${getError('maxInfants') ? 'border-red-500' : ''}`}
                      min="0"
                    />
                    {getError('maxInfants') && (
                      <p className="text-sm text-red-600">{getError('maxInfants')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Features */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Room Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Private Balcony</Label>
                      <p className="text-xs text-slate-500">Outdoor space with seating</p>
                    </div>
                    <Switch 
                      checked={formData.hasBalcony}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasBalcony: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Ocean View</Label>
                      <p className="text-xs text-slate-500">Direct ocean views</p>
                    </div>
                    <Switch 
                      checked={formData.hasOceanView}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasOceanView: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Pool View</Label>
                      <p className="text-xs text-slate-500">Overlooks pool area</p>
                    </div>
                    <Switch 
                      checked={formData.hasPoolView}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasPoolView: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Kitchenette</Label>
                      <p className="text-xs text-slate-500">Basic cooking facilities</p>
                    </div>
                    <Switch 
                      checked={formData.hasKitchenette}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasKitchenette: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Living Area</Label>
                      <p className="text-xs text-slate-500">Separate seating area</p>
                    </div>
                    <Switch 
                      checked={formData.hasLivingArea}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasLivingArea: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Smoking Allowed</Label>
                      <p className="text-xs text-slate-500">Smoking permitted</p>
                    </div>
                    <Switch 
                      checked={formData.smokingAllowed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smokingAllowed: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Pet Friendly</Label>
                      <p className="text-xs text-slate-500">Pets welcome</p>
                    </div>
                    <Switch 
                      checked={formData.petFriendly}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, petFriendly: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Accessible</Label>
                      <p className="text-xs text-slate-500">ADA compliant</p>
                    </div>
                    <Switch 
                      checked={formData.isAccessible}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAccessible: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Pricing Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Extra Person Rate (₱)</Label>
                  <Input
                    type="number"
                    value={formData.extraPersonRate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, extraPersonRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="1000"
                    className={`h-12 ${getError('extraPersonRate') ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.01"
                  />
                  {getError('extraPersonRate') && (
                    <p className="text-sm text-red-600">{getError('extraPersonRate')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Extra Child Rate (₱)</Label>
                  <Input
                    type="number"
                    value={formData.extraChildRate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, extraChildRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="500"
                    className={`h-12 ${getError('extraChildRate') ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.01"
                  />
                  {getError('extraChildRate') && (
                    <p className="text-sm text-red-600">{getError('extraChildRate')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Active</Label>
                    <p className="text-xs text-slate-500">Available for booking</p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className={`h-12 ${getError('sortOrder') ? 'border-red-500' : ''}`}
                    min="0"
                  />
                  {getError('sortOrder') && (
                    <p className="text-sm text-red-600">{getError('sortOrder')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-5 w-5 text-amber-600" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Primary Image URL</Label>
                  <Input
                    value={formData.primaryImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className={`h-12 ${getError('primaryImage') ? 'border-red-500' : ''}`}
                  />
                  {getError('primaryImage') && (
                    <p className="text-sm text-red-600">{getError('primaryImage')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Floor Plan URL</Label>
                  <Input
                    value={formData.floorPlan}
                    onChange={(e) => setFormData(prev => ({ ...prev, floorPlan: e.target.value }))}
                    placeholder="https://example.com/floorplan.jpg"
                    className={`h-12 ${getError('floorPlan') ? 'border-red-500' : ''}`}
                  />
                  {getError('floorPlan') && (
                    <p className="text-sm text-red-600">{getError('floorPlan')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
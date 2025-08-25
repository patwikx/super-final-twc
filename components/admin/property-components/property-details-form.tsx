"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Save, 
  Building, 
  MapPin, 
  Palette,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  Globe,
  CheckCircle,
  Loader2,
  Upload,
  Eye,
  EyeOff,
  Star,
  Activity,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { BusinessUnit, PropertyType, Image } from "@prisma/client"
import { z } from "zod"
import axios from "axios"

// Extended types for the component
type BusinessUnitWithImages = BusinessUnit & {
  images: Array<{
    id: string
    imageId: string
    context: string | null
    sortOrder: number
    isPrimary: boolean
    image: Image
  }>
}

// Zod schema for validation (removed heroImage)
const updatePropertySchema = z.object({
  name: z.string().min(1, "Internal name is required").optional(),
  displayName: z.string().min(1, "Display name is required").optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  city: z.string().min(1, "City is required").optional(),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be a valid URL slug").optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  primaryCurrency: z.string().optional(),
  secondaryCurrency: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  serviceFeeRate: z.number().min(0).max(1).optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  cancellationHours: z.number().min(0).max(168).optional(),
  maxAdvanceBooking: z.number().min(1).max(730).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  isActive: z.boolean().optional(),
})

type UpdatePropertyData = z.infer<typeof updatePropertySchema>

interface PropertyDetailsFormProps {
  property: BusinessUnitWithImages
}

export function PropertyDetailsForm({ property }: PropertyDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [images, setImages] = useState(property.images || [])
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  // Helper functions for percentage conversion
  const toPercentage = (decimal: number | null | undefined): string => {
    if (decimal === null || decimal === undefined) return ""
    return (decimal * 100).toString()
  }
  
  const toDecimal = (percentage: string): number | undefined => {
    const num = parseFloat(percentage)
    if (isNaN(num)) return undefined
    return num / 100
  }
  
  const [formData, setFormData] = useState<UpdatePropertyData>({
    displayName: property.displayName,
    name: property.name,
    slug: property.slug,
    propertyType: property.propertyType as PropertyType,
    description: property.description || "",
    shortDescription: property.shortDescription || "",
    longDescription: property.longDescription || "",
    address: property.address || "",
    city: property.city,
    state: property.state || "",
    country: property.country,
    postalCode: property.postalCode || "",
    phone: property.phone || "",
    email: property.email || "",
    website: property.website || "",
    latitude: property.latitude ? Number(property.latitude) : undefined,
    longitude: property.longitude ? Number(property.longitude) : undefined,
    primaryCurrency: property.primaryCurrency,
    secondaryCurrency: property.secondaryCurrency || "",
    timezone: property.timezone,
    locale: property.locale,
    taxRate: property.taxRate ? Number(property.taxRate) : undefined,
    serviceFeeRate: property.serviceFeeRate ? Number(property.serviceFeeRate) : undefined,
    logo: property.logo || "",
    favicon: property.favicon || "",
    primaryColor: property.primaryColor || "#f59e0b",
    secondaryColor: property.secondaryColor || "#f97316",
    checkInTime: property.checkInTime || "15:00",
    checkOutTime: property.checkOutTime || "12:00",
    cancellationHours: property.cancellationHours || 24,
    maxAdvanceBooking: property.maxAdvanceBooking || 365,
    isActive: property.isActive,
    isPublished: property.isPublished,
    isFeatured: property.isFeatured,
    sortOrder: property.sortOrder || 0,
    metaTitle: property.metaTitle || "",
    metaDescription: property.metaDescription || "",
    metaKeywords: property.metaKeywords || ""
  })

  const [percentageValues, setPercentageValues] = useState({
    taxRate: toPercentage(property.taxRate ? Number(property.taxRate) : undefined),
    serviceFeeRate: toPercentage(property.serviceFeeRate ? Number(property.serviceFeeRate) : undefined)
  })

  // Get hero images (primary images with 'hero' context)
  const heroImages = images.filter(img => img.context === 'hero').sort((a, b) => a.sortOrder - b.sortOrder)
  const galleryImages = images.filter(img => img.context === 'gallery').sort((a, b) => a.sortOrder - b.sortOrder)
  const primaryHeroImage = heroImages.find(img => img.isPrimary) || heroImages[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUpdateSuccess(false)
    setErrors({})

    try {
      const dataToValidate = {
        ...formData,
        taxRate: toDecimal(percentageValues.taxRate),
        serviceFeeRate: toDecimal(percentageValues.serviceFeeRate)
      }
      
      const validatedData = updatePropertySchema.parse(dataToValidate)
      
      const response = await axios.patch(`/api/admin/operations/properties/${property.slug}`, validatedData)
      
      if (response.status === 200) {
        setUpdateSuccess(true)
        setTimeout(() => setUpdateSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to update property:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        if (error.response?.data?.error?.includes('slug already exists')) {
          setErrors({ slug: 'A property with this slug already exists.' })
        } else {
          setErrors({ general: error.response?.data?.error || 'Failed to update property' })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file: File, context: string = 'hero') => {
    setIsUploadingImage(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('context', context)
      formData.append('businessUnitId', property.id)
      
      const response = await axios.post(`/api/admin/operations/properties/${property.id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (response.status === 200) {
        // Refresh images from server
        await refreshImages()
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      setErrors({ image: 'Failed to upload image' })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const refreshImages = async () => {
    try {
      const response = await axios.get(`/api/admin/operations/properties/${property.id}/images`)
      setImages(response.data)
    } catch (error) {
      console.error('Failed to refresh images:', error)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      await axios.delete(`/api/admin/operations/properties/${property.id}/images/${imageId}`)
      await refreshImages()
    } catch (error) {
      console.error('Failed to delete image:', error)
      setErrors({ image: 'Failed to delete image' })
    }
  }

  const handleSetPrimaryImage = async (imageId: string, context: string) => {
    try {
      await axios.patch(`/api/admin/operations/properties/${property.id}/images/${imageId}/primary`, {
        context
      })
      await refreshImages()
    } catch (error) {
      console.error('Failed to set primary image:', error)
      setErrors({ image: 'Failed to set primary image' })
    }
  }

  const getError = (field: string) => errors[field]

  return (
    <div className="space-y-8">
      {/* Success Alert */}
      {updateSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 font-medium">
            Property updated successfully! Changes are now live.
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
            {/* Basic Information */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  Basic Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Essential details about your property
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">
                      Display Name
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Tropicana Grand Manila"
                      className={getError('displayName') ? 'border-destructive' : ''}
                    />
                    {getError('displayName') && (
                      <p className="text-sm text-destructive">{getError('displayName')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Internal Name
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tropicana Manila"
                      className={getError('name') ? 'border-destructive' : ''}
                    />
                    {getError('name') && (
                      <p className="text-sm text-destructive">{getError('name')}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium">
                      URL Slug
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <div className="flex">
                      <div className="inline-flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-md text-sm text-muted-foreground">
                        /properties/
                      </div>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="tropicana-manila"
                        className={`rounded-l-none ${getError('slug') ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {getError('slug') && (
                      <p className="text-sm text-destructive">{getError('slug')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-sm font-medium">
                      Property Type
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.propertyType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value as PropertyType }))}
                    >
                      <SelectTrigger className={getError('propertyType') ? 'border-destructive' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOTEL">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Urban Hotel
                          </div>
                        </SelectItem>
                        <SelectItem value="RESORT">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Beach Resort
                          </div>
                        </SelectItem>
                        <SelectItem value="VILLA_COMPLEX">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Villa Complex
                          </div>
                        </SelectItem>
                        <SelectItem value="BOUTIQUE_HOTEL">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Boutique Hotel
                          </div>
                        </SelectItem>
                        <SelectItem value="APARTMENT_HOTEL">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Apartment Hotel
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {getError('propertyType') && (
                      <p className="text-sm text-destructive">{getError('propertyType')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="text-sm font-medium">
                    Short Description
                  </Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="A brief, compelling description for listings..."
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in search results and property cards
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription" className="text-sm font-medium">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="longDescription"
                    value={formData.longDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                    placeholder="Comprehensive description for the property page..."
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Detailed information shown on the property page
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location & Contact */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  Location & Contact
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Address and contact information for your property
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street, Barangay Centro"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Manila"
                      className={getError('city') ? 'border-destructive' : ''}
                    />
                    {getError('city') && (
                      <p className="text-sm text-destructive">{getError('city')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Metro Manila"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Philippines"
                      className={getError('country') ? 'border-destructive' : ''}
                    />
                    {getError('country') && (
                      <p className="text-sm text-destructive">{getError('country')}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+63 2 8888 8888"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="reservations@property.com"
                      className={getError('email') ? 'border-destructive' : ''}
                    />
                    {getError('email') && (
                      <p className="text-sm text-destructive">{getError('email')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://property.com"
                      className={getError('website') ? 'border-destructive' : ''}
                    />
                    {getError('website') && (
                      <p className="text-sm text-destructive">{getError('website')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational Settings */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  Operational Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Check-in times, policies, and financial settings
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime" className="text-sm font-medium">
                      Check-in Time
                    </Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                      className={getError('checkInTime') ? 'border-destructive' : ''}
                    />
                    {getError('checkInTime') && (
                      <p className="text-sm text-destructive">{getError('checkInTime')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime" className="text-sm font-medium">
                      Check-out Time
                    </Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                      className={getError('checkOutTime') ? 'border-destructive' : ''}
                    />
                    {getError('checkOutTime') && (
                      <p className="text-sm text-destructive">{getError('checkOutTime')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancellationHours" className="text-sm font-medium">
                      Cancellation Hours
                    </Label>
                    <Input
                      id="cancellationHours"
                      type="number"
                      value={formData.cancellationHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, cancellationHours: parseInt(e.target.value) || 0 }))}
                      placeholder="24"
                      min="0"
                      max="168"
                    />
                    <p className="text-xs text-muted-foreground">
                      Hours before arrival for free cancellation
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate" className="text-sm font-medium">
                      Tax Rate
                    </Label>
                    <div className="relative">
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={percentageValues.taxRate}
                        onChange={(e) => setPercentageValues(prev => ({ ...prev, taxRate: e.target.value }))}
                        placeholder="15.00"
                        className={`pr-8 ${getError('taxRate') ? 'border-destructive' : ''}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        %
                      </div>
                    </div>
                    {getError('taxRate') && (
                      <p className="text-sm text-destructive">{getError('taxRate')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Government tax percentage applied to bookings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceFeeRate" className="text-sm font-medium">
                      Service Fee Rate
                    </Label>
                    <div className="relative">
                      <Input
                        id="serviceFeeRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={percentageValues.serviceFeeRate}
                        onChange={(e) => setPercentageValues(prev => ({ ...prev, serviceFeeRate: e.target.value }))}
                        placeholder="10.00"
                        className={`pr-8 ${getError('serviceFeeRate') ? 'border-destructive' : ''}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        %
                      </div>
                    </div>
                    {getError('serviceFeeRate') && (
                      <p className="text-sm text-destructive">{getError('serviceFeeRate')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Additional service fee percentage
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Overview */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <Activity className="h-4 w-4 text-violet-600" />
                  </div>
                  Property Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Active</Label>
                      {formData.isActive ? (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          <Activity className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Property is operational</p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Published</Label>
                      {formData.isPublished ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Eye className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Visible on website</p>
                  </div>
                  <Switch 
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Featured</Label>
                      {formData.isFeatured && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
                    <Palette className="h-4 w-4 text-pink-600" />
                  </div>
                  Brand Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-12 p-1 rounded-lg border-2 cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#f59e0b"
                      className={`flex-1 ${getError('primaryColor') ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {getError('primaryColor') && (
                    <p className="text-sm text-destructive">{getError('primaryColor')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Main brand color for buttons and highlights
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-12 h-12 p-1 rounded-lg border-2 cursor-pointer"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#f97316"
                      className={`flex-1 ${getError('secondaryColor') ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {getError('secondaryColor') && (
                    <p className="text-sm text-destructive">{getError('secondaryColor')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Accent color for gradients and decorative elements
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Property Images Management */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <ImageIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  Property Images
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Manage hero and gallery images for your property
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hero Images Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Hero Images</Label>
                    <Badge variant="secondary" className="text-xs">
                      {heroImages.length} image{heroImages.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {primaryHeroImage ? (
                    <div className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
                        <img 
                          src={primaryHeroImage.image.mediumUrl || primaryHeroImage.image.originalUrl} 
                          alt={primaryHeroImage.image.title || property.displayName}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {primaryHeroImage.isPrimary && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-primary text-primary-foreground">
                              <Star className="w-3 h-3 mr-1" />
                              Primary
                            </Badge>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="bg-white/90 hover:bg-white"
                                onClick={() => {
                                  setSelectedImageIndex(0)
                                  setIsImageDialogOpen(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View All
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="bg-white/90 hover:bg-white"
                            onClick={() => document.getElementById('hero-image-upload')?.click()}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>
                      {heroImages.length > 1 && (
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="bg-black/60 text-white border-0">
                            +{heroImages.length - 1} more
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                      onClick={() => document.getElementById('hero-image-upload')?.click()}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-muted/80 transition-colors">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-sm font-medium text-foreground">Upload hero image</p>
                          <p className="text-xs text-muted-foreground">Recommended: 1920×1080px</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Input
                    id="hero-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'hero')
                    }}
                  />
                </div>

                {/* Gallery Images Section */}
                {galleryImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Gallery Images</Label>
                      <Badge variant="secondary" className="text-xs">
                        {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {galleryImages.slice(0, 6).map((imageRelation, index) => (
                        <div key={imageRelation.id} className="relative group aspect-square">
                          <img 
                            src={imageRelation.image.thumbnailUrl || imageRelation.image.originalUrl}
                            alt={imageRelation.image.title || `Gallery image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md border transition-transform group-hover:scale-105"
                          />
                          {index === 5 && galleryImages.length > 6 && (
                            <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                +{galleryImages.length - 6} more
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => document.getElementById('gallery-image-upload')?.click()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Gallery Images
                    </Button>

                    <Input
                      id="gallery-image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach(file => handleImageUpload(file, 'gallery'))
                      }}
                    />
                  </div>
                )}

                {isUploadingImage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading image...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="transition-all hover:shadow-md border-primary/20">
              <CardContent className="p-6">
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Changes will be applied immediately
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Property Images</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedImageIndex + 1} of {[...heroImages, ...galleryImages].length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImageDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {[...heroImages, ...galleryImages].length > 0 && (
            <div className="relative">
              <div className="aspect-video bg-black/5 flex items-center justify-center">
                <img 
                  src={[...heroImages, ...galleryImages][selectedImageIndex]?.image.originalUrl}
                  alt={[...heroImages, ...galleryImages][selectedImageIndex]?.image.title || 'Property image'}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Navigation */}
              <div className="absolute inset-y-0 left-4 flex items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  disabled={selectedImageIndex === 0}
                  onClick={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="absolute inset-y-0 right-4 flex items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  disabled={selectedImageIndex === [...heroImages, ...galleryImages].length - 1}
                  onClick={() => setSelectedImageIndex(prev => Math.min([...heroImages, ...galleryImages].length - 1, prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Image Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => {
                    const currentImage = [...heroImages, ...galleryImages][selectedImageIndex]
                    if (currentImage) {
                      handleSetPrimaryImage(currentImage.imageId, currentImage.context || 'hero')
                    }
                  }}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Set Primary
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                  onClick={() => {
                    const currentImage = [...heroImages, ...galleryImages][selectedImageIndex]
                    if (currentImage) {
                      handleDeleteImage(currentImage.imageId)
                      if (selectedImageIndex >= [...heroImages, ...galleryImages].length - 1) {
                        setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>

              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/80 text-white p-3 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {[...heroImages, ...galleryImages][selectedImageIndex]?.image.title || 
                         [...heroImages, ...galleryImages][selectedImageIndex]?.image.filename}
                      </p>
                      <p className="text-sm text-white/80 mt-1">
                        {[...heroImages, ...galleryImages][selectedImageIndex]?.context === 'hero' ? 'Hero Image' : 'Gallery Image'}
                        {[...heroImages, ...galleryImages][selectedImageIndex]?.isPrimary && ' • Primary'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-white/60">
                      {[...heroImages, ...galleryImages][selectedImageIndex]?.image.width && 
                       [...heroImages, ...galleryImages][selectedImageIndex]?.image.height && (
                        <p>
                          {[...heroImages, ...galleryImages][selectedImageIndex].image.width} × {[...heroImages, ...galleryImages][selectedImageIndex].image.height}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnails */}
          <div className="p-6 border-t">
            <div className="flex gap-2 overflow-x-auto">
              {[...heroImages, ...galleryImages].map((imageRelation, index) => (
                <button
                  key={imageRelation.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                  }`}
                >
                  <img 
                    src={imageRelation.image.thumbnailUrl || imageRelation.image.originalUrl}
                    alt={imageRelation.image.title || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {imageRelation.isPrimary && (
                    <div className="absolute top-0 right-0 -translate-y-0.5 translate-x-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
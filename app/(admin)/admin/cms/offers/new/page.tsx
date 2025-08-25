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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Save, 
  ArrowLeft, 
  Gift, 
  Settings,
  DollarSign,
  AlertCircle,
  Users,
  Clock,
  Tag,
  Eye,
  EyeOff,
  Star,
  CheckCircle,
  Loader2,
  Activity,
  Calendar,
  Shield,
  TrendingUp,
  Percent
} from "lucide-react"
import { z } from "zod"
import axios from "axios"
import { OfferStatus, OfferType } from "@prisma/client"


interface BusinessUnit {
  id: string
  displayName: string
}

const createOfferSchema = z.object({
  businessUnitId: z.string().uuid("Please select a property"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().optional(),
  type: z.nativeEnum(OfferType),           // Changed to use Prisma enum
  status: z.nativeEnum(OfferStatus),       // Changed to use Prisma enum
  originalPrice: z.number().min(0).optional(),
  offerPrice: z.number().min(0.01, "Offer price must be greater than 0"),
  savingsPercent: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  validFrom: z.string().min(1, "Valid from date is required"),
  validTo: z.string().min(1, "Valid to date is required"),
  minNights: z.number().int().min(1).optional(),
  maxNights: z.number().int().min(0).optional(),
  minAdvanceBook: z.number().int().min(0).optional(),
  maxAdvanceBook: z.number().int().min(0).optional(),
  blackoutDates: z.array(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  termsConditions: z.string().optional(),
  promoCode: z.string().optional(),
  maxUses: z.number().int().min(0).optional(),
  maxPerGuest: z.number().int().min(1).optional(),
  combinableWithOtherOffers: z.boolean().optional(),
  requiresPromoCode: z.boolean().optional(),
  autoApply: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  viewCount: z.number().int().min(0).optional(),
  clickCount: z.number().int().min(0).optional(),
  bookingCount: z.number().int().min(0).optional()
}).refine(
  (data) => new Date(data.validTo) > new Date(data.validFrom),
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
).refine(
  (data) => {
    if (data.maxNights && data.maxNights > 0 && data.minNights) {
      return data.maxNights >= data.minNights;
    }
    return true;
  },
  {
    message: "Maximum nights must be greater than or equal to minimum nights",
    path: ["maxNights"]
  }
).refine(
  (data) => {
    if (data.maxAdvanceBook && data.maxAdvanceBook > 0 && data.minAdvanceBook) {
      return data.maxAdvanceBook >= data.minAdvanceBook;
    }
    return true;
  },
  {
    message: "Maximum advance booking days must be greater than or equal to minimum advance booking days",
    path: ["maxAdvanceBook"]
  }
)

type CreateOfferData = z.infer<typeof createOfferSchema>

export default function NewOfferPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CreateOfferData>({
    businessUnitId: "",
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    shortDesc: "",
    type: OfferType.PACKAGE,
    status: OfferStatus.ACTIVE,
    originalPrice: 0,
    offerPrice: 0,
    savingsPercent: 0,
    currency: "PHP",
    validFrom: "",
    validTo: "",
    minNights: 1,
    maxNights: 0,
    minAdvanceBook: 0,
    maxAdvanceBook: 0,
    blackoutDates: [],
    inclusions: [],
    exclusions: [],
    termsConditions: "",
    promoCode: "",
    maxUses: 0,
    maxPerGuest: 1,
    combinableWithOtherOffers: false,
    requiresPromoCode: false,
    autoApply: false,
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    viewCount: 0,
    clickCount: 0,
    bookingCount: 0
  })

  useEffect(() => {
    const loadBusinessUnits = async () => {
      try {
        const response = await axios.get('/api/business-units')
        setBusinessUnits(response.data)
      } catch (error) {
        console.error('Failed to load business units:', error)
      }
    }
    loadBusinessUnits()
  }, [])

  // Calculate savings percentage automatically
  useEffect(() => {
    if (formData.originalPrice && formData.offerPrice && formData.originalPrice > formData.offerPrice) {
      const savings = ((formData.originalPrice - formData.offerPrice) / formData.originalPrice) * 100
      setFormData(prev => ({ ...prev, savingsPercent: Math.round(savings) }))
    }
  }, [formData.originalPrice, formData.offerPrice])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setCreateSuccess(false)
  setErrors({})
  
  try {
    const validatedData = createOfferSchema.parse(formData)
    
    // Make actual API call instead of simulating
    const response = await axios.post('/api/admin/cms/offers', validatedData)
    
    console.log('Offer created successfully:', response.data)
    
    setCreateSuccess(true)
    setTimeout(() => {
      router.push('/admin/cms/offers')
    }, 2000)
  } catch (error) {
    console.error('Failed to create offer:', error)
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        fieldErrors[path] = issue.message
      })
      setErrors(fieldErrors)
    } else if (axios.isAxiosError(error)) {
      // Handle API validation errors
      if (error.response?.data?.details) {
        // Zod validation errors from API
        const fieldErrors: Record<string, string> = {}
        const details = error.response.data.details
        Object.keys(details).forEach((field) => {
          fieldErrors[field] = details[field][0] // Take first error message
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ general: error.response?.data?.error || 'Failed to create offer' })
      }
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
            <Link href="/admin/cms/offers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Offers
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Add New Offer</span>
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
              Create Offer
            </>
          )}
        </Button>
      </div>

      {/* Success Alert */}
      {createSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 font-medium">
            Offer created successfully! You will be redirected to the offers list.
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
            {/* Offer Details */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Gift className="h-5 w-5 text-amber-600" />
                  </div>
                  Offer Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Basic information about your special offer
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
                          {unit.displayName}
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
                    <Label htmlFor="title" className="text-sm font-medium">
                      Offer Title
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Early Bird Special"
                      className={getError('title') ? 'border-destructive' : ''}
                    />
                    {getError('title') && (
                      <p className="text-sm text-destructive">{getError('title')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium">
                      URL Slug
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="early-bird-special"
                      className={getError('slug') ? 'border-destructive' : ''}
                    />
                    {getError('slug') && (
                      <p className="text-sm text-destructive">{getError('slug')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-sm font-medium">
                    Subtitle
                  </Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Save 25% on your next stay"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the offer..."
                    className={`min-h-[120px] resize-none ${getError('description') ? 'border-destructive' : ''}`}
                  />
                  {getError('description') && (
                    <p className="text-sm text-destructive">{getError('description')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Provide detailed information about what the offer includes
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Offer Type
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as OfferType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={OfferType.EARLY_BIRD}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Early Bird
                          </div>
                        </SelectItem>
                        <SelectItem value={OfferType.LAST_MINUTE}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Last Minute
                          </div>
                        </SelectItem>
                        <SelectItem value={OfferType.SEASONAL}>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Seasonal
                          </div>
                        </SelectItem>
                        <SelectItem value={OfferType.PACKAGE}>
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Package
                          </div>
                        </SelectItem>
                        <SelectItem value={OfferType.LOYALTY}>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Loyalty
                          </div>
                        </SelectItem>
                        <SelectItem value={OfferType.GROUP}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Group
                          </div>
                        </SelectItem>
                        <SelectItem value={OfferType.CORPORATE}>
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Corporate
                          </div>
                        </SelectItem>
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
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as OfferStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                           <SelectItem value={OfferStatus.ACTIVE}>Active</SelectItem>
    <SelectItem value={OfferStatus.INACTIVE}>Inactive</SelectItem>
    <SelectItem value={OfferStatus.DRAFT}>Draft</SelectItem>
    <SelectItem value={OfferStatus.SCHEDULED}>Scheduled</SelectItem>
    <SelectItem value={OfferStatus.EXPIRED}>Expired</SelectItem>
                      </SelectContent>
                    </Select>
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
                  Set pricing and savings information for your offer
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" className="text-sm font-medium">
                      Original Price (₱)
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="5000"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="offerPrice" className="text-sm font-medium">
                      Offer Price (₱)
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="offerPrice"
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, offerPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="3750"
                      className={getError('offerPrice') ? 'border-destructive' : ''}
                      min="0"
                      step="0.01"
                    />
                    {getError('offerPrice') && (
                      <p className="text-sm text-destructive">{getError('offerPrice')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Savings %
                    </Label>
                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                      <span className="text-sm text-muted-foreground">
                        {formData.savingsPercent || 0}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-calculated from prices above
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom" className="text-sm font-medium">
                      Valid From
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                      className={getError('validFrom') ? 'border-destructive' : ''}
                    />
                    {getError('validFrom') && (
                      <p className="text-sm text-destructive">{getError('validFrom')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validTo" className="text-sm font-medium">
                      Valid To
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="validTo"
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                      className={getError('validTo') ? 'border-destructive' : ''}
                    />
                    {getError('validTo') && (
                      <p className="text-sm text-destructive">{getError('validTo')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  Terms & Conditions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define the terms, conditions, and restrictions for this offer
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="termsConditions" className="text-sm font-medium">
                    Terms & Conditions
                  </Label>
                  <Textarea
                    id="termsConditions"
                    value={formData.termsConditions || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsConditions: e.target.value }))}
                    placeholder="Enter terms and conditions..."
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Legal terms and conditions that apply to this offer
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Offer Status */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <Activity className="h-4 w-4 text-violet-600" />
                  </div>
                  Offer Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Published</Label>
                      {formData.isPublished ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Eye className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Offer is visible to customers</p>
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
                    <p className="text-xs text-muted-foreground">Show in featured offers section</p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Restrictions */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  Booking Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Min Nights</Label>
                    <Input
                      type="number"
                      value={formData.minNights}
                      onChange={(e) => setFormData(prev => ({ ...prev, minNights: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Max Nights</Label>
                    <Input
                      type="number"
                      value={formData.maxNights}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxNights: parseInt(e.target.value) || 0 }))}
                      placeholder="0 (unlimited)"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Min Advance (days)</Label>
                    <Input
                      type="number"
                      value={formData.minAdvanceBook}
                      onChange={(e) => setFormData(prev => ({ ...prev, minAdvanceBook: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Max Advance (days)</Label>
                    <Input
                      type="number"
                      value={formData.maxAdvanceBook}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAdvanceBook: parseInt(e.target.value) || 0 }))}
                      placeholder="0 (unlimited)"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code & Usage */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <Tag className="h-4 w-4 text-purple-600" />
                  </div>
                  Promo Code & Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Promo Code</Label>
                  <Input
                    value={formData.promoCode || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                    placeholder="SAVE25"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional code customers can use to apply this offer
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Requires Promo Code</Label>
                    <p className="text-xs text-muted-foreground">Must enter code to get discount</p>
                  </div>
                  <Switch 
                    checked={formData.requiresPromoCode}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresPromoCode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Auto Apply</Label>
                    <p className="text-xs text-muted-foreground">Automatically apply when conditions are met</p>
                  </div>
                  <Switch 
                    checked={formData.autoApply}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoApply: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Total Uses</Label>
                  <Input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 0 }))}
                    placeholder="0 (unlimited)"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Uses Per Guest</Label>
                  <Input
                    type="number"
                    value={formData.maxPerGuest}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsesPerGuest: parseInt(e.target.value) || 1 }))}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Settings */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <Settings className="h-4 w-4 text-indigo-600" />
                  </div>
                  Additional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Combinable with Other Offers</Label>
                    <p className="text-xs text-muted-foreground">Can be used with other promotions</p>
                  </div>
                  <Switch 
                    checked={formData.combinableWithOtherOffers}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, combinableWithOtherOffers: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Currency</Label>
                  <Select 
                    value={formData.currency || "PHP"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">Philippine Peso (₱)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
                    <TrendingUp className="h-4 w-4 text-pink-600" />
                  </div>
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Meta Title</Label>
                  <Input
                    value={formData.metaTitle || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Special Offer - Save 25%"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Meta Description</Label>
                  <Textarea
                    value={formData.metaDescription || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Book now and save 25% on your stay..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Meta Keywords</Label>
                  <Input
                    value={formData.metaKeywords || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                    placeholder="hotel, discount, special offer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-xs text-muted-foreground">Bookings</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Analytics will be available after publishing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
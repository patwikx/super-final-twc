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
  Percent,
  Trash2
} from "lucide-react"
import { z } from "zod"
import axios from "axios"

// Enum definitions to match Prisma types
enum OfferType {
  EARLY_BIRD = "EARLY_BIRD",
  LAST_MINUTE = "LAST_MINUTE",
  SEASONAL = "SEASONAL",
  PACKAGE = "PACKAGE",
  LOYALTY = "LOYALTY",
  GROUP = "GROUP",
  CORPORATE = "CORPORATE"
}

enum OfferStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
  SCHEDULED = "SCHEDULED"
}

interface BusinessUnit {
  id: string
  displayName: string
}

interface SpecialOffer {
  id: string
  businessUnitId: string
  title: string
  slug: string
  subtitle?: string
  description: string
  shortDesc?: string
  type: OfferType
  status: OfferStatus
  originalPrice?: number
  offerPrice: number
  savingsPercent?: number
  currency?: string
  validFrom: string
  validTo: string
  minNights?: number
  maxNights?: number
  minAdvanceBook?: number
  maxAdvanceBook?: number
  blackoutDates?: string[]
  inclusions?: string[]
  exclusions?: string[]
  termsConditions?: string
  promoCode?: string
  maxUses?: number
  maxUsesPerGuest?: number
  combinableWithOtherOffers?: boolean
  requiresPromoCode?: boolean
  autoApply?: boolean
  isPublished: boolean
  isFeatured: boolean
  sortOrder?: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  viewCount?: number
  clickCount?: number
  bookingCount?: number
  createdAt: string
  updatedAt: string
}

// Zod schema for validation
const updateOfferSchema = z.object({
  businessUnitId: z.string().uuid("Please select a property"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().optional(),
  type: z.nativeEnum(OfferType),
  status: z.nativeEnum(OfferStatus),
  originalPrice: z.number().min(0).optional(),
  offerPrice: z.number().min(0.01, "Offer price must be greater than 0"),
  savingsPercent: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  validFrom: z.string().min(1, "Valid from date is required"),
  validTo: z.string().min(1, "Valid to date is required"),
  minNights: z.number().int().min(1).optional(),
  maxNights: z.number().int().min(1).optional(),
  minAdvanceBook: z.number().int().min(0).optional(),
  maxAdvanceBook: z.number().int().min(0).optional(),
  blackoutDates: z.array(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  termsConditions: z.string().optional(),
  promoCode: z.string().optional(),
  maxUses: z.number().int().min(1).optional(),
  maxUsesPerGuest: z.number().int().min(1).optional(),
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
)

type UpdateOfferData = z.infer<typeof updateOfferSchema>

interface EditOfferPageProps {
  params: Promise<{ id: string }>
}

export default function EditOfferPage({ params }: EditOfferPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [offer, setOffer] = useState<SpecialOffer | null>(null)
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<UpdateOfferData>({
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
    maxUsesPerGuest: 1,
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
    const loadData = async () => {
      try {
        const { id } = await params
        
        const [offerResponse, businessUnitsResponse] = await Promise.all([
          axios.get(`/api/admin/cms/offers/${id}`),
          axios.get('/api/business-units')
        ])
        
        const offerData: SpecialOffer = offerResponse.data
        setOffer(offerData)
        setBusinessUnits(businessUnitsResponse.data)
        
        setFormData({
          businessUnitId: offerData.businessUnitId,
          title: offerData.title,
          slug: offerData.slug,
          subtitle: offerData.subtitle || "",
          description: offerData.description,
          shortDesc: offerData.shortDesc || "",
          type: offerData.type,
          status: offerData.status,
          originalPrice: offerData.originalPrice || 0,
          offerPrice: offerData.offerPrice,
          savingsPercent: offerData.savingsPercent || 0,
          currency: offerData.currency || "PHP",
          validFrom: new Date(offerData.validFrom).toISOString().split('T')[0],
          validTo: new Date(offerData.validTo).toISOString().split('T')[0],
          minNights: offerData.minNights || 1,
          maxNights: offerData.maxNights || 0,
          minAdvanceBook: offerData.minAdvanceBook || 0,
          maxAdvanceBook: offerData.maxAdvanceBook || 0,
          blackoutDates: offerData.blackoutDates || [],
          inclusions: offerData.inclusions || [],
          exclusions: offerData.exclusions || [],
          termsConditions: offerData.termsConditions || "",
          promoCode: offerData.promoCode || "",
          maxUses: offerData.maxUses || 0,
          maxUsesPerGuest: offerData.maxUsesPerGuest || 1,
          combinableWithOtherOffers: offerData.combinableWithOtherOffers || false,
          requiresPromoCode: offerData.requiresPromoCode || false,
          autoApply: offerData.autoApply || false,
          isPublished: offerData.isPublished,
          isFeatured: offerData.isFeatured,
          sortOrder: offerData.sortOrder || 0,
          metaTitle: offerData.metaTitle || "",
          metaDescription: offerData.metaDescription || "",
          metaKeywords: offerData.metaKeywords || "",
          viewCount: offerData.viewCount || 0,
          clickCount: offerData.clickCount || 0,
          bookingCount: offerData.bookingCount || 0
        })
      } catch (error) {
        console.error('Failed to load offer data:', error)
        router.back()
      }
    }
    loadData()
  }, [params, router])

  // Calculate savings percentage automatically
  useEffect(() => {
    if (formData.originalPrice && formData.offerPrice && formData.originalPrice > formData.offerPrice) {
      const savings = ((formData.originalPrice - formData.offerPrice) / formData.originalPrice) * 100
      setFormData(prev => ({ ...prev, savingsPercent: Math.round(savings) }))
    }
  }, [formData.originalPrice, formData.offerPrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offer) return
    
    setIsLoading(true)
    setUpdateSuccess(false)
    setErrors({})
    
    try {
      // Prepare and clean the form data before validation
      const cleanedData = {
        ...formData,
        // Ensure numbers are properly converted
        offerPrice: Number(formData.offerPrice),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        savingsPercent: formData.savingsPercent ? Number(formData.savingsPercent) : undefined,
        minNights: formData.minNights ? Number(formData.minNights) : undefined,
        maxNights: formData.maxNights && Number(formData.maxNights) > 0 ? Number(formData.maxNights) : undefined,
        minAdvanceBook: formData.minAdvanceBook ? Number(formData.minAdvanceBook) : undefined,
        maxAdvanceBook: formData.maxAdvanceBook && Number(formData.maxAdvanceBook) > 0 ? Number(formData.maxAdvanceBook) : undefined,
        maxUses: formData.maxUses && Number(formData.maxUses) > 0 ? Number(formData.maxUses) : undefined,
        maxUsesPerGuest: formData.maxUsesPerGuest ? Number(formData.maxUsesPerGuest) : undefined,
        sortOrder: formData.sortOrder ? Number(formData.sortOrder) : undefined,
        viewCount: formData.viewCount ? Number(formData.viewCount) : undefined,
        clickCount: formData.clickCount ? Number(formData.clickCount) : undefined,
        bookingCount: formData.bookingCount ? Number(formData.bookingCount) : undefined,
        // Handle empty strings for optional fields
        subtitle: formData.subtitle || undefined,
        shortDesc: formData.shortDesc || undefined,
        termsConditions: formData.termsConditions || undefined,
        promoCode: formData.promoCode || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        metaKeywords: formData.metaKeywords || undefined,
      }

      const validatedData = updateOfferSchema.parse(cleanedData)
      const { id } = await params
      
      await axios.patch(`/api/admin/cms/offers/${id}`, validatedData)
      
      setUpdateSuccess(true)
      setTimeout(() => {
        router.push('/admin/cms/offers')
      }, 2000)
    } catch (error) {
      console.error('Failed to update offer:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.error || 'Failed to update offer' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!offer || !confirm('Are you sure you want to delete this offer?')) return
    
    setIsLoading(true)
    try {
      const { id } = await params
      
      await axios.delete(`/api/admin/cms/offers/${id}`)
      
      router.push('/admin/cms/offers')
    } catch (error) {
      console.error('Failed to delete offer:', error)
      setErrors({ general: 'Failed to delete offer' })
      setIsLoading(false)
    }
  }

  const getError = (field: string) => errors[field]

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading offer details...</span>
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
            <Link href="/admin/cms/offers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Offers
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Edit Offer</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleDelete} 
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="border-0"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
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

      {/* Success Alert */}
      {updateSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 font-medium">
            Offer updated successfully! You will be redirected to the offers list.
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

                <div className="space-y-2">
                  <Label htmlFor="shortDesc" className="text-sm font-medium">
                    Short Description
                  </Label>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDesc: e.target.value }))}
                    placeholder="Brief summary for listings..."
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief description for offer cards and listings
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
                        <SelectItem value={OfferStatus.EXPIRED}>Expired</SelectItem>
                        <SelectItem value={OfferStatus.SCHEDULED}>Scheduled</SelectItem>
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
                    value={formData.maxUsesPerGuest}
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

            {/* Analytics */}
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
                    <div className="text-2xl font-bold text-foreground">{offer?.viewCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">{offer?.clickCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">{offer?.bookingCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Bookings</div>
                  </div>
                </div>
                
                {offer?.viewCount && offer.viewCount > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conversion Rate:</span>
                      <span className="font-medium">
                        {offer.clickCount && offer.viewCount 
                          ? ((offer.clickCount / offer.viewCount) * 100).toFixed(1) + '%'
                          : '0.0%'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Booking Rate:</span>
                      <span className="font-medium">
                        {offer.bookingCount && offer.clickCount 
                          ? ((offer.bookingCount / offer.clickCount) * 100).toFixed(1) + '%'
                          : '0.0%'
                        }
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(offer?.createdAt || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(offer?.updatedAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
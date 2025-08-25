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
  Calendar, 
  Settings,
  MapPin,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  Tag,
  CheckCircle,
  Loader2,
  Activity,
  Eye,
  EyeOff,
  Star,
  Globe
} from "lucide-react"
import { EventType, EventStatus, BusinessUnit } from "@prisma/client"
import { z } from "zod"
import axios from "axios"

// Zod schema for validation
const createEventSchema = z.object({
  businessUnitId: z.string().uuid("Please select a property"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().optional(),
  type: z.nativeEnum(EventType),
  status: z.nativeEnum(EventStatus),
  category: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isMultiDay: z.boolean().optional(),
  venue: z.string().min(1, "Venue is required"),
  venueAddress: z.string().optional(),
  venueCapacity: z.number().int().min(1).optional(),
  isFree: z.boolean().optional(),
  ticketPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  requiresBooking: z.boolean().optional(),
  maxAttendees: z.number().int().min(1).optional(),
  registrationDeadline: z.string().optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  dresscode: z.string().optional(),
  ageRestriction: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional()
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"]
  }
)

type CreateEventData = z.infer<typeof createEventSchema>

export default function NewEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CreateEventData>({
    businessUnitId: "",
    title: "",
    slug: "",
    description: "",
    shortDesc: "",
    type: "CULTURAL",
    status: "PLANNING",
    category: [],
    tags: [],
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    isMultiDay: false,
    venue: "",
    venueAddress: "",
    venueCapacity: 0,
    isFree: true,
    ticketPrice: 0,
    currency: "PHP",
    requiresBooking: false,
    maxAttendees: 0,
    registrationDeadline: "",
    includes: [],
    excludes: [],
    dresscode: "",
    ageRestriction: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    externalUrl: "",
    isPublished: false,
    isFeatured: false,
    isPinned: false,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: ""
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setCreateSuccess(false)
    setErrors({})
    
    try {
      const validatedData = createEventSchema.parse(formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Creating event:', validatedData)
      
      setCreateSuccess(true)
      setTimeout(() => {
        router.push('/admin/cms/events')
      }, 2000)
    } catch (error) {
      console.error('Failed to create event:', error)
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.error || 'Failed to create event' })
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
            <Link href="/admin/cms/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Add New Event</span>
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
              Create Event
            </>
          )}
        </Button>
      </div>

      {/* Success Alert */}
      {createSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 font-medium">
            Event created successfully! You will be redirected to the events list.
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
            {/* Event Details */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  Event Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Basic information about your event
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
                      Event Title
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Tropicana Food Festival"
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
                    <div className="flex">
                      <div className="inline-flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-md text-sm text-muted-foreground">
                        /events/
                      </div>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="tropicana-food-festival"
                        className={`rounded-l-none ${getError('slug') ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {getError('slug') && (
                      <p className="text-sm text-destructive">{getError('slug')}</p>
                    )}
                  </div>
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
                    placeholder="Detailed description of the event..."
                    className={`min-h-[120px] resize-none ${getError('description') ? 'border-destructive' : ''}`}
                  />
                  {getError('description') && (
                    <p className="text-sm text-destructive">{getError('description')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDesc" className="text-sm font-medium">
                    Short Description
                  </Label>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDesc: e.target.value }))}
                    placeholder="Brief summary for cards and previews..."
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in event cards and search results
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Event Type
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEDDING">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Wedding
                          </div>
                        </SelectItem>
                        <SelectItem value="CONFERENCE">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Conference
                          </div>
                        </SelectItem>
                        <SelectItem value="MEETING">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Meeting
                          </div>
                        </SelectItem>
                        <SelectItem value="WORKSHOP">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Workshop
                          </div>
                        </SelectItem>
                        <SelectItem value="CELEBRATION">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Celebration
                          </div>
                        </SelectItem>
                        <SelectItem value="CULTURAL">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Cultural
                          </div>
                        </SelectItem>
                        <SelectItem value="SEASONAL">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Seasonal
                          </div>
                        </SelectItem>
                        <SelectItem value="ENTERTAINMENT">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Entertainment
                          </div>
                        </SelectItem>
                        <SelectItem value="CORPORATE">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Corporate
                          </div>
                        </SelectItem>
                        <SelectItem value="PRIVATE">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Private
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
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as EventStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNING">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Planning
                          </div>
                        </SelectItem>
                        <SelectItem value="CONFIRMED">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Confirmed
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Cancelled
                          </div>
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Completed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  Date & Time
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  When will your event take place
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      Start Date
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className={getError('startDate') ? 'border-destructive' : ''}
                    />
                    {getError('startDate') && (
                      <p className="text-sm text-destructive">{getError('startDate')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      End Date
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className={getError('endDate') ? 'border-destructive' : ''}
                    />
                    {getError('endDate') && (
                      <p className="text-sm text-destructive">{getError('endDate')}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm font-medium">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-sm font-medium">
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Multi-Day Event</Label>
                    <p className="text-xs text-muted-foreground">Event spans multiple days</p>
                  </div>
                  <Switch 
                    checked={formData.isMultiDay}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMultiDay: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Venue & Capacity */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  Venue & Capacity
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Location details for your event
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="venue" className="text-sm font-medium">
                      Venue Name
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="Main Resort Grounds"
                      className={getError('venue') ? 'border-destructive' : ''}
                    />
                    {getError('venue') && (
                      <p className="text-sm text-destructive">{getError('venue')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venueCapacity" className="text-sm font-medium">
                      Venue Capacity
                    </Label>
                    <Input
                      id="venueCapacity"
                      type="number"
                      value={formData.venueCapacity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, venueCapacity: parseInt(e.target.value) || 0 }))}
                      placeholder="500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venueAddress" className="text-sm font-medium">
                    Venue Address
                  </Label>
                  <Input
                    id="venueAddress"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                    placeholder="Complete venue address"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Status */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <Activity className="h-4 w-4 text-violet-600" />
                  </div>
                  Event Status
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
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Visible to public</p>
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
                    <p className="text-xs text-muted-foreground">Show in featured section</p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Pinned</Label>
                    <p className="text-xs text-muted-foreground">Pin to top of list</p>
                  </div>
                  <Switch 
                    checked={formData.isPinned}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPinned: checked }))}
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
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Free Event</Label>
                    <p className="text-xs text-muted-foreground">No ticket price required</p>
                  </div>
                  <Switch 
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked }))}
                  />
                </div>

                {!formData.isFree && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ticket Price</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.ticketPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="1500"
                        min="0"
                        step="0.01"
                        className="pl-8"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₱
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Registration */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Requires Booking</Label>
                    <p className="text-xs text-muted-foreground">Guests must register</p>
                  </div>
                  <Switch 
                    checked={formData.requiresBooking}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresBooking: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Attendees</Label>
                  <Input
                    type="number"
                    value={formData.maxAttendees || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) || 0 }))}
                    placeholder="500"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Registration Deadline</Label>
                  <Input
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <Settings className="h-4 w-4 text-indigo-600" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Person</Label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="events@property.com"
                    className={getError('contactEmail') ? 'border-destructive' : ''}
                  />
                  {getError('contactEmail') && (
                    <p className="text-sm text-destructive">{getError('contactEmail')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Phone</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+63 2 8888 8888"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">External URL</Label>
                  <Input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                    placeholder="https://external-booking.com"
                    className={getError('externalUrl') ? 'border-destructive' : ''}
                  />
                  {getError('externalUrl') && (
                    <p className="text-sm text-destructive">{getError('externalUrl')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
                    <Tag className="h-4 w-4 text-pink-600" />
                  </div>
                  SEO & Meta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Meta Title</Label>
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Event title for search engines"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaTitle?.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Meta Description</Label>
                  <Textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Brief description for search results"
                    className="min-h-[80px] resize-none"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaDescription?.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Keywords</Label>
                  <Input
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                    placeholder="event, festival, entertainment"
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
"use client"

import { useState } from "react"
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
  ImageIcon, 
  Settings,
  Monitor,
  Palette,
  Clock,
  AlertCircle,
  Tag,
  Eye,
  EyeOff,
  Star,
  CheckCircle,
  Loader2,
  Activity,
  Users,
  Globe,
  Link as LinkIcon
} from "lucide-react"
import { z } from "zod"
import axios from "axios"

// Zod schema matching Hero model exactly
const createHeroSchema = z.object({
  // Content
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  
  // Media
  backgroundImage: z.string().url("Invalid image URL").optional().or(z.literal("")),
  backgroundVideo: z.string().url("Invalid video URL").optional().or(z.literal("")),
  overlayImage: z.string().url("Invalid overlay image URL").optional().or(z.literal("")),
  
  // Display Settings
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  displayType: z.enum(["fullscreen", "banner", "carousel"]).default("fullscreen"),
  
  // Styling Options
  textAlignment: z.enum(["left", "center", "right"]).default("center"),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  textColor: z.string().optional(),
  
  // Call-to-Action
  primaryButtonText: z.string().optional(),
  primaryButtonUrl: z.string().optional(),
  primaryButtonStyle: z.string().optional(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
  secondaryButtonStyle: z.string().optional(),
  
  // Scheduling
  showFrom: z.string().optional(),
  showUntil: z.string().optional(),
  
  // Targeting
  targetPages: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  
  // SEO
  altText: z.string().optional(),
  caption: z.string().optional()
})

type CreateHeroData = z.infer<typeof createHeroSchema>

export default function NewHeroSlidePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CreateHeroData>({
    // Content
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    
    // Media
    backgroundImage: "",
    backgroundVideo: "",
    overlayImage: "",
    
    // Display Settings
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    displayType: "fullscreen",
    
    // Styling Options
    textAlignment: "center",
    overlayColor: "#000000",
    overlayOpacity: 0.3,
    textColor: "#ffffff",
    
    // Call-to-Action
    primaryButtonText: "",
    primaryButtonUrl: "",
    primaryButtonStyle: "primary",
    secondaryButtonText: "",
    secondaryButtonUrl: "",
    secondaryButtonStyle: "secondary",
    
    // Scheduling
    showFrom: "",
    showUntil: "",
    
    // Targeting
    targetPages: [],
    targetAudience: [],
    
    // SEO
    altText: "",
    caption: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setCreateSuccess(false)
    setErrors({})
    
    try {
      const validatedData = createHeroSchema.parse(formData)
      
      // Make actual API call
      const response = await axios.post('/api/admin/cms/hero-slides', validatedData, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('Hero slide created successfully:', response.data)
      setCreateSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/cms/hero-slides')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to create hero slide:', error)
      
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to create hero slide'
        setErrors({ general: errorMessage })
        
        // Handle validation errors from server
        if (error.response?.data?.details?.issues && Array.isArray(error.response.data.details.issues)) {
          const fieldErrors: Record<string, string> = {}
          error.response.data.details.issues.forEach((issue: z.ZodIssue) => {
            const path = issue.path.join('.')
            fieldErrors[path] = issue.message
          })
          setErrors(fieldErrors)
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
            <Link href="/admin/cms/hero-slides">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hero Slides
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Add New Hero Slide</span>
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
              Create Hero Slide
            </>
          )}
        </Button>
      </div>

      {/* Success Alert */}
      {createSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 font-medium">
            Hero slide created successfully! You will be redirected to the hero slides list.
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
            {/* Hero Content */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  Hero Content
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Main content and messaging for your hero slide
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Discover Paradise Across the Philippines"
                    className={getError('title') ? 'border-destructive' : ''}
                  />
                  {getError('title') && (
                    <p className="text-sm text-destructive">{getError('title')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-sm font-medium">
                    Subtitle
                  </Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Experience world-class hospitality"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description for the hero section..."
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Additional context or promotional text
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="buttonText" className="text-sm font-medium">
                      Button Text
                    </Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                      placeholder="Book Your Stay"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonUrl" className="text-sm font-medium">
                      Button URL
                    </Label>
                    <Input
                      id="buttonUrl"
                      value={formData.buttonUrl || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonUrl: e.target.value }))}
                      placeholder="/reservations"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call-to-Action Buttons */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <LinkIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  Call-to-Action Buttons
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Primary and secondary action buttons
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryButtonText" className="text-sm font-medium">
                      Primary Button Text
                    </Label>
                    <Input
                      id="primaryButtonText"
                      value={formData.primaryButtonText || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryButtonText: e.target.value }))}
                      placeholder="Book Now"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryButtonUrl" className="text-sm font-medium">
                      Primary Button URL
                    </Label>
                    <Input
                      id="primaryButtonUrl"
                      value={formData.primaryButtonUrl || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryButtonUrl: e.target.value }))}
                      placeholder="/reservations"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryButtonStyle" className="text-sm font-medium">
                      Primary Button Style
                    </Label>
                    <Select 
                      value={formData.primaryButtonStyle || "primary"} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, primaryButtonStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryButtonText" className="text-sm font-medium">
                      Secondary Button Text
                    </Label>
                    <Input
                      id="secondaryButtonText"
                      value={formData.secondaryButtonText || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryButtonText: e.target.value }))}
                      placeholder="Learn More"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryButtonUrl" className="text-sm font-medium">
                      Secondary Button URL
                    </Label>
                    <Input
                      id="secondaryButtonUrl"
                      value={formData.secondaryButtonUrl || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryButtonUrl: e.target.value }))}
                      placeholder="/about"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryButtonStyle" className="text-sm font-medium">
                      Secondary Button Style
                    </Label>
                    <Select 
                      value={formData.secondaryButtonStyle || "secondary"} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, secondaryButtonStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Assets */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Monitor className="h-5 w-5 text-emerald-600" />
                  </div>
                  Media Assets
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Images and videos for your hero slide
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="backgroundImage" className="text-sm font-medium">
                    Background Image URL
                  </Label>
                  <Input
                    id="backgroundImage"
                    value={formData.backgroundImage || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                    placeholder="https://example.com/hero-image.jpg"
                    className={getError('backgroundImage') ? 'border-destructive' : ''}
                  />
                  {getError('backgroundImage') && (
                    <p className="text-sm text-destructive">{getError('backgroundImage')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundVideo" className="text-sm font-medium">
                    Background Video URL
                  </Label>
                  <Input
                    id="backgroundVideo"
                    value={formData.backgroundVideo || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundVideo: e.target.value }))}
                    placeholder="https://example.com/hero-video.mp4"
                    className={getError('backgroundVideo') ? 'border-destructive' : ''}
                  />
                  {getError('backgroundVideo') && (
                    <p className="text-sm text-destructive">{getError('backgroundVideo')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overlayImage" className="text-sm font-medium">
                    Overlay Image URL
                  </Label>
                  <Input
                    id="overlayImage"
                    value={formData.overlayImage || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, overlayImage: e.target.value }))}
                    placeholder="https://example.com/overlay-image.jpg"
                    className={getError('overlayImage') ? 'border-destructive' : ''}
                  />
                  {getError('overlayImage') && (
                    <p className="text-sm text-destructive">{getError('overlayImage')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Additional image overlay (optional)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altText" className="text-sm font-medium">
                    Alt Text
                  </Label>
                  <Input
                    id="altText"
                    value={formData.altText || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                    placeholder="Stunning view of tropical resort"
                  />
                  <p className="text-xs text-muted-foreground">
                    Accessibility description for screen readers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption" className="text-sm font-medium">
                    Caption
                  </Label>
                  <Input
                    id="caption"
                    value={formData.caption || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Image caption or subtitle"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Design & Layout */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Palette className="h-5 w-5 text-amber-600" />
                  </div>
                  Design & Layout
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visual styling and layout options
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayType" className="text-sm font-medium">
                      Display Type
                    </Label>
                    <Select 
                      value={formData.displayType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, displayType: value as "fullscreen" | "banner" | "carousel" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fullscreen">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Fullscreen
                          </div>
                        </SelectItem>
                        <SelectItem value="banner">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Banner
                          </div>
                        </SelectItem>
                        <SelectItem value="carousel">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Carousel
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textAlignment" className="text-sm font-medium">
                      Text Alignment
                    </Label>
                    <Select 
                      value={formData.textAlignment} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, textAlignment: value as "left" | "center" | "right" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left Aligned</SelectItem>
                        <SelectItem value="center">Center Aligned</SelectItem>
                        <SelectItem value="right">Right Aligned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="overlayColor" className="text-sm font-medium">
                      Overlay Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="overlayColor"
                        type="color"
                        value={formData.overlayColor || "#000000"}
                        onChange={(e) => setFormData(prev => ({ ...prev, overlayColor: e.target.value }))}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.overlayColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, overlayColor: e.target.value }))}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overlayOpacity" className="text-sm font-medium">
                      Overlay Opacity
                    </Label>
                    <Input
                      id="overlayOpacity"
                      type="number"
                      value={formData.overlayOpacity || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, overlayOpacity: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.3"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textColor" className="text-sm font-medium">
                      Text Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={formData.textColor || "#ffffff"}
                        onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.textColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hero Status */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <Activity className="h-4 w-4 text-violet-600" />
                  </div>
                  Slide Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Active</Label>
                      {formData.isActive ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Eye className="w-3 h-3 mr-1" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Slide is visible to users</p>
                  </div>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Featured</Label>
                      {formData.isFeatured && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Star className="w-3 h-3 mr-1" />
                          Priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Higher priority display</p>
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

            {/* Targeting */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  Targeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Pages</Label>
                  <Select 
                    value={formData.targetPages?.[0] || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, targetPages: value ? [value] : [] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Homepage
                        </div>
                      </SelectItem>
                      <SelectItem value="properties">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Properties
                        </div>
                      </SelectItem>
                      <SelectItem value="offers">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Offers
                        </div>
                      </SelectItem>
                      <SelectItem value="events">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Events
                        </div>
                      </SelectItem>
                      <SelectItem value="about">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          About
                        </div>
                      </SelectItem>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          All Pages
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Audience</Label>
                  <Select 
                    value={formData.targetAudience?.[0] || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value ? [value] : [] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Visitors</SelectItem>
                      <SelectItem value="returning-visitors">Returning Visitors</SelectItem>
                      <SelectItem value="mobile-users">Mobile Users</SelectItem>
                      <SelectItem value="desktop-users">Desktop Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Show From</Label>
                  <Input
                    type="datetime-local"
                    value={formData.showFrom || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, showFrom: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">When to start showing this slide</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Show Until</Label>
                  <Input
                    type="datetime-local"
                    value={formData.showUntil || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, showUntil: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">When to stop showing this slide</p>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Tag className="h-4 w-4 text-green-600" />
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
                    <div className="text-xs text-muted-foreground">Conversions</div>
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
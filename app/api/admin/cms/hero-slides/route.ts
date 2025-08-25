import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createHeroSchema = z.object({
  // Content
  title: z.string().min(1).max(200),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  
  // Media
  backgroundImage: z.string().url().optional().or(z.literal("")),
  backgroundVideo: z.string().url().optional().or(z.literal("")),
  overlayImage: z.string().url().optional().or(z.literal("")),
  
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

export async function GET() {
  try {
    const heroSlides = await prisma.hero.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    
    return NextResponse.json(heroSlides)
  } catch (error) {
    console.error('Failed to fetch hero slides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero slides' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createHeroSchema.parse(body)
    
    // Process data to match Prisma schema exactly
    const processedData = {
      // Content
      title: validatedData.title,
      subtitle: validatedData.subtitle || null,
      description: validatedData.description || null,
      buttonText: validatedData.buttonText || null,
      buttonUrl: validatedData.buttonUrl || null,
      
      // Media
      backgroundImage: validatedData.backgroundImage || null,
      backgroundVideo: validatedData.backgroundVideo || null,
      overlayImage: validatedData.overlayImage || null,
      
      // Display Settings
      isActive: validatedData.isActive,
      isFeatured: validatedData.isFeatured,
      sortOrder: validatedData.sortOrder,
      displayType: validatedData.displayType,
      
      // Styling Options
      textAlignment: validatedData.textAlignment,
      overlayColor: validatedData.overlayColor || null,
      overlayOpacity: validatedData.overlayOpacity || null,
      textColor: validatedData.textColor || null,
      
      // Call-to-Action
      primaryButtonText: validatedData.primaryButtonText || null,
      primaryButtonUrl: validatedData.primaryButtonUrl || null,
      primaryButtonStyle: validatedData.primaryButtonStyle || null,
      secondaryButtonText: validatedData.secondaryButtonText || null,
      secondaryButtonUrl: validatedData.secondaryButtonUrl || null,
      secondaryButtonStyle: validatedData.secondaryButtonStyle || null,
      
      // Scheduling
      showFrom: validatedData.showFrom ? new Date(validatedData.showFrom) : null,
      showUntil: validatedData.showUntil ? new Date(validatedData.showUntil) : null,
      
      // Targeting
      targetPages: validatedData.targetPages || [],
      targetAudience: validatedData.targetAudience || [],
      
      // SEO
      altText: validatedData.altText || null,
      caption: validatedData.caption || null
    }
    
    const heroSlide = await prisma.hero.create({
      data: processedData
    })
    
    return NextResponse.json(heroSlide, { status: 201 })
  } catch (error) {
    console.error('Failed to create hero slide:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create hero slide' },
      { status: 500 }
    )
  }
}
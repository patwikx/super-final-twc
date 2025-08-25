import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const updateHeroSchema = z.object({
  // Content
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  
  // Media
  backgroundImage: z.string().url().optional().or(z.literal("")),
  backgroundVideo: z.string().url().optional().or(z.literal("")),
  overlayImage: z.string().url().optional().or(z.literal("")),
  
  // Display Settings
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  displayType: z.enum(["fullscreen", "banner", "carousel"]).optional(),
  
  // Styling Options
  textAlignment: z.enum(["left", "center", "right"]).optional(),
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
  caption: z.string().optional(),
  
  // Analytics (read-only, but included for completeness)
  viewCount: z.number().int().min(0).optional(),
  clickCount: z.number().int().min(0).optional(),
  conversionCount: z.number().int().min(0).optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const heroSlide = await prisma.hero.findUnique({
      where: { id }
    })
    
    if (!heroSlide) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(heroSlide)
  } catch (error) {
    console.error('Failed to fetch hero slide:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero slide' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateHeroSchema.parse(body)
    
    // Process data to match Prisma schema exactly
    const processedData: Prisma.HeroUpdateInput = {}
    
    // Content fields
    if (validatedData.title !== undefined) processedData.title = validatedData.title
    if (validatedData.subtitle !== undefined) processedData.subtitle = validatedData.subtitle || null
    if (validatedData.description !== undefined) processedData.description = validatedData.description || null
    if (validatedData.buttonText !== undefined) processedData.buttonText = validatedData.buttonText || null
    if (validatedData.buttonUrl !== undefined) processedData.buttonUrl = validatedData.buttonUrl || null
    
    // Media fields
    if (validatedData.backgroundImage !== undefined) processedData.backgroundImage = validatedData.backgroundImage || null
    if (validatedData.backgroundVideo !== undefined) processedData.backgroundVideo = validatedData.backgroundVideo || null
    if (validatedData.overlayImage !== undefined) processedData.overlayImage = validatedData.overlayImage || null
    
    // Display Settings
    if (validatedData.isActive !== undefined) processedData.isActive = validatedData.isActive
    if (validatedData.isFeatured !== undefined) processedData.isFeatured = validatedData.isFeatured
    if (validatedData.sortOrder !== undefined) processedData.sortOrder = validatedData.sortOrder
    if (validatedData.displayType !== undefined) processedData.displayType = validatedData.displayType
    
    // Styling Options
    if (validatedData.textAlignment !== undefined) processedData.textAlignment = validatedData.textAlignment || null
    if (validatedData.overlayColor !== undefined) processedData.overlayColor = validatedData.overlayColor || null
    if (validatedData.overlayOpacity !== undefined) {
      // Convert to Decimal for Prisma
      processedData.overlayOpacity = validatedData.overlayOpacity !== null 
        ? new Prisma.Decimal(validatedData.overlayOpacity) 
        : null
    }
    if (validatedData.textColor !== undefined) processedData.textColor = validatedData.textColor || null
    
    // Call-to-Action fields
    if (validatedData.primaryButtonText !== undefined) processedData.primaryButtonText = validatedData.primaryButtonText || null
    if (validatedData.primaryButtonUrl !== undefined) processedData.primaryButtonUrl = validatedData.primaryButtonUrl || null
    if (validatedData.primaryButtonStyle !== undefined) processedData.primaryButtonStyle = validatedData.primaryButtonStyle || null
    if (validatedData.secondaryButtonText !== undefined) processedData.secondaryButtonText = validatedData.secondaryButtonText || null
    if (validatedData.secondaryButtonUrl !== undefined) processedData.secondaryButtonUrl = validatedData.secondaryButtonUrl || null
    if (validatedData.secondaryButtonStyle !== undefined) processedData.secondaryButtonStyle = validatedData.secondaryButtonStyle || null
    
    // Scheduling fields
    if (validatedData.showFrom !== undefined) {
      processedData.showFrom = validatedData.showFrom ? new Date(validatedData.showFrom) : null
    }
    if (validatedData.showUntil !== undefined) {
      processedData.showUntil = validatedData.showUntil ? new Date(validatedData.showUntil) : null
    }
    
    // Targeting fields
    if (validatedData.targetPages !== undefined) processedData.targetPages = validatedData.targetPages || []
    if (validatedData.targetAudience !== undefined) processedData.targetAudience = validatedData.targetAudience || []
    
    // SEO fields
    if (validatedData.altText !== undefined) processedData.altText = validatedData.altText || null
    if (validatedData.caption !== undefined) processedData.caption = validatedData.caption || null
    
    // Analytics fields (usually you wouldn't update these directly, but including for completeness)
    if (validatedData.viewCount !== undefined) processedData.viewCount = validatedData.viewCount
    if (validatedData.clickCount !== undefined) processedData.clickCount = validatedData.clickCount
    if (validatedData.conversionCount !== undefined) processedData.conversionCount = validatedData.conversionCount
    
    const heroSlide = await prisma.hero.update({
      where: { id },
      data: processedData
    })
    
    return NextResponse.json(heroSlide)
  } catch (error) {
    console.error('Failed to update hero slide:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A hero slide with this data already exists' },
          { status: 409 }
        )
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Hero slide not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update hero slide' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    await prisma.hero.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete hero slide:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Hero slide not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete hero slide' },
      { status: 500 }
    )
  }
}
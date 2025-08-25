import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const updateOfferSchema = z.object({
  businessUnitId: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  subtitle: z.string().optional(),
  description: z.string().min(1).optional(),
  shortDesc: z.string().optional(),
  type: z.enum(["EARLY_BIRD", "LAST_MINUTE", "SEASONAL", "PACKAGE", "LOYALTY", "GROUP", "CORPORATE"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED", "SCHEDULED"]).optional(),
  originalPrice: z.number().min(0).optional(),
  offerPrice: z.number().min(0.01).optional(),
  savingsPercent: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
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
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const offer = await prisma.specialOffer.findUnique({
      where: { id },
      include: {
        businessUnit: true
      }
    })
    
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(offer)
  } catch (error) {
    console.error('Failed to fetch offer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offer' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateOfferSchema.parse(body)
    
    // Map frontend field names to database field names based on the actual schema
    const processedData: Record<string, unknown> = {}
    
    // Map businessUnitId to businessUnit relation
    if (validatedData.businessUnitId) {
      processedData.businessUnit = {
        connect: { id: validatedData.businessUnitId }
      }
    }
    
    // Direct field mappings that exist in the schema
    if (validatedData.title !== undefined) processedData.title = validatedData.title
    if (validatedData.slug !== undefined) processedData.slug = validatedData.slug
    if (validatedData.subtitle !== undefined) processedData.subtitle = validatedData.subtitle
    if (validatedData.description !== undefined) processedData.description = validatedData.description
    if (validatedData.shortDesc !== undefined) processedData.shortDesc = validatedData.shortDesc
    if (validatedData.type !== undefined) processedData.type = validatedData.type
    if (validatedData.status !== undefined) processedData.status = validatedData.status
    if (validatedData.currency !== undefined) processedData.currency = validatedData.currency
    if (validatedData.isPublished !== undefined) processedData.isPublished = validatedData.isPublished
    if (validatedData.isFeatured !== undefined) processedData.isFeatured = validatedData.isFeatured
    if (validatedData.sortOrder !== undefined) processedData.sortOrder = validatedData.sortOrder
    if (validatedData.metaTitle !== undefined) processedData.metaTitle = validatedData.metaTitle
    if (validatedData.metaDescription !== undefined) processedData.metaDescription = validatedData.metaDescription
    if (validatedData.metaKeywords !== undefined) processedData.metaKeywords = validatedData.metaKeywords
    if (validatedData.viewCount !== undefined) processedData.viewCount = validatedData.viewCount
    if (validatedData.clickCount !== undefined) processedData.clickCount = validatedData.clickCount
    if (validatedData.bookingCount !== undefined) processedData.bookingCount = validatedData.bookingCount
    
    // Handle Decimal fields
    if (validatedData.originalPrice !== undefined) {
      processedData.originalPrice = validatedData.originalPrice ? new Prisma.Decimal(validatedData.originalPrice) : null
    }
    if (validatedData.offerPrice !== undefined) {
      processedData.offerPrice = new Prisma.Decimal(validatedData.offerPrice)
    }
    
    // Handle field name mappings based on available schema fields
    if (validatedData.savingsPercent !== undefined) processedData.savingsPercent = validatedData.savingsPercent
    if (validatedData.minNights !== undefined) processedData.minNights = validatedData.minNights
    if (validatedData.maxNights !== undefined) processedData.maxNights = validatedData.maxNights
    if (validatedData.minAdvanceBook !== undefined) processedData.minAdvanceBook = validatedData.minAdvanceBook
    if (validatedData.maxAdvanceBook !== undefined) processedData.maxAdvanceBook = validatedData.maxAdvanceBook
    if (validatedData.maxUses !== undefined) processedData.maxUses = validatedData.maxUses
    if (validatedData.maxUsesPerGuest !== undefined) processedData.maxPerGuest = validatedData.maxUsesPerGuest
    if (validatedData.promoCode !== undefined) processedData.promoCode = validatedData.promoCode
    if (validatedData.requiresPromoCode !== undefined) processedData.requiresCode = validatedData.requiresPromoCode
    if (validatedData.termsConditions !== undefined) processedData.termsConditions = validatedData.termsConditions
    
    // Handle date fields
    if (validatedData.validFrom) {
      processedData.validFrom = new Date(validatedData.validFrom)
    }
    if (validatedData.validTo) {
      processedData.validTo = new Date(validatedData.validTo)
    }
    
    // Handle array fields that exist in schema
    if (validatedData.inclusions !== undefined) processedData.inclusions = validatedData.inclusions
    if (validatedData.exclusions !== undefined) processedData.exclusions = validatedData.exclusions
    
    // Handle newly added fields
    if (validatedData.combinableWithOtherOffers !== undefined) processedData.combinableWithOtherOffers = validatedData.combinableWithOtherOffers
    if (validatedData.autoApply !== undefined) processedData.autoApply = validatedData.autoApply
    
    // REMOVED: Fields that don't exist in the schema
    // - blackoutDates (not in schema - this was already handled)
    
    const offer = await prisma.specialOffer.update({
      where: { id },
      data: processedData,
      include: {
        businessUnit: true
      }
    })
    
    return NextResponse.json(offer)
  } catch (error) {
    console.error('Failed to update offer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    await prisma.specialOffer.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete offer:', error)
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    )
  }
}
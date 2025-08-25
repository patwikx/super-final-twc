import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { OfferType, OfferStatus, Prisma } from '@prisma/client'

const createOfferSchema = z.object({
  businessUnitId: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  subtitle: z.string().optional(),
  description: z.string().min(1),
  shortDesc: z.string().optional(),
  // Fixed: Use nativeEnum instead of enum for Prisma enums
  type: z.nativeEnum(OfferType),
  status: z.nativeEnum(OfferStatus),
  originalPrice: z.number().min(0).optional(),
  offerPrice: z.number().min(0.01),
  savingsPercent: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  validFrom: z.string().min(1),
  validTo: z.string().min(1),
  minNights: z.number().int().min(1).optional(),
  maxNights: z.number().int().min(0).optional(),
  minAdvanceBook: z.number().int().min(0).optional(),
  maxAdvanceBook: z.number().int().min(0).optional(),
  // These might be single fields or JSON, not arrays - check your Prisma schema
  blackoutDates: z.array(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  termsConditions: z.string().optional(),
  promoCode: z.string().optional(),
  maxUses: z.number().int().min(0).optional(),
  // Fixed: Changed from maxUsesPerGuest to maxPerGuest to match Prisma model
  maxPerGuest: z.number().int().min(1).optional(),
  combinableWithOtherOffers: z.boolean().optional(),
  // Fixed: Changed from requiresPromoCode to requiresCode to match Prisma model
  requiresCode: z.boolean().optional(),
  autoApply: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  viewCount: z.number().int().min(0).optional(),
  clickCount: z.number().int().min(0).optional(),
  bookingCount: z.number().int().min(0).optional(),
  // Added missing fields from Prisma model
  videoUrl: z.string().url().optional(),
  bookingDeadline: z.string().optional(),
  stayPeriodFrom: z.string().optional(),
  stayPeriodTo: z.string().optional(),
  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),
  usesRemaining: z.number().int().min(0).optional(),
  isPinned: z.boolean().optional(),
  publishedAt: z.string().optional()
}).refine(
  (data) => new Date(data.validTo) > new Date(data.validFrom),
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUnitId = searchParams.get('businessUnitId');
    
    const where: Prisma.SpecialOfferWhereInput = {};
    if (businessUnitId) {
      where.businessUnitId = businessUnitId;
    }
    
    const offers = await prisma.specialOffer.findMany({
      where,
      include: {
        businessUnit: true,
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const responseData = offers.map(offer => {
        const { _count, ...rest } = offer;
        return {
            ...rest,
            reservationsCount: _count?.bookings ?? 0
        };
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching offers.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOfferSchema.parse(body);
    
    // Calculate savingsAmount if originalPrice and offerPrice are provided
    let savingsAmount: Prisma.Decimal | null = null;
    if (validatedData.originalPrice && validatedData.offerPrice) {
        savingsAmount = new Prisma.Decimal(validatedData.originalPrice - validatedData.offerPrice);
    }
    
    // Destructure to separate businessUnitId and array fields
    const { businessUnitId, blackoutDates, inclusions, exclusions, ...restOfValidatedData } = validatedData;

    // Prepare data for Prisma
    const dataToCreate: Prisma.SpecialOfferCreateInput = {
      ...restOfValidatedData,
      businessUnit: businessUnitId ? { connect: { id: businessUnitId } } : undefined,
      originalPrice: validatedData.originalPrice ? new Prisma.Decimal(validatedData.originalPrice) : null,
      offerPrice: new Prisma.Decimal(validatedData.offerPrice),
      savingsAmount: savingsAmount,
      validFrom: new Date(validatedData.validFrom),
      validTo: new Date(validatedData.validTo),
      // Handle optional date fields
      bookingDeadline: validatedData.bookingDeadline ? new Date(validatedData.bookingDeadline) : undefined,
      stayPeriodFrom: validatedData.stayPeriodFrom ? new Date(validatedData.stayPeriodFrom) : undefined,
      stayPeriodTo: validatedData.stayPeriodTo ? new Date(validatedData.stayPeriodTo) : undefined,
      publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : undefined,
    };

    // Handle array fields separately to avoid spread operator issues
    if (blackoutDates && blackoutDates.length > 0) {
      dataToCreate.blackoutDates = blackoutDates.map(date => new Date(date));
    }
    
    if (inclusions && inclusions.length > 0) {
      dataToCreate.inclusions = inclusions;
    }
    
    if (exclusions && exclusions.length > 0) {
      dataToCreate.exclusions = exclusions;
    }

    const offer = await prisma.specialOffer.create({
      data: dataToCreate,
      include: {
        businessUnit: true
      }
    });
    
    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Failed to create offer:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'An offer with this slug already exists.' },
                { status: 409 }
            );
        }
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the offer.' },
      { status: 500 }
    );
  }
}
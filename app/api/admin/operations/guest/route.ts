import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Updated Zod schema matching your actual Prisma Guest model
const createGuestSchema = z.object({
  // Foreign Key for the required relation
  businessUnitId: z.string().uuid("Business Unit is required"),

  // Personal Information
  title: z.string().optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  
  // Identification
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  idNumber: z.string().optional(),
  idType: z.string().optional(),
  
  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  
  // Guest Status
  vipStatus: z.boolean().optional(),
  loyaltyNumber: z.string().optional(),
  preferences: z.any().optional(), // JSON field
  notes: z.string().optional(),
  firstStayDate: z.string().optional(),
  lastStayDate: z.string().optional(),
  blacklistedAt: z.string().optional(),
  totalSpent: z.number().min(0).optional(),
  
  // Marketing Preferences
  marketingOptIn: z.boolean().optional(),
  source: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const businessUnitId = searchParams.get('businessUnitId')
    
    const where: Prisma.GuestWhereInput = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (businessUnitId) {
      where.businessUnitId = businessUnitId;
    }
    
    const guests = await prisma.guest.findMany({
      where,
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            reservations: true,
            stays: true,
            serviceRequests: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(guests)
  } catch (error) {
    console.error('Failed to fetch guests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createGuestSchema.parse(body)
    
    // Destructure to separate businessUnitId for relation connection
    const { businessUnitId, ...restOfData } = validatedData;

    // Prepare data for Prisma with proper date and decimal conversions
    const dataToCreate: Prisma.GuestCreateInput = {
      ...restOfData,
      businessUnit: {
        connect: { id: businessUnitId }
      },
      // Convert date strings to DateTime objects
      dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
      passportExpiry: validatedData.passportExpiry ? new Date(validatedData.passportExpiry) : null,
      firstStayDate: validatedData.firstStayDate ? new Date(validatedData.firstStayDate) : null,
      lastStayDate: validatedData.lastStayDate ? new Date(validatedData.lastStayDate) : null,
      blacklistedAt: validatedData.blacklistedAt ? new Date(validatedData.blacklistedAt) : null,
      // Convert number to Decimal for totalSpent
      totalSpent: validatedData.totalSpent ? new Prisma.Decimal(validatedData.totalSpent) : null,
    }
    
    const guest = await prisma.guest.create({
      data: dataToCreate,
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            reservations: true,
            stays: true,
            serviceRequests: true
          }
        }
      }
    })
    
    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('Failed to create guest:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A guest with this email already exists for this business unit.' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create guest' },
      { status: 500 }
    )
  }
}
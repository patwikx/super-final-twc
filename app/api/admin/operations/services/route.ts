import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma, ServiceCategory } from '@prisma/client'

// Zod schema updated to match the actual Service model in your Prisma schema
const createServiceSchema = z.object({
  businessUnitId: z.string().uuid("A business unit must be selected"),
  departmentId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Service name is required").max(200),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(ServiceCategory),
  
  // Pricing
  isChargeable: z.boolean().default(true),
  basePrice: z.number().min(0).default(0),
  
  // Operational details
  duration: z.number().int().min(0).optional().nullable(),
  requiresApproval: z.boolean().default(false),
  advanceNotice: z.number().int().min(0).optional().nullable(),
  
  // Availability
  isActive: z.boolean().default(true),
  availableHours: z.any().optional().nullable(), // For JSON fields
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessUnitId = searchParams.get('businessUnitId')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    
    const where: Prisma.ServiceWhereInput = {}
    
    if (businessUnitId) where.businessUnitId = businessUnitId
    if (category) where.category = category as ServiceCategory
    if (isActive !== null) where.isActive = isActive === 'true'
    
    const services = await prisma.service.findMany({
      where,
      include: {
        businessUnit: true,
        department: true,
        _count: {
          select: {
            requests: true // Corrected from serviceRequests
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('Failed to fetch services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createServiceSchema.parse(body)
    
    const { businessUnitId, departmentId, ...restOfData } = validatedData;

    // Prepare data for Prisma
    const dataToCreate: Prisma.ServiceCreateInput = {
      ...restOfData,
      basePrice: new Prisma.Decimal(validatedData.basePrice),
      businessUnit: { connect: { id: businessUnitId } },
      department: departmentId ? { connect: { id: departmentId } } : undefined,
    }
    
    const service = await prisma.service.create({
      data: dataToCreate,
      include: {
        businessUnit: true,
      }
    })
    
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Failed to create service:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A service with this name already exists for this property' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

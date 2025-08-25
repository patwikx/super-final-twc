import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma, RoomStatus, HousekeepingStatus } from '@prisma/client'

// Zod schema updated to match the latest Room model in your Prisma schema
const createRoomSchema = z.object({
  businessUnitId: z.string().uuid("Invalid Business Unit ID"),
  roomTypeId: z.string().uuid("Invalid Room Type ID"),
  roomNumber: z.string().min(1, "Room number is required").max(20),
  floor: z.number().int().optional().nullable(),
  wing: z.string().optional().nullable(),
  
  // Status
  status: z.nativeEnum(RoomStatus).default('AVAILABLE'),
  housekeeping: z.nativeEnum(HousekeepingStatus).default('CLEAN'),
  
  // Maintenance tracking
  lastCleaned: z.string().datetime().optional().nullable(),
  lastInspected: z.string().datetime().optional().nullable(),
  lastMaintenance: z.string().datetime().optional().nullable(),
  outOfOrderUntil: z.string().datetime().optional().nullable(),
  
  // Pricing
  currentRate: z.number().min(0).optional().nullable(),
  lastRateUpdate: z.string().datetime().optional().nullable(),
  
  // Additional information
  notes: z.string().optional().nullable(),
  specialFeatures: z.array(z.string()).optional(),
  
  // Status
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessUnitId = searchParams.get('businessUnitId')
    const roomTypeId = searchParams.get('roomTypeId')
    const status = searchParams.get('status')
    const floor = searchParams.get('floor')
    
    const where: Prisma.RoomWhereInput = {}
    
    if (businessUnitId) where.businessUnitId = businessUnitId
    if (roomTypeId) where.roomTypeId = roomTypeId
    if (status) where.status = status as RoomStatus
    if (floor) where.floor = parseInt(floor)
    
    const rooms = await prisma.room.findMany({
      where,
      include: {
        roomType: true,
        businessUnit: true,
      },
      orderBy: [
        { floor: 'asc' },
        { roomNumber: 'asc' }
      ]
    })
    
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createRoomSchema.parse(body)
    
    const { businessUnitId, roomTypeId, ...restOfData } = validatedData;

    // Prepare data for Prisma, matching the schema
    const dataToCreate: Prisma.RoomCreateInput = {
      ...restOfData,
      businessUnit: { connect: { id: businessUnitId } },
      roomType: { connect: { id: roomTypeId } },
      currentRate: validatedData.currentRate ? new Prisma.Decimal(validatedData.currentRate) : undefined,
    }
    
    const room = await prisma.room.create({
      data: dataToCreate,
      include: {
        roomType: true,
        businessUnit: true
      }
    })
    
    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Failed to create room:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A room with this number already exists for this property' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

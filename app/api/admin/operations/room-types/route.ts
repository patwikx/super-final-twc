import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Adjust path as needed
import { z } from 'zod'

// Import the enum from your Prisma schema
enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  VILLA = 'VILLA',
  PENTHOUSE = 'PENTHOUSE',
  FAMILY = 'FAMILY',
  ACCESSIBLE = 'ACCESSIBLE'
}

// Validation schemas
const createRoomTypeSchema = z.object({
  businessUnitId: z.string().uuid('Invalid business unit ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  displayName: z.string().min(1, 'Display name is required').max(150, 'Display name too long'),
  description: z.string().optional(),
  type: z.nativeEnum(RoomType),
  
  // Occupancy
  maxOccupancy: z.number().int().min(1).default(2),
  maxAdults: z.number().int().min(1).default(2),
  maxChildren: z.number().int().min(0).default(0),
  maxInfants: z.number().int().min(0).default(0),
  bedConfiguration: z.string().optional(),
  roomSize: z.number().positive().optional(),
  
  // Features
  hasBalcony: z.boolean().default(false),
  hasOceanView: z.boolean().default(false),
  hasPoolView: z.boolean().default(false),
  hasKitchenette: z.boolean().default(false),
  hasLivingArea: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  petFriendly: z.boolean().default(false),
  isAccessible: z.boolean().default(false),
  
  // Pricing
  baseRate: z.number().positive('Base rate must be positive'),
  extraPersonRate: z.number().positive().optional(),
  extraChildRate: z.number().positive().optional(),
  
  // Other
  floorPlan: z.string().url().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})

const querySchema = z.object({
  businessUnitId: z.string().uuid().optional(),
  type: z.nativeEnum(RoomType).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  includeInactive: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'displayName', 'baseRate', 'sortOrder', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// GET - Retrieve room types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    
    const {
      businessUnitId,
      type,
      isActive,
      includeInactive,
      page = 1,
      limit = 50,
      search,
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = query

    // Build where clause
    const where: {
      businessUnitId?: string;
      type?: RoomType;
      isActive?: boolean;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        displayName?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {}
    
    if (businessUnitId) {
      where.businessUnitId = businessUnitId
    }
    
    if (type) {
      where.type = type
    }
    
    // Handle active/inactive filtering
    if (isActive === 'true') {
      where.isActive = true
    } else if (isActive === 'false') {
      where.isActive = false
    } else if (includeInactive !== 'true') {
      // Default: only show active room types unless explicitly requested
      where.isActive = true
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query with pagination
    const [roomTypes, totalCount] = await Promise.all([
      prisma.roomType_Model.findMany({
        where,
        include: {
          businessUnit: {
            select: {
              id: true,
              name: true,
              displayName: true,
              propertyType: true
            }
          },
          images: {
            include: {
              image: {
                select: {
                  id: true,
                  originalUrl: true,
                  thumbnailUrl: true,
                  mediumUrl: true,
                  title: true,
                  altText: true
                }
              }
            },
            orderBy: { sortOrder: 'asc' }
          },
          amenities: {
            include: {
              amenity: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  icon: true,
                  isChargeable: true,
                  chargeAmount: true
                }
              }
            }
          },
          _count: {
            select: {
              rooms: true,
              reservationRooms: true,
              rates: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.roomType_Model.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      data: roomTypes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('GET /api/room-types error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch room types' },
      { status: 500 }
    )
  }
}

// POST - Create new room type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createRoomTypeSchema.parse(body)

    // Check if business unit exists
    const businessUnit = await prisma.businessUnit.findUnique({
      where: { id: validatedData.businessUnitId },
      select: { id: true, name: true }
    })

    if (!businessUnit) {
      return NextResponse.json(
        { error: 'Business unit not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name within the same business unit
    const existingRoomType = await prisma.roomType_Model.findFirst({
      where: {
        businessUnitId: validatedData.businessUnitId,
        name: validatedData.name
      }
    })

    if (existingRoomType) {
      return NextResponse.json(
        { error: 'Room type with this name already exists in this business unit' },
        { status: 409 }
      )
    }

    // Create the room type - convert numbers to Decimal strings
    const roomTypeData = {
      ...validatedData,
      // Convert Decimal fields to strings as required by Prisma
      roomSize: validatedData.roomSize ? validatedData.roomSize.toString() : null,
      baseRate: validatedData.baseRate.toString(),
      extraPersonRate: validatedData.extraPersonRate?.toString() || null,
      extraChildRate: validatedData.extraChildRate?.toString() || null,
    }

    const roomType = await prisma.roomType_Model.create({
      data: roomTypeData,
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
            propertyType: true
          }
        },
        images: {
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                title: true,
                altText: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                category: true,
                icon: true
              }
            }
          }
        },
        _count: {
          select: {
            rooms: true,
            reservationRooms: true
          }
        }
      }
    })

    return NextResponse.json(roomType, { status: 201 })
  } catch (error) {
    console.error('POST /api/room-types error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid room type data', details: error },
        { status: 400 }
      )
    }

    // Handle Prisma unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Room type with this name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create room type' },
      { status: 500 }
    )
  }
}
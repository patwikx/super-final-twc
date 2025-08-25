import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Zod schema aligned with the Prisma Event model
const createEventSchema = z.object({
  businessUnitId: z.string().uuid("Invalid Business Unit ID"),
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with dashes"),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().optional(),
  // Matched with EventType enum in schema.prisma
  type: z.enum(["WEDDING", "CONFERENCE", "MEETING", "WORKSHOP", "CELEBRATION", "CULTURAL", "SEASONAL", "ENTERTAINMENT", "CORPORATE", "PRIVATE"]),
  // Matched with EventStatus enum in schema.prisma
  status: z.enum(["PLANNING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "POSTPONED"]),
  category: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isMultiDay: z.boolean().optional(),
  venue: z.string().min(1, "Venue is required"),
  venueDetails: z.string().optional(), // Matched with schema
  venueCapacity: z.number().int().min(1).optional(),
  isFree: z.boolean().optional(),
  ticketPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  requiresBooking: z.boolean().optional(),
  maxAttendees: z.number().int().min(1).optional(),
  bookingCloseDate: z.string().datetime().optional(), // Matched with schema
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  hostName: z.string().optional(), // Matched with schema
  contactInfo: z.string().optional(), // Matched with schema
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUnitId = searchParams.get('businessUnitId');
    
    const where: Prisma.EventWhereInput = businessUnitId ? { businessUnitId } : {};
    
    const events = await prisma.event.findMany({
      where,
      include: {
        businessUnit: true,
        // Corrected relation name from 'eventRegistrations' to 'bookings'
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Rename _count.bookings for a clearer API response
    const responseData = events.map(event => {
        const { _count, ...rest } = event;
        return {
            ...rest,
            bookingsCount: _count?.bookings ?? 0
        };
    });
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching events.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEventSchema.parse(body);
    
    // Destructure to separate businessUnitId for relation connection
    const { businessUnitId, ...restOfData } = validatedData;

    // Prepare data for Prisma, converting types as needed
    const dataToCreate: Prisma.EventCreateInput = {
        ...restOfData,
        businessUnit: {
            connect: { id: businessUnitId }
        },
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        bookingCloseDate: validatedData.bookingCloseDate ? new Date(validatedData.bookingCloseDate) : undefined,
        ticketPrice: validatedData.ticketPrice ? new Prisma.Decimal(validatedData.ticketPrice) : undefined
    };
    
    const event = await prisma.event.create({
      data: dataToCreate,
      include: {
        businessUnit: true
      }
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'An event with this slug already exists.' },
                { status: 409 }
            );
        }
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the event.' },
      { status: 500 }
    );
  }
}

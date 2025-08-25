import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Zod schema for updating an event, with all fields optional
const updateEventSchema = z.object({
  businessUnitId: z.string().uuid("Invalid Business Unit ID").optional(),
  title: z.string().min(1, "Title is required").max(200).optional(),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with dashes").optional(),
  description: z.string().min(1, "Description is required").optional(),
  shortDesc: z.string().optional(),
  type: z.enum(["WEDDING", "CONFERENCE", "MEETING", "WORKSHOP", "CELEBRATION", "CULTURAL", "SEASONAL", "ENTERTAINMENT", "CORPORATE", "PRIVATE"]).optional(),
  status: z.enum(["PLANNING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "POSTPONED"]).optional(),
  category: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isMultiDay: z.boolean().optional(),
  venue: z.string().min(1, "Venue is required").optional(),
  venueDetails: z.string().optional(),
  venueCapacity: z.number().int().min(1).optional(),
  isFree: z.boolean().optional(),
  ticketPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  requiresBooking: z.boolean().optional(),
  maxAttendees: z.number().int().min(1).optional(),
  bookingCloseDate: z.string().datetime().optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  hostName: z.string().optional(),
  contactInfo: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// Interface for route parameters, keeping the Promise as requested
interface RouteParams {
  params: Promise<{ 
    id: string 
  }>
}

// Handler to get a single event by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        businessUnit: true,
        // Corrected relation name from 'eventRegistrations' to 'bookings'
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Rename _count.bookings for a clearer API response
    const { _count, ...rest } = event;
    const responseData = {
        ...rest,
        bookingsCount: _count?.bookings ?? 0
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the event.' },
      { status: 500 }
    );
  }
}

// Handler to update an event by ID
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);
    
    // Prepare data for Prisma, handling type conversions for fields that are present
    const dataToUpdate: Prisma.EventUpdateInput = {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        bookingCloseDate: validatedData.bookingCloseDate ? new Date(validatedData.bookingCloseDate) : undefined,
        ticketPrice: validatedData.ticketPrice !== undefined ? new Prisma.Decimal(validatedData.ticketPrice) : undefined,
    };
    
    const event = await prisma.event.update({
      where: { id },
      data: dataToUpdate,
      include: {
        businessUnit: true
      }
    });
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to update event:', error);
    
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
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Event not found.' },
                { status: 404 }
            );
        }
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the event.' },
      { status: 500 }
    );
  }
}

// Handler to delete an event by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    await prisma.event.delete({
      where: { id }
    });
    
    return new NextResponse(null, { status: 204 }); // 204 No Content is standard for successful deletion
  } catch (error) {
    console.error('Failed to delete event:', error);

     if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Event not found.' },
                { status: 404 }
            );
        }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the event.' },
      { status: 500 }
    );
  }
}

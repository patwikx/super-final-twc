import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Adjust import path as needed
import { z } from 'zod'
import { PropertyType } from '@prisma/client'

// Validation schema matching your form
const updatePropertySchema = z.object({
  name: z.string().min(1, "Internal name is required").optional(),
  displayName: z.string().min(1, "Display name is required").optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  city: z.string().min(1, "City is required").optional(),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be a valid URL slug").optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  primaryCurrency: z.string().optional(),
  secondaryCurrency: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  serviceFeeRate: z.number().min(0).max(1).optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  cancellationHours: z.number().min(0).max(168).optional(),
  maxAdvanceBooking: z.number().min(1).max(730).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET - Fetch property details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find property by ID or slug
    const property = await prisma.businessUnit.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        images: {
          include: {
            image: true
          },
          orderBy: [
            { context: 'asc' },
            { sortOrder: 'asc' }
          ]
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update property details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validatedData = updatePropertySchema.parse(body)

    // Check if property exists
    const existingProperty = await prisma.businessUnit.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if slug is unique (if being updated)
    if (validatedData.slug && validatedData.slug !== existingProperty.slug) {
      const slugExists = await prisma.businessUnit.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: existingProperty.id }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A property with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data (filter out undefined values)
    const updateData = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    )

    // Convert decimal fields if they exist
    if (updateData.taxRate !== undefined) {
      updateData.taxRate = updateData.taxRate
    }
    if (updateData.serviceFeeRate !== undefined) {
      updateData.serviceFeeRate = updateData.serviceFeeRate
    }
    if (updateData.latitude !== undefined) {
      updateData.latitude = updateData.latitude
    }
    if (updateData.longitude !== undefined) {
      updateData.longitude = updateData.longitude
    }

    // Update the property
    const updatedProperty = await prisma.businessUnit.update({
      where: { id: existingProperty.id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        images: {
          include: {
            image: true
          },
          orderBy: [
            { context: 'asc' },
            { sortOrder: 'asc' }
          ]
        }
      }
    })

    return NextResponse.json(updatedProperty)
  } catch (error) {
    console.error('Error updating property:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete property (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if property exists
    const existingProperty = await prisma.businessUnit.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if property has active reservations
    const activeReservations = await prisma.reservation.count({
      where: {
        businessUnitId: existingProperty.id,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN', 'PROVISIONAL']
        }
      }
    })

    if (activeReservations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete property with active reservations' },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    const deletedProperty = await prisma.businessUnit.update({
      where: { id: existingProperty.id },
      data: {
        isActive: false,
        isPublished: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Property deactivated successfully',
      property: deletedProperty 
    })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
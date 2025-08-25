import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Adjust import path as needed

// PATCH - Set image as primary for a specific context
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { id, imageId } = params
    const { context } = await request.json()

    if (!context) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      )
    }

    // Find property first
    const property = await prisma.businessUnit.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Find the business unit image relationship
    const businessUnitImage = await prisma.businessUnitImage.findFirst({
      where: {
        businessUnitId: property.id,
        imageId: imageId,
        context: context
      }
    })

    if (!businessUnitImage) {
      return NextResponse.json(
        { error: 'Image not found for this property and context' },
        { status: 404 }
      )
    }

    // Use transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // First, remove primary status from all images in this context
      await tx.businessUnitImage.updateMany({
        where: {
          businessUnitId: property.id,
          context: context
        },
        data: {
          isPrimary: false
        }
      })

      // Then set the specified image as primary
      await tx.businessUnitImage.update({
        where: {
          id: businessUnitImage.id
        },
        data: {
          isPrimary: true
        }
      })
    })

    // Fetch updated image data
    const updatedImage = await prisma.businessUnitImage.findUnique({
      where: {
        id: businessUnitImage.id
      },
      include: {
        image: true
      }
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Error setting primary image:', error)
    return NextResponse.json(
      { error: 'Failed to set primary image' },
      { status: 500 }
    )
  }
}
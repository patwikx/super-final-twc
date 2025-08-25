import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Adjust import path as needed
import { unlink } from 'fs/promises'
import { join } from 'path'

// DELETE - Remove image from property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { id, imageId } = params

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
        imageId: imageId
      },
      include: {
        image: true
      }
    })

    if (!businessUnitImage) {
      return NextResponse.json(
        { error: 'Image not found for this property' },
        { status: 404 }
      )
    }

    // Delete the file from disk
    try {
      const filepath = join(process.cwd(), 'public', 'uploads', 'properties', property.id, businessUnitImage.image.filename)
      await unlink(filepath)
    } catch (fileError) {
      console.warn('Could not delete file from disk:', fileError)
      // Continue with database cleanup even if file deletion fails
    }

    // If this was a primary image, make another image primary
    if (businessUnitImage.isPrimary) {
      const nextImage = await prisma.businessUnitImage.findFirst({
        where: {
          businessUnitId: property.id,
          context: businessUnitImage.context,
          imageId: { not: imageId }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      })

      if (nextImage) {
        await prisma.businessUnitImage.update({
          where: {
            id: nextImage.id
          },
          data: {
            isPrimary: true
          }
        })
      }
    }

    // Remove the business unit image relationship
    await prisma.businessUnitImage.delete({
      where: {
        id: businessUnitImage.id
      }
    })

    // Check if image is used elsewhere
    const otherUsages = await prisma.businessUnitImage.count({
      where: {
        imageId: imageId
      }
    })

    // If no other usages, delete the image record
    if (otherUsages === 0) {
      await prisma.image.delete({
        where: {
          id: imageId
        }
      })
    } else {
      // Just decrement usage count
      await prisma.image.update({
        where: {
          id: imageId
        },
        data: {
          usageCount: {
            decrement: 1
          }
        }
      })
    }

    return NextResponse.json({ 
      message: 'Image deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
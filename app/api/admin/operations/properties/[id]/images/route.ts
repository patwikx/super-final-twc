import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Adjust import path as needed
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { uuid } from 'zod'


// GET - Fetch all images for a property
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // Fetch images for the property
    const images = await prisma.businessUnitImage.findMany({
      where: {
        businessUnitId: property.id
      },
      include: {
        image: true
      },
      orderBy: [
        { context: 'asc' },
        { sortOrder: 'asc' }
      ]
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Upload new image for property
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const context = formData.get('context') as string || 'gallery'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileId = uuid()
    const extension = file.name.split('.').pop()
    const filename = `${fileId}.${extension}`
    const originalName = file.name

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'properties', property.id)
    await mkdir(uploadDir, { recursive: true })

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Get image dimensions (you might want to use a library like sharp for this)
    let width: number | undefined
    let height: number | undefined

    // For now, we'll leave dimensions undefined
    // In production, you should use a library like sharp to get actual dimensions

    // Create URLs
    const baseUrl = `/uploads/properties/${property.id}/${filename}`
    const originalUrl = baseUrl
    const thumbnailUrl = baseUrl // You might want to generate actual thumbnails
    const mediumUrl = baseUrl
    const largeUrl = baseUrl

    // Get next sort order for this context
    const lastImage = await prisma.businessUnitImage.findFirst({
      where: {
        businessUnitId: property.id,
        context: context
      },
      orderBy: {
        sortOrder: 'desc'
      }
    })

    const sortOrder = lastImage ? lastImage.sortOrder + 1 : 0

    // Check if this should be primary (first image of this context)
    const existingImages = await prisma.businessUnitImage.count({
      where: {
        businessUnitId: property.id,
        context: context
      }
    })

    const isPrimary = existingImages === 0

    // Create image record
    const imageRecord = await prisma.image.create({
      data: {
        filename: filename,
        originalName: originalName,
        mimeType: file.type,
        size: file.size,
        width: width,
        height: height,
        originalUrl: originalUrl,
        thumbnailUrl: thumbnailUrl,
        mediumUrl: mediumUrl,
        largeUrl: largeUrl,
        category: context === 'hero' ? 'PROPERTY_HERO' : 'PROPERTY_GALLERY',
        isProcessed: true,
        uploaderId: 'system', // You should get this from the authenticated user
        usageCount: 1
      }
    })

    // Link image to property
    const businessUnitImage = await prisma.businessUnitImage.create({
      data: {
        businessUnitId: property.id,
        imageId: imageRecord.id,
        context: context,
        sortOrder: sortOrder,
        isPrimary: isPrimary
      },
      include: {
        image: true
      }
    })

    return NextResponse.json(businessUnitImage)
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
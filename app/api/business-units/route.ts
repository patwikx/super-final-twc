import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Expanded Zod schema to include all fields from the BusinessUnit model
const createBusinessUnitSchema = z.object({
  // Core Information
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with dashes"),
  description: z.string().optional(),
  propertyType: z.enum(["HOTEL", "RESORT", "VILLA_COMPLEX", "APARTMENT_HOTEL", "BOUTIQUE_HOTEL"]),

  // Location & Contact
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().default("Philippines"),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Business Settings
  primaryCurrency: z.string().default("PHP"),
  secondaryCurrency: z.string().optional(),
  timezone: z.string().default("Asia/Manila"),
  locale: z.string().default("en"),
  taxRate: z.number().min(0).optional(),
  serviceFeeRate: z.number().min(0).optional(),

  // Branding & Media
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),

  // Operational Settings
  checkInTime: z.string().default("15:00"),
  checkOutTime: z.string().default("12:00"),
  cancellationHours: z.number().int().default(24),
  maxAdvanceBooking: z.number().int().default(365),

  // Website/CMS Settings
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),

  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),

  // Status
  isActive: z.boolean().default(true),
});

/**
 * @swagger
 * /api/admin/business-units:
 * get:
 * summary: Retrieves all active business units
 * description: Fetches a simplified list of all active business units for populating selection dropdowns.
 * tags: [Business Units]
 * responses:
 * 200:
 * description: A list of active business units.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const units = await prisma.businessUnit.findMany({
      select: {
        id: true,
        displayName: true,
        name: true,
        city: true,
        propertyType: true,
      },
      where: {
        isActive: true
      },
      orderBy: {
        displayName: 'asc'
      }
    });
    return NextResponse.json(units);
  } catch (error) {
    console.error('Failed to fetch business units:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching business units.' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/business-units:
 * post:
 * summary: Creates a new business unit
 * description: Adds a new business unit with comprehensive details to the database.
 * tags: [Business Units]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CreateBusinessUnit'
 * responses:
 * 201:
 * description: Business unit created successfully.
 * 400:
 * description: Validation error.
 * 409:
 * description: Conflict, a unit with the same name or slug already exists.
 * 500:
 * description: Internal server error.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createBusinessUnitSchema.parse(body);

        const newUnit = await prisma.businessUnit.create({
            data: validatedData
        });

        return NextResponse.json(newUnit, { status: 201 });

    } catch (error) {
        console.error('Failed to create business unit:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Unique constraint violation
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: 'A business unit with this name or slug already exists.' },
                    { status: 409 }
                );
            }
        }
        
        return NextResponse.json(
            { error: 'An unexpected error occurred while creating the business unit.' },
            { status: 500 }
        );
    }
}

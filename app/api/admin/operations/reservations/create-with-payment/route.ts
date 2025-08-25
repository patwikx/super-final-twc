import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymongo } from '@/lib/paymongo';
import { z } from 'zod';
import { CreateCheckoutSessionRequest, PayMongoResponse, CheckoutSessionAttributes } from '@/types/paymongo-types';

const bookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  adults: z.number().int().positive(),
  children: z.number().int().nonnegative(),
  totalAmount: z.number().positive(),
  nights: z.number().int().positive(),
  subtotal: z.number().positive(),
  taxes: z.number().nonnegative(),
  serviceFee: z.number().nonnegative(),
  businessUnitId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  // Optional special requests
  specialRequests: z.string().optional(),
  // Optional guest notes
  guestNotes: z.string().optional(),
});

type BookingRequest = z.infer<typeof bookingSchema>;

interface CreateReservationResponse {
  reservationId: string;
  confirmationNumber: string;
  checkoutUrl: string;
  paymentSessionId: string;
}

interface CreateReservationError {
  error: string;
  details?: string;
}

const generateConfirmationNumber = (): string => {
  const prefix = "RES";
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
};

export async function POST(req: NextRequest): Promise<NextResponse<CreateReservationResponse | CreateReservationError>> {
  try {
    const body: unknown = await req.json();
    const validatedData: BookingRequest = bookingSchema.parse(body);

    // Validate business unit exists and is active
    const businessUnit = await prisma.businessUnit.findUnique({
      where: { id: validatedData.businessUnitId },
      select: { 
        id: true, 
        isActive: true, 
        name: true,
        primaryCurrency: true 
      }
    });

    if (!businessUnit || !businessUnit.isActive) {
      return NextResponse.json({
        error: 'Invalid or inactive property',
        details: 'The selected property is not available for booking'
      }, { status: 400 });
    }

    // Validate room type exists and belongs to business unit
    const roomType = await prisma.roomType_Model.findUnique({
      where: { id: validatedData.roomTypeId },
      select: {
        id: true,
        businessUnitId: true,
        name: true,
        maxOccupancy: true,
        maxAdults: true,
        maxChildren: true,
        isActive: true,
        baseRate: true
      }
    });

    if (!roomType || !roomType.isActive || roomType.businessUnitId !== validatedData.businessUnitId) {
      return NextResponse.json({
        error: 'Invalid room type',
        details: 'The selected room type is not available'
      }, { status: 400 });
    }

    // Validate occupancy limits
    const totalGuests = validatedData.adults + validatedData.children;
    if (totalGuests > roomType.maxOccupancy) {
      return NextResponse.json({
        error: 'Occupancy exceeded',
        details: `Maximum ${roomType.maxOccupancy} guests allowed for this room type`
      }, { status: 400 });
    }

    if (validatedData.adults > roomType.maxAdults) {
      return NextResponse.json({
        error: 'Too many adults',
        details: `Maximum ${roomType.maxAdults} adults allowed for this room type`
      }, { status: 400 });
    }

    if (validatedData.children > roomType.maxChildren) {
      return NextResponse.json({
        error: 'Too many children',
        details: `Maximum ${roomType.maxChildren} children allowed for this room type`
      }, { status: 400 });
    }

    // Create reservation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find or create guest with the updated unique constraint
      let guest = await tx.guest.findUnique({
        where: { 
          businessUnitId_email: {
            businessUnitId: validatedData.businessUnitId,
            email: validatedData.email,
          }
        },
      });

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
            phone: validatedData.phone,
            businessUnitId: validatedData.businessUnitId,
            source: 'WEBSITE', // Track booking source
          },
        });
      } else {
        // Update guest info if changed
        guest = await tx.guest.update({
          where: { id: guest.id },
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone || guest.phone,
          }
        });
      }

      const confirmationNumber = generateConfirmationNumber();

      // Create reservation with updated schema structure
      const newReservation = await tx.reservation.create({
        data: {
          guestId: guest.id,
          businessUnitId: validatedData.businessUnitId,
          confirmationNumber,
          checkInDate: validatedData.checkInDate,
          checkOutDate: validatedData.checkOutDate,
          adults: validatedData.adults,
          children: validatedData.children,
          nights: validatedData.nights,
          subtotal: validatedData.subtotal,
          taxes: validatedData.taxes,
          serviceFee: validatedData.serviceFee,
          totalAmount: validatedData.totalAmount,
          currency: businessUnit.primaryCurrency || 'PHP',
          paymentStatus: 'PENDING',
          status: 'PENDING',
          source: 'WEBSITE',
          specialRequests: validatedData.specialRequests,
          guestNotes: validatedData.guestNotes,
          // Create associated reservation room with enhanced pricing breakdown
          rooms: {
            create: [{
              roomTypeId: validatedData.roomTypeId,
              baseRate: roomType.baseRate,
              discountedRate: validatedData.subtotal / validatedData.nights,
              nights: validatedData.nights,
              adults: validatedData.adults,
              children: validatedData.children,
              roomSubtotal: validatedData.subtotal,
              totalAmount: validatedData.subtotal,
            }]
          }
        },
        include: {
          guest: true,
          businessUnit: {
            select: { name: true, city: true, country: true }
          }
        }
      });

      return { reservation: newReservation, guest };
    });

    const { reservation } = result;

    // Create PayMongo checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // PayMongo amount should be in centavos (multiply by 100)
    const amountInCentavos = Math.round(validatedData.totalAmount * 100);
    
    const checkoutSessionRequest: CreateCheckoutSessionRequest = {
      send_email_receipt: true,
      show_description: true,
      show_line_items: true,
      line_items: [
        {
          currency: reservation.currency as 'PHP',
          amount: amountInCentavos,
          description: `${reservation.businessUnit.name} - ${validatedData.nights} night${validatedData.nights > 1 ? 's' : ''}`,
          name: `Booking Ref. (${reservation.confirmationNumber})`,
          quantity: 1,
        }
      ],
      payment_method_types: [
        'card',
        'paymaya',
        'gcash',
        'grab_pay',
        'billease',
        'dob',
        'dob_ubp',
        'brankas_bdo',
        'brankas_landbank',
        'brankas_metrobank'
      ],
      customer_email: validatedData.email,
      billing: {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        phone: validatedData.phone,
      },
      description: `Reservation ${reservation.confirmationNumber} - ${reservation.businessUnit.name}`,
      reference_number: reservation.confirmationNumber,
      metadata: {
        reservation_id: reservation.id,
        confirmation_number: reservation.confirmationNumber,
        business_unit_id: validatedData.businessUnitId,
        guest_id: reservation.guestId,
        guest_name: `${validatedData.firstName} ${validatedData.lastName}`,
        check_in: validatedData.checkInDate,
        check_out: validatedData.checkOutDate,
        adults: validatedData.adults.toString(),
        children: validatedData.children.toString(),
        nights: validatedData.nights.toString(),
        room_type_id: validatedData.roomTypeId,
      }
    };

    const checkoutSession: PayMongoResponse<CheckoutSessionAttributes> = await paymongo.createCheckoutSession(checkoutSessionRequest);

    // Update reservation with PayMongo session ID
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { 
        paymentIntentId: checkoutSession.data.id,
        paymentProvider: 'PAYMONGO'
      }
    });

    // Create comprehensive payment and PayMongo records
    await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        amount: validatedData.totalAmount,
        currency: reservation.currency,
        method: 'CARD', // Default, will be updated via webhook
        status: 'PENDING',
        provider: 'PAYMONGO',
        providerPaymentId: checkoutSession.data.id,
        
        // Enhanced breakdown using your schema
        roomTotal: validatedData.subtotal,
        taxesTotal: validatedData.taxes,
        feesTotal: validatedData.serviceFee,
        
        // Guest information at time of payment
        guestName: `${validatedData.firstName} ${validatedData.lastName}`,
        guestEmail: validatedData.email,
        guestPhone: validatedData.phone,
        
        // Deposit payment flag
        isDepositPayment: true,
        
        // PayMongo checkout session relationship
        checkoutSessions: {
          create: {
            sessionId: checkoutSession.data.id,
            url: checkoutSession.data.attributes.checkout_url,
            currency: reservation.currency,
            lineItems: [
              {
                currency: reservation.currency,
                amount: amountInCentavos,
                description: `${reservation.businessUnit.name} - ${validatedData.nights} night${validatedData.nights > 1 ? 's' : ''}`,
                name: `Booking Ref. (${reservation.confirmationNumber})`,
                quantity: 1,
              }
            ],
            successUrl: `${baseUrl}/booking/success?session_id=${checkoutSession.data.id}`,
            cancelUrl: `${baseUrl}/booking/cancel?session_id=${checkoutSession.data.id}`,
            customerEmail: validatedData.email,
            billingDetails: {
              name: `${validatedData.firstName} ${validatedData.lastName}`,
              email: validatedData.email,
              phone: validatedData.phone,
            },
            status: 'active',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            metadata: {
              reservation_id: reservation.id,
              confirmation_number: reservation.confirmationNumber,
            }
          }
        },
        
        // Create detailed line items for the payment
        lineItems: {
          create: [
            {
              itemType: 'ROOM',
              itemId: validatedData.roomTypeId,
              itemName: `${roomType.name} - ${validatedData.nights} night${validatedData.nights > 1 ? 's' : ''}`,
              description: `Room booking for ${validatedData.adults} adult${validatedData.adults > 1 ? 's' : ''}${validatedData.children > 0 ? ` and ${validatedData.children} child${validatedData.children > 1 ? 'ren' : ''}` : ''}`,
              unitPrice: validatedData.subtotal / validatedData.nights,
              quantity: validatedData.nights,
              totalAmount: validatedData.subtotal,
              validFrom: new Date(validatedData.checkInDate),
              validTo: new Date(validatedData.checkOutDate),
            },
            ...(validatedData.taxes > 0 ? [{
              itemType: 'TAX',
              itemName: 'Government Tax',
              description: 'Required government taxes and fees',
              unitPrice: validatedData.taxes,
              quantity: 1,
              totalAmount: validatedData.taxes,
              taxAmount: 0, // This is the tax itself
            }] : []),
            ...(validatedData.serviceFee > 0 ? [{
              itemType: 'FEE',
              itemName: 'Service Fee',
              description: 'Hotel service fee',
              unitPrice: validatedData.serviceFee,
              quantity: 1,
              totalAmount: validatedData.serviceFee,
            }] : [])
          ]
        }
      },
      include: {
        lineItems: true,
        checkoutSessions: true
      }
    });

    const response: CreateReservationResponse = {
      reservationId: reservation.id,
      confirmationNumber: reservation.confirmationNumber,
      checkoutUrl: checkoutSession.data.attributes.checkout_url,
      paymentSessionId: checkoutSession.data.id
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating reservation with PayMongo:', error);
    
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      
      return NextResponse.json({
        error: 'Validation failed',
        details: `Invalid data: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`
      }, { status: 400 });
    }
    
    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Failed to create reservation',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      error: 'Failed to create reservation',
      details: 'Unknown error occurred'
    }, { status: 500 });
  }
}
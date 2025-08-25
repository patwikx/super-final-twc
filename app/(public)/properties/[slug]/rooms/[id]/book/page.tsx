import { RoomBookingPage } from '@/app/(public)/properties/components/room-details/room-booking-page';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';


interface BookRoomPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: BookRoomPageProps) {
  const { id } = await params;
  
  const roomType = await prisma.roomType_Model.findUnique({
    where: { id },
    include: { 
      businessUnit: {
        select: { displayName: true }
      }
    }
  });

  if (!roomType) {
    return {
      title: 'Room Not Found',
    };
  }

  return {
    title: `Book ${roomType.displayName} - ${roomType.businessUnit.displayName} | Tropicana Worldwide`,
    description: `Complete your booking for ${roomType.displayName} at ${roomType.businessUnit.displayName}`,
    robots: 'noindex, nofollow', // Prevent indexing of booking pages
  };
}

export default async function BookRoomPage({ params }: BookRoomPageProps) {
  const { slug, id } = await params;
  
  // Fetch property data
  const propertyData = await prisma.businessUnit.findUnique({
    where: { 
      slug, 
      isPublished: true 
    },
    select: {
      id: true,
      displayName: true,
      slug: true,
      checkInTime: true,
      checkOutTime: true,
      cancellationHours: true,
      primaryCurrency: true,
      phone: true,
      email: true,
      isActive: true,
    }
  });

  if (!propertyData || !propertyData.isActive) {
    notFound();
  }

  // Fetch room type data
  const roomTypeData = await prisma.roomType_Model.findUnique({
    where: { 
      id,
      businessUnitId: propertyData.id,
      isActive: true 
    },
    select: {
      id: true,
      displayName: true,
      name: true,
      description: true,
      maxOccupancy: true,
      maxAdults: true,
      maxChildren: true,
      baseRate: true,
      isActive: true,
      businessUnitId: true,
    }
  });

  if (!roomTypeData) {
    notFound();
  }

  // Serialize the data to avoid hydration issues
  const property = JSON.parse(JSON.stringify(propertyData));
  const roomType = JSON.parse(JSON.stringify(roomTypeData));

  return (
    <div className="min-h-screen bg-gray-50">
      <RoomBookingPage 
        property={property} 
        roomType={roomType} 
      />
    </div>
  );
}
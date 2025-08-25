import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { RoomDetailsHero } from '../../../components/room-details/room-details-hero';
import { RoomDetailsContent } from '../../../components/room-details/room-details-content';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RoomGallery } from '../../../components/room-details/room-gallery';
//import { RoomBookingWidget } from '../../../components/room-details/room-booking-widget';

interface RoomDetailsPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: RoomDetailsPageProps) {
  const { id } = await params;
  
  const roomType = await prisma.roomType_Model.findUnique({
    where: { id },
    include: { businessUnit: true }
  });

  if (!roomType) {
    return {
      title: 'Room Not Found',
    };
  }

  return {
    title: `${roomType.displayName} - ${roomType.businessUnit.displayName} | Tropicana Worldwide`,
    description: roomType.description || `Experience luxury in our ${roomType.displayName}`,
  };
}

export default async function RoomDetailsPage({ params }: RoomDetailsPageProps) {
  const { slug, id } = await params;
  
  const propertyData = await prisma.businessUnit.findUnique({
    where: { slug, isPublished: true },
  });

  if (!propertyData) {
    notFound();
  }

  const roomTypeData = await prisma.roomType_Model.findUnique({
    where: { 
      id,
      businessUnitId: propertyData.id,
      isActive: true 
    },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        include: {
          image: true,
        },
      },
      businessUnit: true,
      rates: {
        where: { isActive: true },
        orderBy: { priority: 'asc' }
      },
      amenities: {
        include: {
          amenity: true
        }
      },
      _count: {
        select: { rooms: true }
      }
    }
  });

  if (!roomTypeData) {
    notFound();
  }

  // Serialize the data
  const property = JSON.parse(JSON.stringify(propertyData));
  const roomType = JSON.parse(JSON.stringify(roomTypeData));

  return (
    <div className="min-h-screen bg-white">
      <RoomDetailsHero property={property} roomType={roomType} />
      
      {/* Full width content section */}
      <div className="py-16">
        <RoomDetailsContent roomType={roomType} property={property} />
      </div>

      {/* Gallery section - can be full width or contained 
      <div className="container mx-auto px-6 py-16">
        <RoomGallery roomType={roomType} />
      </div>
*/}
      {/* Booking Widget - if you want to add it later as a floating/sticky element
      <div className="fixed bottom-8 right-8 z-50">
        <RoomBookingWidget property={property} roomType={roomType} />
      </div>
      */}
    </div>
  );
}
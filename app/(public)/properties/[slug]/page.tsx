import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PropertyHero } from '../components/property-details/property-hero';
import { PropertyOverview } from '../components/property-details/property-overview';
import { PropertyRooms } from '../components/property-details/property-room';
import { PropertyAmenities } from '../components/property-details/property-amenities';
import { PropertyLocation } from '../components/property-details/property-location';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const { slug } = await params;
  
  const property = await prisma.businessUnit.findUnique({
    where: { slug, isPublished: true },
  });

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `${property.displayName}`,
    description: property.shortDescription || property.longDescription,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  
  const propertyData = await prisma.businessUnit.findUnique({
    where: { slug, isPublished: true },
    include: {
      roomTypes: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { rooms: true }
          }
        }
      },
      amenities: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!propertyData) {
    notFound();
  }

  // Serialize the data
  const property = JSON.parse(JSON.stringify(propertyData));

  return (
    <div className="min-h-screen bg-white">
      <PropertyHero property={property} />
      <PropertyOverview property={property} />
      <PropertyRooms property={property} roomTypes={property.roomTypes} />
      <PropertyAmenities amenities={property.amenities} />
      <PropertyLocation property={property} />
    </div>
  );
}
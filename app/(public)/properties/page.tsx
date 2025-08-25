import { prisma } from '@/lib/prisma';
import { PropertiesHero } from './components/property-details/properties-hero';

import { PropertiesGrid } from './components/property-details/properties-grid';


export const metadata = {
  title: 'Our Properties | Tropicana Worldwide Corporation',
  description: 'Explore our collection of luxury hotels and resorts around the world.',
};

export default async function PropertiesPage() {
  const businessUnitsData = await prisma.businessUnit.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { rooms: true, roomTypes: true }
      }
    }
  });

  // Serialize the data
  const businessUnits = JSON.parse(JSON.stringify(businessUnitsData));

  return (
    <div className="min-h-screen bg-white">
      <PropertiesHero />
      <div className="container mx-auto px-6 py-16">
        <PropertiesGrid businessUnits={businessUnits} />
      </div>
    </div>
  );
}
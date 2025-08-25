// app/page.tsx

import { ContactSection } from '@/components/homepage/contact-section';
import { FAQSection } from '@/components/homepage/faqs-section';
import { HeroSection } from '@/components/homepage/hero-section';
import { SpecialOffersSection } from '@/components/homepage/offers-section';
import { BusinessUnitsSection } from '@/components/homepage/properties';
import { TestimonialsSection } from '@/components/homepage/testimonials-section';
import { prisma } from '@/lib/prisma';

// This is a Server Component for optimal performance
export default async function Home() {
  // ✅ **MODIFIED**: Fetch featured properties specifically for the HeroSection
  // This query now includes the necessary nested image data.
  const featuredPropertiesData = await prisma.businessUnit.findMany({
    where: { 
      isPublished: true,
      isFeatured: true // Filter for featured properties at the database level
    },
    orderBy: { sortOrder: 'asc' },
    include: {
      images: { // Include the junction table
        orderBy: {
          sortOrder: 'asc' // Ensure consistent image order
        },
        include: {
          image: true, // And include the actual Image model with URLs
        },
      },
    },
  });

  // Fetch data for the other homepage sections
  const businessUnitsData = await prisma.businessUnit.findMany({ 
    where: { isPublished: true }, 
    orderBy: { sortOrder: 'asc' },
    include: { 
      _count: { select: { rooms: true, roomTypes: true } },
      // ✅ We can also include the primary image here for the property list cards
      images: {
        where: { isPrimary: true },
        include: { image: true },
        take: 1
      }
    }
  });

  const websiteConfigData = await prisma.websiteConfiguration.findFirst();
const specialOffersData = await prisma.specialOffer.findMany({
  where: { isPublished: true, status: 'ACTIVE' },
  include: {
    images: { // Include the junction table
      orderBy: { sortOrder: 'asc' },
      include: {
        image: true, // And include the actual Image model with URLs
      },
    },
  },
});
  const testimonialsData = await prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  const faqsData = await prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  
  // Serialize all fetched data to make it safe for Client Components
  // Date objects and other non-plain objects are not serializable by default.
  const featuredProperties = JSON.parse(JSON.stringify(featuredPropertiesData));
  const businessUnits = JSON.parse(JSON.stringify(businessUnitsData));
  const websiteConfig = JSON.parse(JSON.stringify(websiteConfigData));
  const specialOffers = JSON.parse(JSON.stringify(specialOffersData));
  const testimonials = JSON.parse(JSON.stringify(testimonialsData));
  const faqs = JSON.parse(JSON.stringify(faqsData));

  return (
    <>
      {/* Pass the correctly fetched and typed data to the HeroSection */}
      <HeroSection featuredProperties={featuredProperties} />
      
      <section id="booking" className="py-12 bg-gray-50 relative z-20">
          <div className="container mx-auto px-4">
              {/* TODO: BookingWidget component will go here */}
          </div>
      </section>

      <BusinessUnitsSection businessUnits={businessUnits} />
      <SpecialOffersSection specialOffers={specialOffers} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <ContactSection websiteConfig={websiteConfig} />
    </>
  );
}
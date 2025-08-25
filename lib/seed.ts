/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma, PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌴 Starting Tropicana Worldwide Corporation database seed...')

  // Create default admin user
  const hashedPassword = await hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tropicana.com',
      username: 'admin',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+63912345678',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    }
  })

  console.log('✅ Created admin user')

  // Create default role and permissions
   
  const adminRole = await prisma.role.create({
    data: {
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access',
      isSystem: true,
    }
  })

  // Create Business Units
  const businessUnits = await Promise.all([
    prisma.businessUnit.create({
      data: {
        name: 'anchor-hotel',
        displayName: 'Anchor Hotel',
        description: 'Premium business hotel in the heart of Davao City',
        propertyType: 'HOTEL',
        address: '123 Rizal Street, Downtown',
        city: 'Davao City',
        state: 'Davao Region',
        country: 'Philippines',
        postalCode: '8000',
        phone: '+63 82 123 4567',
        email: 'reservations@anchorhotel.com',
        website: 'https://anchorhotel.tropicana.com',
        latitude: 7.0731,
        longitude: 125.6128,
        slug: 'anchor-hotel',
        shortDescription: 'Experience comfort and convenience at Anchor Hotel',
        longDescription: 'Located in the bustling heart of Davao City, Anchor Hotel offers modern amenities and exceptional service for business and leisure travelers.',
        isPublished: true,
        isFeatured: true,
        sortOrder: 1,
        metaTitle: 'Anchor Hotel Davao - Premium Business Hotel',
        metaDescription: 'Book your stay at Anchor Hotel, the premier business hotel in Davao City. Modern rooms, excellent service, and prime location.',
        createdBy: adminUser.id,
      }
    }),
    prisma.businessUnit.create({
      data: {
        name: 'dolores-farm-resort',
        displayName: 'Dolores Farm Resort',
        description: 'Eco-friendly farm resort surrounded by nature',
        propertyType: 'RESORT',
        address: 'Barangay Dolores, Talavera',
        city: 'Talavera',
        state: 'Nueva Ecija',
        country: 'Philippines',
        postalCode: '3114',
        phone: '+63 44 123 4567',
        email: 'info@doloresfarmresort.com',
        website: 'https://doloresfarmresort.tropicana.com',
        latitude: 15.5897,
        longitude: 120.9241,
        slug: 'dolores-farm-resort',
        shortDescription: 'Reconnect with nature at our sustainable farm resort',
        longDescription: 'Experience farm-to-table dining, organic agriculture, and peaceful countryside living at Dolores Farm Resort.',
        isPublished: true,
        isFeatured: true,
        sortOrder: 2,
        metaTitle: 'Dolores Farm Resort - Eco-Friendly Nature Retreat',
        metaDescription: 'Escape to Dolores Farm Resort for an authentic eco-friendly experience with farm-to-table dining and nature activities.',
        createdBy: adminUser.id,
      }
    }),
    prisma.businessUnit.create({
      data: {
        name: 'dolores-lake-resort',
        displayName: 'Dolores Lake Resort',
        description: 'Lakeside resort perfect for relaxation and water activities',
        propertyType: 'RESORT',
        address: 'Lakeshore Drive, Dolores',
        city: 'Dolores',
        state: 'Quezon',
        country: 'Philippines',
        postalCode: '4326',
        phone: '+63 42 123 4567',
        email: 'reservations@doloreslakeresort.com',
        website: 'https://doloreslakeresort.tropicana.com',
        latitude: 13.9442,
        longitude: 121.3207,
        slug: 'dolores-lake-resort',
        shortDescription: 'Lakeside paradise for the perfect getaway',
        longDescription: 'Enjoy water sports, fishing, and stunning lake views at our premier lakeside resort destination.',
        isPublished: true,
        isFeatured: true,
        sortOrder: 3,
        metaTitle: 'Dolores Lake Resort - Premier Lakeside Destination',
        metaDescription: 'Experience luxury lakeside living with water sports, fishing, and breathtaking views at Dolores Lake Resort.',
        createdBy: adminUser.id,
      }
    }),
    prisma.businessUnit.create({
      data: {
        name: 'dolores-tropicana-resort',
        displayName: 'Dolores Tropicana Resort',
        description: 'Tropical paradise with world-class amenities',
        propertyType: 'RESORT',
        address: 'Tropical Boulevard, Paradise Valley',
        city: 'Dolores',
        state: 'Batangas',
        country: 'Philippines',
        postalCode: '4200',
        phone: '+63 43 123 4567',
        email: 'info@dolorestropicana.com',
        website: 'https://dolorestropicana.tropicana.com',
        latitude: 13.7565,
        longitude: 121.0583,
        slug: 'dolores-tropicana-resort',
        shortDescription: 'Ultimate tropical paradise experience',
        longDescription: 'Immerse yourself in luxury at our flagship tropical resort featuring pristine beaches, world-class spa, and exceptional dining.',
        isPublished: true,
        isFeatured: true,
        sortOrder: 4,
        metaTitle: 'Dolores Tropicana Resort - Luxury Tropical Paradise',
        metaDescription: 'Discover paradise at Dolores Tropicana Resort with pristine beaches, luxury accommodations, and world-class amenities.',
        createdBy: adminUser.id,
      }
    }),
  ])

  console.log('✅ Created 4 business units')

  // Create amenities for each business unit
  const amenitiesData = [
    // Common amenities
    { name: 'Free Wi-Fi', category: 'Technology', icon: 'wifi' },
    { name: 'Air Conditioning', category: 'Comfort', icon: 'snowflake' },
    { name: 'Flat Screen TV', category: 'Entertainment', icon: 'tv' },
    { name: 'Mini Bar', category: 'Food & Beverage', icon: 'coffee' },
    { name: 'Room Service', category: 'Service', icon: 'bell' },
    { name: 'Safe Deposit Box', category: 'Security', icon: 'shield' },
    { name: 'Bathroom Amenities', category: 'Hygiene', icon: 'droplets' },
    { name: 'Daily Housekeeping', category: 'Service', icon: 'home' },
    { name: 'Balcony', category: 'Views', icon: 'sun' },
    { name: 'Work Desk', category: 'Business', icon: 'laptop' },
  ]

  // Create amenities for each business unit
  const allAmenities = []
  for (const businessUnit of businessUnits) {
    const businessUnitAmenities = await Promise.all(
      amenitiesData.map(amenity =>
        prisma.amenity.create({
          data: {
            ...amenity,
            businessUnitId: businessUnit.id,
          }
        })
      )
    )
    allAmenities.push(...businessUnitAmenities)
  }

  console.log('✅ Created amenities for all business units')

  // Create room types for each business unit
  const roomTypeNames = ['Standard', 'Deluxe', 'Suite', 'Family', 'Villa']
  const allRoomTypes = []

  for (const businessUnit of businessUnits) {
    const businessUnitRoomTypes = await Promise.all(
      roomTypeNames.map((name, index) =>
        prisma.roomType_Model.create({
          data: {
            businessUnitId: businessUnit.id,
            name: name.toLowerCase().replace(' ', '-'),
            displayName: `${name} Room`,
            description: `Comfortable ${name.toLowerCase()} room with modern amenities`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: name.toUpperCase() as any,
            maxOccupancy: index < 2 ? 2 : index === 3 ? 4 : 3,
            maxAdults: index < 2 ? 2 : index === 3 ? 4 : 3,
            maxChildren: index === 3 ? 2 : 1,
            bedConfiguration: index < 2 ? '1 Queen Bed' : index === 3 ? '2 Queen Beds' : '1 King Bed',
            roomSize: new Prisma.Decimal(index < 2 ? 25 : index === 3 ? 45 : 35),
            hasOceanView: businessUnit.name.includes('lake') || businessUnit.name.includes('tropicana'),
            hasBalcony: index > 1,
            baseRate: new Prisma.Decimal((index + 1) * 2500 + (businessUnit.name.includes('hotel') ? 1000 : 0)),
            extraPersonRate: new Prisma.Decimal(500),
            extraChildRate: new Prisma.Decimal(300),
            sortOrder: index,
          }
        })
      )
    )
    allRoomTypes.push(...businessUnitRoomTypes)
  }

  console.log('✅ Created room types for all business units')

  // Create rooms (5 per business unit)
  const allRooms = []
  for (let buIndex = 0; buIndex < businessUnits.length; buIndex++) {
    const businessUnit = businessUnits[buIndex]
    const buRoomTypes = allRoomTypes.slice(buIndex * 5, (buIndex + 1) * 5)
    
    for (let roomIndex = 0; roomIndex < 5; roomIndex++) {
      const room = await prisma.room.create({
        data: {
          businessUnitId: businessUnit.id,
          roomTypeId: buRoomTypes[roomIndex].id,
          roomNumber: `${(buIndex + 1)}0${roomIndex + 1}`,
          floor: Math.floor(roomIndex / 2) + 1,
          wing: roomIndex % 2 === 0 ? 'East' : 'West',
          status: 'AVAILABLE',
          housekeeping: 'CLEAN',
          currentRate: buRoomTypes[roomIndex].baseRate,
          lastRateUpdate: new Date(),
        }
      })
      allRooms.push(room)
    }
  }

  console.log('✅ Created 20 rooms (5 per business unit)')

  // Link amenities to room types
  for (let buIndex = 0; buIndex < businessUnits.length; buIndex++) {
    const buAmenities = allAmenities.slice(buIndex * 10, (buIndex + 1) * 10)
    const buRoomTypes = allRoomTypes.slice(buIndex * 5, (buIndex + 1) * 5)
    
    for (const roomType of buRoomTypes) {
      // Each room type gets 6-8 amenities
      const amenityCount = 6 + Math.floor(Math.random() * 3)
      const selectedAmenities = buAmenities.slice(0, amenityCount)
      
      await Promise.all(
        selectedAmenities.map(amenity =>
          prisma.roomTypeAmenity.create({
            data: {
              roomTypeId: roomType.id,
              amenityId: amenity.id,
            }
          })
        )
      )
    }
  }

  console.log('✅ Linked amenities to room types')

  // Note: I see the issue - SpecialOffer model requires businessUnitId in your schema
  // If you want truly global offers, you'll need to modify the SpecialOffer model to make businessUnitId optional
  // For now, I'll create offers but note they should be global
  
  // Create Global Special Offers (Note: these should be global, not tied to specific business units)
  // You may want to modify your SpecialOffer model to make businessUnitId optional for global offers
  const specialOffers = await Promise.all([
    prisma.specialOffer.create({
      data: {
        businessUnitId: businessUnits[0].id, // TEMP: This should be nullable for global offers
        title: 'Early Bird Special - All Properties',
        slug: 'early-bird-special-global',
        subtitle: 'Save 25% on your next stay at any Tropicana property',
        description: 'Book 30 days in advance and save 25% on all room types across ALL Tropicana properties - Anchor Hotel, Dolores Farm Resort, Lake Resort, and Tropicana Resort.',
        shortDesc: 'Save 25% with early booking across all properties',
        type: 'EARLY_BIRD',
        status: 'ACTIVE',
        originalPrice: new Prisma.Decimal(5000),
        offerPrice: new Prisma.Decimal(3750),
        savingsPercent: 25,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        minNights: 2,
        minAdvanceBook: 30,
        inclusions: ['Free breakfast', 'Welcome drink', 'Late checkout', 'Valid at all properties'],
        exclusions: ['Peak season dates', 'Special events'],
        termsConditions: 'Subject to availability. Valid across all Tropicana properties. Cannot be combined with other offers.',
        isPublished: true,
        isFeatured: true,
        sortOrder: 1,
        metaTitle: 'Early Bird Special - Save 25% | All Tropicana Properties',
        metaDescription: 'Book early and save 25% on your stay at any Tropicana property. Includes free breakfast and welcome drink.',
      }
    }),
    prisma.specialOffer.create({
      data: {
        businessUnitId: businessUnits[1].id, // TEMP: Should be null for global
        title: 'Summer Escape Package - Multi-Property',
        slug: 'summer-escape-package-global',
        subtitle: 'Perfect summer getaway with exclusive perks',
        description: 'Enjoy the ultimate summer experience with complimentary activities, dining credits, and spa treatments across our resort properties.',
        shortDesc: 'Complete summer package with activities',
        type: 'SEASONAL',
        status: 'ACTIVE',
        offerPrice: new Prisma.Decimal(12000),
        validFrom: new Date(),
        validTo: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        minNights: 3,
        inclusions: ['All meals', 'Water sports', 'Spa treatment', 'Airport transfer', 'Valid at resort properties'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 2,
        metaTitle: 'Summer Escape Package | All Tropicana Resorts',
        metaDescription: 'Ultimate summer package including meals, activities, and spa treatments at any Tropicana Resort.',
      }
    }),
    prisma.specialOffer.create({
      data: {
        businessUnitId: businessUnits[2].id, // TEMP: Should be null for global
        title: 'Romantic Getaway - Any Property',
        slug: 'romantic-getaway-global',
        subtitle: 'Perfect for couples seeking intimacy',
        description: 'Celebrate love with our romantic package featuring private dining, couples spa, and sunset experiences. Available at all Tropicana properties.',
        shortDesc: 'Romantic package for couples',
        type: 'PACKAGE',
        status: 'ACTIVE',
        offerPrice: new Prisma.Decimal(8500),
        validFrom: new Date(),
        validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        minNights: 2,
        inclusions: ['Private dining', 'Couples massage', 'Champagne', 'Room decoration', 'Valid at all properties'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 3,
        metaTitle: 'Romantic Getaway Package | Any Tropicana Property',
        metaDescription: 'Romantic couples package with private dining, spa treatments, and exclusive experiences.',
      }
    }),
  ])

  console.log('✅ Created special offers')

  // Create Global Events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        businessUnitId: businessUnits[0].id,
        title: 'Tropicana Food Festival',
        slug: 'tropicana-food-festival',
        description: 'A celebration of Filipino cuisine featuring renowned chefs and local delicacies from across the archipelago.',
        shortDesc: 'Celebrating Filipino cuisine and culture',
        type: 'CULTURAL',
        status: 'CONFIRMED',
        category: ['Food', 'Culture', 'Entertainment'],
        tags: ['filipino-cuisine', 'festival', 'cultural-event'],
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '22:00',
        isMultiDay: true,
        venue: 'Main Resort Grounds',
        venueCapacity: 500,
        isFree: false,
        ticketPrice: new Prisma.Decimal(1500),
        requiresBooking: true,
        maxAttendees: 500,
        isPublished: true,
        isFeatured: true,
        sortOrder: 1,
        metaTitle: 'Tropicana Food Festival - Celebrate Filipino Cuisine',
        metaDescription: 'Join us for a 3-day celebration of Filipino cuisine featuring renowned chefs and traditional delicacies.',
      }
    }),
    prisma.event.create({
      data: {
        businessUnitId: businessUnits[3].id,
        title: 'Beach Volleyball Tournament',
        slug: 'beach-volleyball-tournament',
        description: 'Annual beach volleyball competition open to all skill levels with prizes and entertainment.',
        shortDesc: 'Annual beach volleyball competition',
        type: 'ENTERTAINMENT',
        status: 'CONFIRMED',
        category: ['Sports', 'Competition', 'Beach'],
        tags: ['volleyball', 'beach-sports', 'tournament'],
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 47 * 24 * 60 * 60 * 1000),
        startTime: '08:00',
        endTime: '18:00',
        isMultiDay: true,
        venue: 'Beach Courts',
        venueCapacity: 200,
        isFree: true,
        requiresBooking: true,
        maxAttendees: 200,
        isPublished: true,
        isFeatured: true,
        sortOrder: 2,
        metaTitle: 'Beach Volleyball Tournament | Tropicana',
        metaDescription: 'Join our annual beach volleyball tournament with prizes and entertainment for all skill levels.',
      }
    }),
    prisma.event.create({
      data: {
        businessUnitId: businessUnits[1].id,
        title: 'Organic Farming Workshop',
        slug: 'organic-farming-workshop',
        description: 'Learn sustainable farming techniques and organic agriculture practices from expert farmers.',
        shortDesc: 'Learn organic farming techniques',
        type: 'WORKSHOP',
        status: 'CONFIRMED',
        category: ['Education', 'Agriculture', 'Sustainability'],
        tags: ['organic-farming', 'sustainability', 'workshop'],
        startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startTime: '09:00',
        endTime: '16:00',
        venue: 'Farm Learning Center',
        venueCapacity: 30,
        isFree: false,
        ticketPrice: new Prisma.Decimal(800),
        requiresBooking: true,
        maxAttendees: 30,
        includes: ['Learning materials', 'Lunch', 'Take-home plants'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 3,
        metaTitle: 'Organic Farming Workshop | Dolores Farm Resort',
        metaDescription: 'Learn sustainable farming and organic agriculture from expert farmers in our hands-on workshop.',
      }
    }),
  ])

  console.log('✅ Created global events')

  // Create Global Testimonials
  const testimonials = await Promise.all([
    prisma.testimonial.create({
      data: {
        guestName: 'Maria Santos',
        guestTitle: 'Travel Blogger',
        guestCountry: 'Philippines',
        content: 'My stay at Tropicana resorts exceeded all expectations. The staff\'s attention to detail and the breathtaking views made our anniversary celebration unforgettable.',
        rating: 5,
        source: 'TripAdvisor',
        isActive: true,
        isFeatured: true,
        scope: 'GLOBAL',
        sortOrder: 1,
        stayDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reviewDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.testimonial.create({
      data: {
        guestName: 'James Wilson',
        guestTitle: 'Business Executive',
        guestCountry: 'Australia',
        content: 'Anchor Hotel provided the perfect blend of business amenities and comfort. The location is excellent and the service is world-class.',
        rating: 5,
        source: 'Google Reviews',
        isActive: true,
        isFeatured: true,
        scope: 'GLOBAL',
        sortOrder: 2,
        stayDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        reviewDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.testimonial.create({
      data: {
        guestName: 'Lin Zhang',
        guestTitle: 'Family Traveler',
        guestCountry: 'Singapore',
        content: 'The farm resort experience was magical for our family. Kids loved the organic gardens and farm animals, while we enjoyed the peaceful atmosphere.',
        rating: 5,
        source: 'Facebook',
        isActive: true,
        isFeatured: true,
        scope: 'GLOBAL',
        sortOrder: 3,
        stayDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        reviewDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      }
    }),
  ])

  console.log('✅ Created global testimonials')

  // Create Website Configuration
  await prisma.websiteConfiguration.create({
    data: {
      siteName: 'Tropicana Worldwide Corporation',
      tagline: 'Discover Paradise Across the Philippines',
      description: 'Experience world-class hospitality at our collection of premium hotels and resorts across the beautiful Philippines.',
      companyName: 'Tropicana Worldwide Corporation',
      primaryColor: '#0066CC',
      secondaryColor: '#00AA44',
      accentColor: '#FF6B35',
      defaultMetaTitle: 'Tropicana Worldwide Corporation - Premium Hotels & Resorts Philippines',
      defaultMetaDescription: 'Discover luxury accommodations at Tropicana\'s collection of premium hotels and resorts across the Philippines.',
      facebookUrl: 'https://facebook.com/tropicana',
      instagramUrl: 'https://instagram.com/tropicana',
      primaryPhone: '+63 2 123 4567',
      primaryEmail: 'info@tropicana.com',
      bookingEmail: 'reservations@tropicana.com',
      supportEmail: 'support@tropicana.com',
      headquarters: 'Makati City, Metro Manila, Philippines',
      enableOnlineBooking: true,
      enableReviews: true,
      enableNewsletter: true,
      enableBlog: true,
      enableMultiProperty: true,
    }
  })

  console.log('✅ Created website configuration')

  // Create sample content items
  await Promise.all([
    prisma.contentItem.create({
      data: {
        key: 'homepage_welcome',
        section: 'homepage',
        name: 'Welcome Message',
        description: 'Main welcome message for homepage',
        content: 'Welcome to Tropicana Worldwide Corporation - where paradise meets luxury across the beautiful Philippines.',
        contentType: 'TEXT',
        scope: 'GLOBAL',
        locale: 'en',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: adminUser.id,
      }
    }),
    prisma.contentItem.create({
      data: {
        key: 'about_company',
        section: 'about',
        name: 'About Tropicana',
        description: 'Company description for about page',
        content: 'Founded with a passion for exceptional hospitality, Tropicana Worldwide Corporation operates a collection of premium hotels and resorts that showcase the best of Filipino hospitality and natural beauty.',
        contentType: 'TEXT',
        scope: 'GLOBAL',
        locale: 'en',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: adminUser.id,
      }
    }),
  ])

  console.log('✅ Created content items')

  // Create FAQs
  await Promise.all([
    prisma.fAQ.create({
      data: {
        question: 'What is included in the room rate?',
        answer: 'Our room rates include daily housekeeping, Wi-Fi access, use of fitness facilities, and basic amenities. Breakfast and other meals may vary by property and package selected.',
        category: 'Reservations',
        scope: 'GLOBAL',
        isActive: true,
        sortOrder: 1,
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'What is your cancellation policy?',
        answer: 'Cancellation policies vary by property and rate. Generally, standard rates allow cancellation up to 24 hours before arrival. Special promotional rates may have different terms.',
        category: 'Reservations',
        scope: 'GLOBAL',
        isActive: true,
        sortOrder: 2,
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Do you offer airport transfers?',
        answer: 'Yes, most of our properties offer airport transfer services. Please contact the specific property or mention this in your reservation request for arrangements and pricing.',
        category: 'Services',
        scope: 'GLOBAL',
        isActive: true,
        sortOrder: 3,
      }
    }),
  ])

  console.log('✅ Created FAQs')

  // Create Hero sections
  const heroes = await Promise.all([
    prisma.hero.create({
      data: {
        title: 'Discover Paradise Across the Philippines',
        subtitle: 'Experience world-class hospitality at Tropicana Worldwide Corporation',
        description: 'From bustling city hotels to tranquil lakeside resorts and tropical paradises, find your perfect escape at our collection of premium properties.',
        buttonText: 'Explore Our Properties',
        buttonUrl: '/properties',
        backgroundImage: '/images/hero/tropicana-main-hero.jpg',
        isActive: true,
        isFeatured: true,
        sortOrder: 1,
        displayType: 'fullscreen',
        textAlignment: 'center',
        overlayColor: '#000000',
        overlayOpacity: new Prisma.Decimal(0.3),
        textColor: 'white',
        primaryButtonText: 'Book Your Stay',
        primaryButtonUrl: '/reservations',
        primaryButtonStyle: 'primary',
        secondaryButtonText: 'View Properties',
        secondaryButtonUrl: '/properties',
        secondaryButtonStyle: 'secondary',
        targetPages: ['homepage'],
        targetAudience: ['all'],
        altText: 'Stunning view of Tropicana resort with crystal clear waters and tropical landscape',
      }
    }),
    prisma.hero.create({
      data: {
        title: 'Special Offers & Packages',
        subtitle: 'Save big on your next tropical getaway',
        description: 'Take advantage of our exclusive deals and packages for an unforgettable experience.',
        buttonText: 'View All Offers',
        buttonUrl: '/offers',
        backgroundImage: '/images/hero/special-offers-hero.jpg',
        isActive: true,
        isFeatured: false,
        sortOrder: 2,
        displayType: 'banner',
        textAlignment: 'left',
        overlayColor: '#0066CC',
        overlayOpacity: new Prisma.Decimal(0.7),
        textColor: 'white',
        primaryButtonText: 'Browse Deals',
        primaryButtonUrl: '/offers',
        primaryButtonStyle: 'primary',
        targetPages: ['offers', 'homepage'],
        targetAudience: ['all'],
        altText: 'Luxury resort amenities showcasing special package offerings',
      }
    }),
    prisma.hero.create({
      data: {
        title: 'Upcoming Events & Experiences',
        subtitle: 'Join us for unforgettable cultural and recreational activities',
        description: 'From food festivals to beach tournaments, discover exciting events happening across our properties.',
        buttonText: 'See Events',
        buttonUrl: '/events',
        backgroundImage: '/images/hero/events-hero.jpg',
        isActive: true,
        isFeatured: false,
        sortOrder: 3,
        displayType: 'banner',
        textAlignment: 'center',
        overlayColor: '#00AA44',
        overlayOpacity: new Prisma.Decimal(0.5),
        textColor: 'white',
        primaryButtonText: 'View Events',
        primaryButtonUrl: '/events',
        primaryButtonStyle: 'primary',
        targetPages: ['events', 'homepage'],
        targetAudience: ['all'],
        altText: 'Exciting events and activities at Tropicana properties',
      }
    }),
  ])

  console.log('✅ Created hero sections')

  // Create Promos and Vouchers
  const promos = await Promise.all([
    prisma.promo.create({
      data: {
        code: 'WELCOME15',
        title: 'Welcome New Guests',
        description: '15% discount for first-time bookers at any Tropicana property',
        type: 'PERCENTAGE_DISCOUNT',
        status: 'ACTIVE',
        discountValue: new Prisma.Decimal(15),
        maxDiscountAmount: new Prisma.Decimal(2000),
        minOrderAmount: new Prisma.Decimal(5000),
        maxUses: 1000,
        maxUsesPerUser: 1,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        minNights: 1,
        requiresNewCustomer: true,
        validDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
        terms: 'Valid for first-time guests only. Cannot be combined with other offers.',
        isPublic: true,
        isFeatured: true,
        priority: 1,
        createdBy: adminUser.id,
      }
    }),
    prisma.promo.create({
      data: {
        code: 'STAYMORE',
        title: 'Extended Stay Discount',
        description: 'Get ₱1,000 off when you book 5 or more nights',
        type: 'FIXED_AMOUNT_DISCOUNT',
        status: 'ACTIVE',
        discountValue: new Prisma.Decimal(1000),
        minOrderAmount: new Prisma.Decimal(10000),
        maxUses: null, // unlimited
        maxUsesPerUser: 5,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        minNights: 5,
        combinableWithOffers: true,
        terms: 'Valid for stays of 5 nights or more. Can be used multiple times.',
        isPublic: true,
        priority: 2,
        createdBy: adminUser.id,
      }
    }),
    prisma.promo.create({
      data: {
        code: 'WEEKEND50',
        title: 'Weekend Getaway',
        description: '₱500 off weekend stays',
        type: 'FIXED_AMOUNT_DISCOUNT',
        status: 'ACTIVE',
        discountValue: new Prisma.Decimal(500),
        minOrderAmount: new Prisma.Decimal(3000),
        maxUses: 200,
        maxUsesPerUser: 2,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        minNights: 2,
        validDays: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: true,
          saturday: true,
          sunday: true,
        },
        terms: 'Valid for Friday to Sunday stays only.',
        isPublic: true,
        priority: 3,
        createdBy: adminUser.id,
      }
    }),
  ])

  console.log('✅ Created promos')

  // Create sample vouchers
  const vouchers = await Promise.all([
    prisma.promoVoucher.create({
      data: {
        voucherCode: 'GIFT-001-2024',
        promoId: promos[0].id,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        maxUses: 1,
        assignedToEmail: 'gift.recipient@example.com',
        assignedToName: 'Gift Recipient',
        assignedBy: adminUser.id,
        purchaseAmount: new Prisma.Decimal(5000),
        purchasedBy: adminUser.id,
        purchasedAt: new Date(),
        notes: 'Gift voucher for anniversary celebration',
      }
    }),
    // Standalone voucher (not linked to promo)
    prisma.promoVoucher.create({
      data: {
        voucherCode: 'COMP-STAY-2024',
        title: 'Complimentary Stay Voucher',
        description: 'Free 2-night stay at any Tropicana property',
        discountType: 'FIXED_AMOUNT_DISCOUNT',
        discountValue: new Prisma.Decimal(10000),
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxUses: 1,
        assignedToEmail: 'vip.guest@example.com',
        assignedToName: 'VIP Guest',
        assignedBy: adminUser.id,
        notes: 'Complimentary voucher for VIP guest',
        internalNotes: 'Issued due to previous service issue',
      }
    }),
    prisma.promoVoucher.create({
      data: {
        voucherCode: 'LOYALTY-REWARD-2024',
        title: 'Loyalty Member Reward',
        description: '20% discount for loyal customers',
        discountType: 'PERCENTAGE_DISCOUNT',
        discountValue: new Prisma.Decimal(20),
        maxDiscountAmount: new Prisma.Decimal(3000),
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        maxUses: 1,
        assignedToEmail: 'loyal.customer@example.com',
        assignedToName: 'Loyal Customer',
        assignedBy: adminUser.id,
        notes: 'Loyalty program reward voucher',
      }
    }),
  ])

  console.log('✅ Created vouchers')

  // Create sample email templates
  await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'booking_confirmation',
        subject: 'Booking Confirmation - {{propertyName}}',
        htmlContent: `
          <h1>Thank you for your reservation!</h1>
          <p>Dear {{guestName}},</p>
          <p>Your booking at {{propertyName}} has been confirmed.</p>
          <p><strong>Confirmation Number:</strong> {{confirmationNumber}}</p>
          <p><strong>Check-in:</strong> {{checkInDate}}</p>
          <p><strong>Check-out:</strong> {{checkOutDate}}</p>
          <p>We look forward to welcoming you!</p>
        `,
        textContent: 'Thank you for your reservation! Your booking at {{propertyName}} has been confirmed. Confirmation: {{confirmationNumber}}',
        variables: ['guestName', 'propertyName', 'confirmationNumber', 'checkInDate', 'checkOutDate'],
        category: 'reservations',
        locale: 'en',
        isActive: true,
      }
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'welcome_email',
        subject: 'Welcome to Tropicana - {{guestName}}',
        htmlContent: `
          <h1>Welcome to Tropicana Worldwide Corporation!</h1>
          <p>Dear {{guestName}},</p>
          <p>Thank you for choosing Tropicana for your stay. We are committed to providing you with exceptional service and memorable experiences.</p>
          <p>If you have any questions or special requests, please don't hesitate to contact us.</p>
        `,
        textContent: 'Welcome to Tropicana! Thank you for choosing us for your stay.',
        variables: ['guestName'],
        category: 'welcome',
        locale: 'en',
        isActive: true,
      }
    }),
  ])

  console.log('✅ Created email templates')

  // Create sample newsletter subscription
  await prisma.newsletter.create({
    data: {
      email: 'subscriber@example.com',
      firstName: 'Sample',
      lastName: 'Subscriber',
      isActive: true,
      confirmedAt: new Date(),
      preferences: {
        specialOffers: true,
        events: true,
        newsUpdates: false
      },
    }
  })

  console.log('✅ Created sample newsletter subscription')

  console.log('🎉 Database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log(`   • 1 admin user created`)
  console.log(`   • 4 business units created`)
  console.log(`   • 40 amenities created (10 per business unit)`)
  console.log(`   • 20 room types created (5 per business unit)`)
  console.log(`   • 20 rooms created (5 per business unit)`)
  console.log(`   • 3 special offers created (NOTE: should be global, not business unit bound)`)
  console.log(`   • 3 events created`)
  console.log(`   • 3 testimonials created`)
  console.log(`   • 3 hero sections created`)
  console.log(`   • 3 promos created (WELCOME15, STAYMORE, WEEKEND50)`)
  console.log(`   • 3 vouchers created (gift, complimentary, loyalty)`)
  console.log(`   • Website configuration created`)
  console.log(`   • Sample content and FAQs created`)
  console.log(`   • Email templates created`)
  console.log(`   • Sample newsletter subscription created`)
  console.log(``)
  console.log(`⚠️  IMPORTANT NOTES:`)
  console.log(`   • SpecialOffer model needs businessUnitId to be optional for global offers`)
  console.log(`   • Hero sections are properly global (not business unit specific)`)
  console.log(`   • Add the Hero and Promo models to your schema before running`)
  console.log(`   • Add promoUsages relationship to Reservation model`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
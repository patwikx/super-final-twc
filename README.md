# Tropicana Worldwide Hotel Management System

A comprehensive hotel management and global CMS platform built with modern web technologies, designed to manage multiple properties, reservations, payments, and content across the Tropicana hotel chain.

## 🏨 Overview

This system provides a complete solution for managing hotel operations including:
- Multi-property management
- Advanced reservation system
- Integrated payment processing (PayMongo)
- Content management system
- Guest experience management
- Restaurant and event management
- Financial reporting and analytics

## 🚀 Tech Stack

### Frontend & Framework
- **Next.js 15.5.0** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern UI components
- **Axios** - HTTP client for API requests

### Backend & Database
- **Prisma ORM** - Database toolkit and ORM
- **PostgreSQL** - Primary database
- **Next.js API Routes** - Serverless API endpoints

### Authentication & Security
- **NextAuth.js** - Authentication library
- **Zod** - Schema validation and type safety

### Payment Processing
- **PayMongo** - Primary payment processor for Philippines
- **Multi-provider support** - Extensible payment architecture

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [Payment Integration](#payment-integration)
6. [Content Management](#content-management)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Contributing](#contributing)

## 🛠 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- PostgreSQL database
- PayMongo account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tropicana-worldwide/hotel-management-system.git
   cd hotel-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/hotel_management"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # PayMongo
   PAYMONGO_SECRET_KEY="sk_test_..."
   PAYMONGO_PUBLIC_KEY="pk_test_..."
   PAYMONGO_WEBHOOK_SECRET="whsec_..."
   
   # Email (Optional)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   
   # File Upload (Optional)
   CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
hotel-management-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── admin/                # Admin panel
│   │   ├── properties/           # Property management
│   │   ├── reservations/         # Booking management
│   │   ├── payments/             # Payment handling
│   │   └── cms/                  # Content management
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── reservations/         # Booking APIs
│   │   ├── payments/             # Payment processing
│   │   └── webhooks/             # Payment webhooks
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn UI components
│   ├── forms/                    # Form components
│   ├── layouts/                  # Layout components
│   └── charts/                   # Analytics components
├── lib/                          # Utility functions
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client
│   ├── payments/                 # Payment processing logic
│   ├── validations/              # Zod schemas
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
├── public/                       # Static assets
├── types/                        # TypeScript type definitions
└── middleware.ts                 # Next.js middleware
```

## 🗄 Database Schema

The system uses a comprehensive PostgreSQL schema designed for multi-property hotel management:

### Core Entities

#### **User Management**
- `User` - System users with role-based access
- `Role` - User roles (Admin, Manager, Staff, etc.)
- `Permission` - Granular permissions system
- `BusinessUnit` - Individual hotel properties

#### **Property Management**
- `BusinessUnit` - Hotel properties with location and settings
- `RoomType_Model` - Room categories (Standard, Deluxe, Suite, etc.)
- `Room` - Individual rooms with status tracking
- `Amenity` - Property and room amenities

#### **Reservation System**
- `Guest` - Customer information and preferences
- `Reservation` - Booking records with full details
- `ReservationRoom` - Room assignments with pricing
- `Stay` - Active guest stays with charges

#### **Payment Processing**
- `Payment` - Payment records with detailed breakdown
- `PaymentLineItem` - Itemized billing
- `PaymongoPayment` - PayMongo-specific data
- `IncidentalCharge` - Additional charges during stay

#### **Content Management**
- `ContentItem` - Global and property-specific content
- `MediaItem` - Media library with categorization
- `Image` - Dedicated image management
- `Hero` - Homepage hero sections

#### **Operations**
- `Service` - Hotel services (Housekeeping, Maintenance, etc.)
- `Task` - Staff task management
- `ServiceRequest` - Guest service requests

### Key Features

- **Multi-tenancy**: Support for multiple hotel properties
- **Role-based Access**: Granular permission system
- **Payment Integration**: Full PayMongo integration with webhooks
- **Content Management**: Global and property-specific content
- **Image Management**: Dedicated image handling with multiple sizes
- **Audit Trail**: Comprehensive logging system

## 🔐 Authentication System

The system uses NextAuth.js with a custom database adapter:

### User Roles
- **Super Admin**: Full system access
- **Property Manager**: Property-specific management
- **Front Desk**: Reservation and guest management
- **Housekeeping**: Room status and maintenance
- **Staff**: Limited operational access

### Authentication Flow
```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Custom authentication logic
        // Verify user credentials against database
        // Return user object with roles and permissions
      }
    })
  ],
  // Custom session and JWT callbacks
}
```

### Route Protection
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Route-specific authorization logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check user permissions for requested route
      }
    }
  }
)
```

## 💳 Payment Integration

### PayMongo Integration

The system includes comprehensive PayMongo integration:

#### Payment Methods Supported
- Credit/Debit Cards
- GCash
- GrabPay
- PayMaya/Maya
- Bank Transfers (BPI, UBP)
- Online Banking

#### Payment Flow
```typescript
// lib/payments/paymongo.ts
export class PayMongoService {
  async createPaymentIntent(amount: number, metadata: object) {
    // Create PayMongo payment intent
    // Handle 3D Secure authentication
    // Return payment details
  }
  
  async handleWebhook(event: PayMongoWebhookEvent) {
    // Process webhook events
    // Update payment status
    // Trigger notifications
  }
}
```

#### Payment Features
- **Secure Processing**: PCI-compliant payment handling
- **Webhook Integration**: Real-time payment status updates
- **Refund Management**: Automated refund processing
- **Multi-currency**: Support for PHP and other currencies
- **Installment Payments**: Support for payment plans

### Payment Workflow
1. **Reservation Creation**: Generate payment intent
2. **Payment Processing**: Handle customer payment
3. **Webhook Handling**: Update reservation status
4. **Confirmation**: Send booking confirmation
5. **Reconciliation**: Daily payment reconciliation

## 📝 Content Management

### Global CMS Features
- **Multi-property Content**: Shared and property-specific content
- **Image Management**: Centralized media library
- **SEO Optimization**: Meta tags and structured data
- **Multilingual Support**: Content localization
- **Template System**: Flexible page templates

### Content Types
```typescript
// Content structure
interface ContentItem {
  key: string              // Unique identifier
  section: string          // Content section
  content: string          // Main content
  contentType: ContentType // TEXT, HTML, MARKDOWN, etc.
  scope: ContentScope      // GLOBAL, PROPERTY, REGIONAL
  locale: string           // Language code
}
```

### Usage Examples
```typescript
// Fetch homepage hero content
const heroContent = await getContent('hero.homepage.title', 'en', 'GLOBAL')

// Get property-specific amenities
const amenities = await getPropertyContent(propertyId, 'amenities', 'en')
```

## 🔌 API Documentation

### Authentication APIs
```typescript
POST /api/auth/signin      // User login
POST /api/auth/signout     // User logout
GET  /api/auth/session     // Get current session
POST /api/auth/register    // User registration
```

### Reservation APIs
```typescript
GET    /api/reservations                    // List reservations
POST   /api/reservations                    // Create reservation
GET    /api/reservations/[id]               // Get reservation details
PATCH  /api/reservations/[id]               // Update reservation
DELETE /api/reservations/[id]               // Cancel reservation
POST   /api/reservations/[id]/check-in      // Check-in guest
POST   /api/reservations/[id]/check-out     // Check-out guest
```

### Payment APIs
```typescript
POST   /api/payments/create-intent          // Create payment intent
POST   /api/payments/confirm                // Confirm payment
GET    /api/payments/[id]                   // Get payment details
POST   /api/payments/refund                 // Process refund
POST   /api/webhooks/paymongo               // PayMongo webhook
```

### Property Management APIs
```typescript
GET    /api/properties                      // List properties
POST   /api/properties                      // Create property
GET    /api/properties/[id]                 // Get property details
PATCH  /api/properties/[id]                 // Update property
GET    /api/properties/[id]/rooms           // Get rooms
GET    /api/properties/[id]/availability    // Check availability
```

### Room Management APIs
```typescript
GET    /api/rooms                           // List rooms
POST   /api/rooms                           // Create room
PATCH  /api/rooms/[id]                      // Update room
POST   /api/rooms/[id]/status               // Update room status
GET    /api/rooms/[id]/maintenance          // Get maintenance history
```

### Content APIs
```typescript
GET    /api/content                         // List content items
POST   /api/content                         // Create content
PATCH  /api/content/[id]                    // Update content
GET    /api/content/[key]                   // Get content by key
POST   /api/media/upload                    // Upload media
```

### API Response Format
```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## 🎨 UI Components

### Shadcn/UI Integration
The system uses Shadcn/UI components with custom hotel-specific components:

```typescript
// components/ui/reservation-card.tsx
export function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{reservation.confirmationNumber}</CardTitle>
        <CardDescription>
          {reservation.guest.firstName} {reservation.guest.lastName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Reservation details */}
      </CardContent>
    </Card>
  )
}
```

### Custom Components
- **ReservationCalendar**: Interactive booking calendar
- **RoomStatus**: Real-time room status grid
- **PaymentForm**: Integrated payment processing
- **GuestProfile**: Guest information management
- **PropertySelector**: Multi-property navigation

## 📊 Analytics & Reporting

### Revenue Analytics
```typescript
// lib/analytics/revenue.ts
export async function getRevenueAnalytics(
  propertyId: string,
  startDate: Date,
  endDate: Date
) {
  // Calculate revenue metrics
  // ADR (Average Daily Rate)
  // RevPAR (Revenue Per Available Room)
  // Occupancy rates
  // Payment method breakdown
}
```

### Key Metrics
- **Occupancy Rate**: Room utilization percentage
- **ADR**: Average daily rate per room
- **RevPAR**: Revenue per available room
- **Guest Satisfaction**: Review scores and feedback
- **Payment Analytics**: Transaction success rates

## 🚀 Deployment

### Environment Setup
1. **Production Database**: PostgreSQL with connection pooling
2. **Environment Variables**: Secure configuration management
3. **File Storage**: Cloudinary or AWS S3 integration
4. **Payment Processing**: PayMongo production keys

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Environment Variables (Production)
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="production-secret-key"

# PayMongo Production
PAYMONGO_SECRET_KEY="sk_live_..."
PAYMONGO_PUBLIC_KEY="pk_live_..."

# File Storage
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

## 🧪 Testing

### Test Structure
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # End-to-end tests
```

### Testing Libraries
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **MSW**: API mocking

## 🔧 Development

### Code Style
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks

### Development Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

## 📚 Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [PayMongo API Documentation](https://developers.paymongo.com)
- [Shadcn/UI Documentation](https://ui.shadcn.com)

### API References
- [PayMongo API Reference](https://developers.paymongo.com/reference)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages

### Code Review Process
1. Automated CI/CD checks
2. Code review by maintainers
3. Testing in staging environment
4. Deployment approval

## 📄 License

This project is proprietary software owned by Patrick Miranda. All rights reserved.

## 📞 Support

For technical support or questions:
- Email: patricklacapmiranda@gmail.com
- Documentation: [Internal Wiki]
- Issue Tracker: [GitHub Issues]

---

**Built with ❤️ for Tropicana Worldwide Corporation**
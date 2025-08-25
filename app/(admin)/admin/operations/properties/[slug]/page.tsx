import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Edit,
  Eye,
  Bed,
  Users,
  Calendar,
  DollarSign,
  MoreVertical
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BusinessUnit, RoomType_Model, Room, Reservation, Guest } from "@prisma/client"
import { PropertyDetailsForm } from "@/components/admin/property-components/property-details-form"
import { RoomTypesSection } from "@/components/admin/property-components/room-types-section"
import { RoomsSection } from "@/components/admin/property-components/rooms-section"
import { ReservationsSection } from "@/components/admin/property-components/reservations-section"

// Define proper types for the property with relations
type PropertyWithDetails = BusinessUnit & {
  roomTypes: (RoomType_Model & {
    _count: { rooms: number };
  })[];
  rooms: (Room & { roomType: RoomType_Model })[];
  reservations: (Reservation & { guest: Guest })[];
  _count: {
    rooms: number;
    roomTypes: number;
    reservations: number;
    guests: number;
  };
};

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params
  
  const propertyData = await prisma.businessUnit.findUnique({
   where: { slug },
    include: {
      roomTypes: {
        include: {
          _count: { select: { rooms: true } }
        },
        orderBy: { sortOrder: 'asc' }
      },
      rooms: {
        include: { roomType: true },
        orderBy: { roomNumber: 'asc' }
      },
      reservations: {
        include: { guest: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      _count: {
        select: {
          rooms: true,
          roomTypes: true,
          reservations: true,
          guests: true
        }
      }
    }
  })

  if (!propertyData) {
    notFound()
  }

  // Serialize the data to ensure type safety
  const property: PropertyWithDetails = JSON.parse(JSON.stringify(propertyData));
  
  const getPropertyTypeVariant = (type: string) => {
    switch (type) {
      case 'HOTEL': 
        return { variant: "default" as const, className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" }
      case 'RESORT': 
        return { variant: "secondary" as const, className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50" }
      case 'VILLA_COMPLEX': 
        return { variant: "outline" as const, className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50" }
      case 'BOUTIQUE_HOTEL': 
        return { variant: "outline" as const, className: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50" }
      default: 
        return { variant: "secondary" as const, className: "" }
    }
  }

  const getStatusVariant = (isActive: boolean, isPublished: boolean) => {
    if (!isActive) return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" }
    if (isPublished) return { variant: "default" as const, className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" }
    return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" }
  }

  const getStatusText = (isActive: boolean, isPublished: boolean) => {
    if (!isActive) return 'Inactive'
    if (isPublished) return 'Published'
    return 'Draft'
  }

  const formatPropertyType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/operations/properties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Properties
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{property.displayName}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{property.displayName}</h1>
            <Badge 
              variant={getStatusVariant(property.isActive, property.isPublished).variant}
              className={`font-medium ${getStatusVariant(property.isActive, property.isPublished).className}`}
            >
              {getStatusText(property.isActive, property.isPublished)}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{property.city}, {property.country}</span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <Badge 
              variant={getPropertyTypeVariant(property.propertyType).variant}
              className={`w-fit font-medium ${getPropertyTypeVariant(property.propertyType).className}`}
            >
              <Building className="mr-1.5 h-3 w-3" />
              {formatPropertyType(property.propertyType)}
            </Badge>
          </div>
          
          {property.description && (
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/properties/${property.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              View Live
            </Link>
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Property
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold tabular-nums">{property._count.rooms}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Bed className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Room Types</p>
                <p className="text-2xl font-bold tabular-nums">{property._count.roomTypes}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <Building className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Reservations</p>
                <p className="text-2xl font-bold tabular-nums">{property._count.reservations}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold tabular-nums">{property._count.guests}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger 
            value="details" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="room-types"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Room Types
          </TabsTrigger>
          <TabsTrigger 
            value="rooms"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Rooms
          </TabsTrigger>
          <TabsTrigger 
            value="reservations"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Reservations
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-6">
          <PropertyDetailsForm property={JSON.parse(JSON.stringify(property))} />
        </TabsContent>

        <TabsContent value="room-types" className="space-y-4 mt-6">
          <RoomTypesSection 
            property={property} 
            roomTypes={property.roomTypes} 
          />
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4 mt-6">
          <RoomsSection 
            property={property} 
            rooms={property.rooms} 
          />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4 mt-6">
          <ReservationsSection 
            property={property} 
            reservations={property.reservations} 
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Comprehensive analytics and performance metrics for {property.displayName}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Detailed analytics including revenue metrics, occupancy rates, and performance insights will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
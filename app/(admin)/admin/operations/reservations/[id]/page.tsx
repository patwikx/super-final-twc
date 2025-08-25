import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Edit,
  CheckCircle,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Building,
  Bed
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Reservation, Guest, BusinessUnit, ReservationRoom, RoomType_Model } from "@prisma/client"

type ReservationWithDetails = Reservation & {
  guest: Guest;
  businessUnit: BusinessUnit;
  rooms: (ReservationRoom & {
    roomType: RoomType_Model;
    room?: {
      roomNumber: string;
      floor?: number | null;
      wing?: string | null;
    } | null;
  })[];
};

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const { id } = await params
  
  const reservationData = await prisma.reservation.findUnique({
    where: { id },
    include: {
      guest: true,
      businessUnit: true,
      rooms: {
        include: {
          roomType: true,
          room: {
            select: {
              roomNumber: true,
              floor: true,
              wing: true
            }
          }
        }
      }
    }
  })

  if (!reservationData) {
    notFound()
  }

  const reservation: ReservationWithDetails = JSON.parse(JSON.stringify(reservationData))
  
  // Get the first room for display purposes (you might want to handle multiple rooms differently)
  const primaryRoom = reservation.rooms[0]
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED': 
        return { variant: "default" as const, className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      case 'PENDING': 
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200" }
      case 'CHECKED_IN': 
        return { variant: "default" as const, className: "bg-blue-50 text-blue-700 border-blue-200" }
      case 'CHECKED_OUT': 
        return { variant: "secondary" as const, className: "bg-slate-50 text-slate-700 border-slate-200" }
      case 'CANCELLED': 
        return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200" }
      default: 
        return { variant: "secondary" as const, className: "" }
    }
  }

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': 
      case 'SUCCEEDED':
        return { variant: "default" as const, className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      case 'PENDING': 
      case 'PROCESSING':
        return { variant: "secondary" as const, className: "bg-amber-50 text-amber-700 border-amber-200" }
      case 'PARTIAL': 
        return { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200" }
      case 'FAILED': 
      case 'CANCELLED':
        return { variant: "destructive" as const, className: "bg-red-50 text-red-700 border-red-200" }
      default: 
        return { variant: "secondary" as const, className: "" }
    }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/admin/operations/reservations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Reservations
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{reservation.confirmationNumber}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Reservation Details</h1>
            <Badge 
              variant={getStatusVariant(reservation.status).variant}
              className={`font-medium ${getStatusVariant(reservation.status).className}`}
            >
              {reservation.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{reservation.confirmationNumber}</span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{reservation.guest.firstName} {reservation.guest.lastName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{reservation.businessUnit.displayName}</span>
            </div>
            {primaryRoom && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>
                  {primaryRoom.room 
                    ? `Room ${primaryRoom.room.roomNumber}` 
                    : primaryRoom.roomType.displayName
                  }
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/operations/reservations/${reservation.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button size="sm">
            <CheckCircle className="mr-2 h-4 w-4" />
            Check In
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold tabular-nums">₱{Number(reservation.totalAmount).toLocaleString()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Nights</p>
                <p className="text-2xl font-bold tabular-nums">{reservation.nights}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Guests</p>
                <p className="text-2xl font-bold tabular-nums">{reservation.adults + reservation.children}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <User className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <Badge 
                  variant={getPaymentStatusVariant(reservation.paymentStatus).variant}
                  className={getPaymentStatusVariant(reservation.paymentStatus).className}
                >
                  {reservation.paymentStatus}
                </Badge>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger 
            value="details" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="guest"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Guest Info
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Reservation Details */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Reservation Information</CardTitle>
                <CardDescription>Booking details and stay information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Check-in</p>
                    <p className="text-base font-semibold">{new Date(reservation.checkInDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Check-out</p>
                    <p className="text-base font-semibold">{new Date(reservation.checkOutDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Adults</p>
                    <p className="text-base font-semibold">{reservation.adults}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Children</p>
                    <p className="text-base font-semibold">{reservation.children}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Infants</p>
                    <p className="text-base font-semibold">{reservation.infants}</p>
                  </div>
                </div>

                {reservation.specialRequests && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Special Requests</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{reservation.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Room Details */}
            {primaryRoom && (
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Room Information</CardTitle>
                  <CardDescription>Accommodation details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {primaryRoom.room && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Room Number</p>
                      <p className="text-base font-semibold">{primaryRoom.room.roomNumber}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Room Type</p>
                    <p className="text-base font-semibold">{primaryRoom.roomType.displayName}</p>
                  </div>
                  
                  {primaryRoom.room && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Floor</p>
                        <p className="text-base font-semibold">{primaryRoom.room.floor || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Wing</p>
                        <p className="text-base font-semibold">{primaryRoom.room.wing || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rate per Night</p>
                    <p className="text-base font-semibold">₱{Number(primaryRoom.baseRate).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Multiple Rooms Display */}
            {reservation.rooms.length > 1 && (
              <Card className="border-border md:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">All Rooms ({reservation.rooms.length})</CardTitle>
                  <CardDescription>Complete room assignments for this reservation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reservation.rooms.map((room, index) => (
                      <div key={room.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {room.room ? `Room ${room.room.roomNumber}` : `Room ${index + 1}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{room.roomType.displayName}</p>
                          <p className="text-xs text-muted-foreground">
                            {room.adults} Adults, {room.children} Children
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₱{Number(room.baseRate).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">per night</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="guest" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Guest Information</CardTitle>
              <CardDescription>Complete guest profile and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-base font-semibold">
                      {reservation.guest.title ? `${reservation.guest.title} ` : ''}
                      {reservation.guest.firstName} {reservation.guest.lastName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base">{reservation.guest.email}</p>
                    </div>
                  </div>
                  
                  {reservation.guest.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-base">{reservation.guest.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {reservation.guest.nationality && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                        <p className="text-base">{reservation.guest.nationality}</p>
                      </div>
                    </div>
                  )}
                  
                  {reservation.guest.vipStatus && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant="outline" className="mt-1">
                        VIP Guest
                      </Badge>
                    </div>
                  )}

                  {reservation.guest.loyaltyNumber && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Loyalty Number</p>
                      <p className="text-base">{reservation.guest.loyaltyNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {reservation.guest.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Guest Notes</h4>
                  <p className="text-sm bg-muted p-3 rounded">{reservation.guest.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Billing Summary</CardTitle>
              <CardDescription>Detailed breakdown of charges and payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Room Subtotal ({reservation.nights} nights)</span>
                  <span className="font-semibold">₱{Number(reservation.subtotal).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxes</span>
                  <span className="font-semibold">₱{Number(reservation.taxes).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Service Fee</span>
                  <span className="font-semibold">₱{Number(reservation.serviceFee).toLocaleString()}</span>
                </div>
                
                {Number(reservation.discounts) > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Discount</span>
                    <span className="font-semibold">-₱{Number(reservation.discounts).toLocaleString()}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₱{Number(reservation.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Payment Status</span>
                  <Badge 
                    variant={getPaymentStatusVariant(reservation.paymentStatus).variant}
                    className={getPaymentStatusVariant(reservation.paymentStatus).className}
                  >
                    {reservation.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Reservation Timeline</CardTitle>
              <CardDescription>Key events and status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Reservation Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reservation.bookedAt || reservation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {reservation.paidAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment Received</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reservation.paidAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {reservation.cancelledAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Cancelled</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reservation.cancelledAt).toLocaleString()}
                      </p>
                      {reservation.cancellationReason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {reservation.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
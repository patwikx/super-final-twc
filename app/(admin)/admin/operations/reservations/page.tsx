import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  UserCheck,
  Filter,
  CreditCard,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Reservation, Guest, BusinessUnit, Room, RoomType_Model, ReservationRoom } from "@prisma/client"

// Corrected type to handle the 'rooms' array relationship
type ReservationWithDetails = Reservation & {
  guest: Guest;
  businessUnit: BusinessUnit;
  rooms: (ReservationRoom & {
    room: (Room & {
      roomType: RoomType_Model;
    }) | null; // A ReservationRoom might not have a specific room assigned yet
    roomType: RoomType_Model;
  })[];
};

export default async function ReservationsPage() {
  // Corrected Prisma query to use 'rooms' (plural) and include nested relations
  const reservations: ReservationWithDetails[] = await prisma.reservation.findMany({
    include: {
      guest: true,
      businessUnit: true,
      rooms: {
        include: {
          room: {
            include: {
              roomType: true
            }
          },
          roomType: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'PROVISIONAL': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'CHECKED_IN': return 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
      case 'CHECKED_OUT': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      case 'NO_SHOW': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'SUCCEEDED':
         return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'PARTIAL': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      case 'FAILED': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      case 'REFUNDED': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return CheckCircle
      case 'PENDING': return Clock
      case 'PROVISIONAL': return AlertCircle
      case 'CHECKED_IN': return UserCheck
      case 'CHECKED_OUT': return CheckCircle
      case 'CANCELLED': return XCircle
      case 'NO_SHOW': return AlertCircle
      default: return Clock
    }
  }

  const statCards = [
    {
      title: 'Total Reservations',
      value: reservations.length,
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Confirmed',
      value: reservations.filter((r: ReservationWithDetails) => r.status === 'CONFIRMED').length,
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Checked In',
      value: reservations.filter((r: ReservationWithDetails) => r.status === 'CHECKED_IN').length,
      icon: UserCheck,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600'
    },
    {
      title: 'Revenue',
      value: `₱${reservations.reduce((sum, r: ReservationWithDetails) => sum + Number(r.totalAmount), 0).toLocaleString()}`,
      icon: CreditCard,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reservations Management
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Manage bookings, check-ins, and guest stays across all properties
          </p>
        </div>
        <Button asChild size="default" className="shrink-0">
          <Link href="/admin/operations/reservations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.title} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Reservations Table */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">
                All Reservations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {reservations.length} {reservations.length === 1 ? 'reservation' : 'reservations'} total
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search reservations..." 
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter reservations</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {reservations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Guest</TableHead>
                  <TableHead className="font-semibold text-foreground">Property & Room</TableHead>
                  <TableHead className="font-semibold text-foreground">Stay Dates</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Payment</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Total</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation: ReservationWithDetails) => {
                  const StatusIcon = getStatusIcon(reservation.status)
                  const firstRoom = reservation.rooms[0]; // Get the first room for display
                  
                  return (
                    <TableRow key={reservation.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200/50">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground leading-none truncate">
                              {reservation.guest.firstName} {reservation.guest.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {reservation.confirmationNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground leading-none">
                            {reservation.businessUnit.displayName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {/* Safely access room details */}
                            {firstRoom ? `Room ${firstRoom.room?.roomNumber || ''} - ${firstRoom.roomType.displayName}` : 'No room assigned'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground text-sm leading-none">
                            {new Date(reservation.checkInDate).toLocaleDateString()} → {new Date(reservation.checkOutDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {reservation.nights} {reservation.nights === 1 ? 'night' : 'nights'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(reservation.status)}
                          >
                            {reservation.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="secondary" 
                          className={getPaymentStatusColor(reservation.paymentStatus)}
                        >
                          {reservation.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="font-semibold text-foreground tabular-nums">
                          ₱{Number(reservation.totalAmount).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/operations/reservations/${reservation.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/operations/reservations/${reservation.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Reservation
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {reservation.status === 'CONFIRMED' && (
                              <DropdownMenuItem>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Check In Guest
                              </DropdownMenuItem>
                            )}
                            {reservation.status === 'CHECKED_IN' && (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Check Out Guest
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Reservation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No reservations yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start accepting bookings to see reservations appear here.
                </p>
              </div>
              <Button asChild className="mt-6">
                <Link href="/admin/operations/reservations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Reservation
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

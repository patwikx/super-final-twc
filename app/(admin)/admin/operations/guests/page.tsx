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
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  Filter,
  UserCheck,
  Heart,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Guest, Reservation, BusinessUnit } from "@prisma/client"

// Updated type to include the businessUnit relation
type GuestWithDetails = Guest & {
  businessUnit: BusinessUnit;
  _count: {
    reservations: number;
  };
  reservations: Reservation[];
};

export default async function GuestsPage() {
  // Updated query to include the businessUnit
  const guests: GuestWithDetails[] = await prisma.guest.findMany({
    include: {
      businessUnit: true, // Added missing relation
      _count: {
        select: {
          reservations: true
        }
      },
      reservations: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Updated statCards to use existing fields
  const statCards = [
    {
      title: 'Total Guests',
      value: guests.length,
      icon: User,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Guests',
      value: guests.filter((g: GuestWithDetails) => !g.blacklistedAt).length,
      icon: UserCheck,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'VIP Guests',
      value: guests.filter((g: GuestWithDetails) => g.vipStatus).length,
      icon: Star,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Repeat Guests',
      value: guests.filter((g: GuestWithDetails) => g._count.reservations > 1).length,
      icon: Heart,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Guest Management
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Manage guest profiles, preferences, and booking history
          </p>
        </div>
        <Button asChild size="default" className="shrink-0">
          <Link href="/admin/operations/guests/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Guest
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

      {/* Guests Table */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">
                All Guests
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {guests.length} {guests.length === 1 ? 'guest' : 'guests'} total
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search guests..." 
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter guests</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {guests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Guest</TableHead>
                  <TableHead className="font-semibold text-foreground">Contact</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Reservations</TableHead>
                  <TableHead className="font-semibold text-foreground">Last Stay</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest: GuestWithDetails) => {
                  const lastReservation = guest.reservations[0]
                  
                  return (
                    <TableRow key={guest.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200/50">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground leading-none truncate">
                              {guest.title ? `${guest.title} ` : ''}{guest.firstName} {guest.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                               {guest.businessUnit.displayName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground">{guest.email}</span>
                          </div>
                          {guest.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{guest.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                           {guest.vipStatus && <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">VIP</Badge>}
                           {guest.blacklistedAt && <Badge variant="destructive">Blacklisted</Badge>}
                           {!guest.vipStatus && !guest.blacklistedAt && <Badge variant="secondary">Active</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground tabular-nums">
                            {guest._count.reservations}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {guest._count.reservations === 1 ? 'booking' : 'bookings'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {lastReservation ? (
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium text-foreground">
                              {new Date(lastReservation.checkInDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {lastReservation.confirmationNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No stays</span>
                        )}
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
                              <Link href={`/admin/operations/guests/${guest.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/operations/guests/${guest.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Guest
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/operations/reservations/new?guestId=${guest.id}`}>
                                <Calendar className="mr-2 h-4 w-4" />
                                New Reservation
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Star className="mr-2 h-4 w-4" />
                              Mark as VIP
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
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No guests registered yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start adding guest profiles to manage their information and booking history.
                </p>
              </div>
              <Button asChild className="mt-6">
                <Link href="/admin/operations/guests/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Guest
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

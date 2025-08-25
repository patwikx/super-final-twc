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
  Trash2, 
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  PartyPopper,
  Music,
  Heart,
  Building
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Event, BusinessUnit } from "@prisma/client"

// Define a specific type for our event data, including relations
type EventWithDetails = Event & {
  businessUnit: BusinessUnit;
  _count: {
    bookings: number;
  };
};

export default async function EventsPage() {
  // Fetch events with the corrected relation name 'bookings'
  const events: EventWithDetails[] = await prisma.event.findMany({
    include: {
      businessUnit: true,
      _count: {
        select: {
          bookings: true // Corrected from eventRegistrations
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Helper function to get an icon based on event type
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'WEDDING': return Heart
      case 'CONFERENCE': return Building
      case 'MEETING': return Building
      case 'WORKSHOP': return Building
      case 'CELEBRATION': return PartyPopper
      case 'CULTURAL': return Music
      case 'SEASONAL': return Calendar
      case 'ENTERTAINMENT': return Music
      case 'CORPORATE': return Building
      case 'PRIVATE': return Users
      default: return Calendar
    }
  }

  // Helper function to get badge colors based on event type
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'WEDDING': return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
      case 'CONFERENCE': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'MEETING': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      case 'WORKSHOP': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
      case 'CELEBRATION': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      case 'CULTURAL': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'SEASONAL': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'ENTERTAINMENT': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100'
      case 'CORPORATE': return 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100'
      case 'PRIVATE': return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  // Helper function to get badge colors based on event status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'PLANNING': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      case 'COMPLETED': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  // Data for the statistics cards at the top of the page
  const statCards = [
    {
      title: 'Total Events',
      value: events.length,
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Published',
      value: events.filter(e => e.isPublished).length,
      icon: Eye,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Featured',
      value: events.filter(e => e.isFeatured).length,
      icon: PartyPopper,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Upcoming',
      value: events.filter(e => new Date(e.startDate) > new Date()).length,
      icon: Clock,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Events Management
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Create and manage events, workshops, and special occasions across your properties
          </p>
        </div>
        <Button asChild size="default" className="shrink-0">
          <Link href="/admin/cms/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Grid Section */}
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

      {/* Events Table Section */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">
                All Events
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {events.length} {events.length === 1 ? 'event' : 'events'} total
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search events..." 
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter events</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Event</TableHead>
                  <TableHead className="font-semibold text-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Date & Venue</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Bookings</TableHead>
                  <TableHead className="font-semibold text-foreground">Visibility</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const TypeIcon = getEventTypeIcon(event.type)
                  
                  return (
                    <TableRow key={event.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200/50">
                            <TypeIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground leading-none truncate">
                              {event.title}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {event.businessUnit.displayName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge 
                            variant="secondary" 
                            className={getEventTypeColor(event.type)}
                          >
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(event.status)}
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {/* Corrected to use event._count.bookings */}
                            {event._count.bookings}
                            {event.maxAttendees && ` / ${event.maxAttendees}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {event.isPublished && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Published
                            </Badge>
                          )}
                          {event.isFeatured && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Featured
                            </Badge>
                          )}
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
                              <Link href={`/admin/cms/events/${event.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Event
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${event.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                View Live
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Event
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
                  No events created yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start creating events to showcase special occasions and activities at your properties.
                </p>
              </div>
              <Button asChild className="mt-6">
                <Link href="/admin/cms/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

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
  Car,
  Waves,
  Coffee,
  Filter,
  DollarSign,
  Clock,
  Star,
  Settings,
  Wrench,
  Shirt
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Service, BusinessUnit, ServiceCategory } from "@prisma/client"

// Corrected type to match the Prisma query
type ServiceWithDetails = Service & {
  businessUnit: BusinessUnit;
  _count: {
    requests: number; // Corrected from serviceRequests
  };
};

export default async function ServicesPage() {
  // Corrected Prisma query to include relations and use the correct count name
  const services: ServiceWithDetails[] = await prisma.service.findMany({
    include: {
      businessUnit: true,
      _count: {
        select: {
          requests: true // Corrected from serviceRequests
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const getServiceIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'ROOM_SERVICE': return Coffee
      case 'TRANSPORTATION': return Car
      case 'SPA': return Waves
      case 'CONCIERGE': return Star
      case 'MAINTENANCE': return Settings
      case 'HOUSEKEEPING': return Wrench
      case 'LAUNDRY': return Shirt
      default: return Settings
    }
  }

  const getCategoryColor = (category: ServiceCategory) => {
    switch (category) {
      case 'ROOM_SERVICE': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'TRANSPORTATION': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'SPA': return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
      case 'CONCIERGE': return 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
      case 'MAINTENANCE': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      case 'HOUSEKEEPING': return 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100'
      case 'LAUNDRY': return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  }

  const statCards = [
    {
      title: 'Total Services',
      value: services.length,
      icon: Settings,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Services',
      value: services.filter(s => s.isActive).length,
      icon: Star,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Chargeable',
      value: services.filter(s => s.isChargeable).length,
      icon: DollarSign,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Total Requests',
      value: services.reduce((sum, s) => sum + s._count.requests, 0),
      icon: Clock,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Services Management
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Manage hotel services, amenities, and guest offerings
          </p>
        </div>
        <Button asChild size="default" className="shrink-0">
          <Link href="/admin/operations/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
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
                    <p className="text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Services Table */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">All Services</CardTitle>
              <p className="text-sm text-muted-foreground">{services.length} {services.length === 1 ? 'service' : 'services'} total</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search services..." className="pl-10 w-full sm:w-80" />
              </div>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /><span className="sr-only">Filter services</span></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Service</TableHead>
                  <TableHead className="font-semibold text-foreground">Category</TableHead>
                  <TableHead className="font-semibold text-foreground">Property</TableHead>
                  <TableHead className="font-semibold text-foreground">Pricing</TableHead>
                  <TableHead className="font-semibold text-foreground">Requests</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => {
                  const ServiceIcon = getServiceIcon(service.category)
                  
                  return (
                    <TableRow key={service.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200/50">
                            <ServiceIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground leading-none truncate">{service.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{service.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary" className={getCategoryColor(service.category)}>{service.category.replace('_', ' ')}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4"><span className="text-sm text-foreground">{service.businessUnit.displayName}</span></TableCell>
                      <TableCell className="py-4">
                        {service.isChargeable ? (
                          <div className="font-semibold text-foreground">₱{Number(service.basePrice || 0).toLocaleString()}</div>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complimentary</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground tabular-nums">{service._count.requests}</div>
                          <div className="text-xs text-muted-foreground">requests</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4"><Badge variant="secondary" className={getStatusColor(service.isActive)}>{service.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Open menu</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild><Link href={`/admin/operations/services/${service.id}`}><Eye className="mr-2 h-4 w-4" /> View Details</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/admin/operations/services/${service.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Service</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Service</DropdownMenuItem>
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
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted"><Settings className="h-10 w-10 text-muted-foreground" /></div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No services configured yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">Start adding services to offer guests additional amenities and experiences.</p>
              </div>
              <Button asChild className="mt-6"><Link href="/admin/operations/services/new"><Plus className="mr-2 h-4 w-4" /> Add First Service</Link></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
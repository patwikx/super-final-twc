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
  Gift,
  Calendar,
  Filter,
  Star,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { SpecialOffer, BusinessUnit } from "@prisma/client"

// Define a specific type for the offer data, allowing businessUnit to be null
type OfferWithDetails = SpecialOffer & {
  businessUnit: BusinessUnit | null; // Corrected: businessUnit can be null for global offers
  _count: {
    bookings: number;
  };
};

export default async function OffersPage() {
  // Fetch offers with the corrected relation name 'bookings'
  const offers: OfferWithDetails[] = await prisma.specialOffer.findMany({
    include: {
      businessUnit: true,
      _count: {
        select: {
          bookings: true // Corrected from 'reservations'
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const getOfferTypeColor = (type: string) => {
    switch (type) {
      case 'EARLY_BIRD': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'LAST_MINUTE': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      case 'SEASONAL': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'PACKAGE': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
      case 'LOYALTY': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'ROOM_UPGRADE': return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
      case 'DINING': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      case 'SPA': return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
      case 'ACTIVITY': return 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100'
      case 'PROMO_CODE': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'DRAFT': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      case 'EXPIRED': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      case 'SCHEDULED': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'PAUSED': return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  const calculateSavings = (original: number | null, offer: number) => {
    if (!original || original <= offer) return null
    return Math.round(((original - offer) / original) * 100)
  }

  const statCards = [
    {
      title: 'Total Offers',
      value: offers.length,
      icon: Gift,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Active',
      value: offers.filter((o: OfferWithDetails) => o.status === 'ACTIVE').length,
      icon: Star,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Featured',
      value: offers.filter((o: OfferWithDetails) => o.isFeatured).length,
      icon: Star,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Bookings',
      value: offers.reduce((sum, o: OfferWithDetails) => sum + o._count.bookings, 0),
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Special Offers
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Create and manage promotional offers and packages for your properties
          </p>
        </div>
        <Button asChild size="default" className="shrink-0">
          <Link href="/admin/cms/offers/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Offer
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

      {/* Offers Table */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">
                All Special Offers
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {offers.length} {offers.length === 1 ? 'offer' : 'offers'} total
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search offers..." 
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter offers</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {offers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Offer</TableHead>
                  <TableHead className="font-semibold text-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Pricing</TableHead>
                  <TableHead className="font-semibold text-foreground">Valid Period</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Bookings</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer: OfferWithDetails) => {
                  const savings = calculateSavings(Number(offer.originalPrice), Number(offer.offerPrice))
                  
                  return (
                    <TableRow key={offer.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
                            <Gift className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground leading-none truncate">
                              {offer.title}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {offer.businessUnit?.displayName || 'Global'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="secondary" 
                          className={getOfferTypeColor(offer.type)}
                        >
                          {offer.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">
                            ₱{Number(offer.offerPrice).toLocaleString()}
                          </div>
                          {offer.originalPrice && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm line-through text-muted-foreground">
                                ₱{Number(offer.originalPrice).toLocaleString()}
                              </span>
                              {savings && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  {savings}% off
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">
                            {new Date(offer.validFrom).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            to {new Date(offer.validTo).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(offer.status)}
                        >
                          {offer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {offer._count.bookings}
                          </span>
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
                              <Link href={`/admin/cms/offers/${offer.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Offer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/offers/${offer.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                View Live
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Offer
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
                <Gift className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No offers created yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start creating special offers and packages to attract more guests to your properties.
                </p>
              </div>
              <Button asChild className="mt-6">
                <Link href="/admin/cms/offers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Offer
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

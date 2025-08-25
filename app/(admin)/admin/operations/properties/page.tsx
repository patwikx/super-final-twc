import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Settings, 
  Building,
  MapPin,
  Users,
  Bed,
  Calendar,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BusinessUnit } from "@prisma/client"

type PropertyWithCounts = BusinessUnit & {
  _count: {
    rooms: number;
    roomTypes: number;
    reservations: number;
  };
};

export default async function PropertiesManagement() {
  const propertiesData = await prisma.businessUnit.findMany({
    include: {
      _count: {
        select: {
          rooms: true,
          roomTypes: true,
          reservations: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Serialize the data to ensure type safety
  const properties: PropertyWithCounts[] = JSON.parse(JSON.stringify(propertiesData));
  
  const getPropertyTypeVariant = (type: string) => {
    switch (type) {
      case 'HOTEL': 
        return { className: "bg-blue-50 text-blue-700 border-blue-200" }
      case 'RESORT': 
        return { className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      case 'VILLA_COMPLEX': 
        return { className: "bg-purple-50 text-purple-700 border-purple-200" }
      case 'BOUTIQUE_HOTEL': 
        return { className: "bg-rose-50 text-rose-700 border-rose-200" }
      default: 
        return { className: "bg-gray-50 text-gray-700 border-gray-200" }
    }
  }

  const getStatusVariant = (isActive: boolean, isPublished: boolean) => {
    if (!isActive) return { className: "bg-red-50 text-red-700 border-red-200" }
    if (isPublished) return { className: "bg-green-50 text-green-700 border-green-200" }
    return { className: "bg-amber-50 text-amber-700 border-amber-200" }
  }

  const getStatusText = (isActive: boolean, isPublished: boolean) => {
    if (!isActive) return 'Inactive'
    if (isPublished) return 'Live'
    return 'Draft'
  }

  const formatPropertyType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const totalRooms = properties.reduce((sum, p) => sum + p._count.rooms, 0)
  const totalBookings = properties.reduce((sum, p) => sum + p._count.reservations, 0)
  const publishedCount = properties.filter(p => p.isPublished).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 text-sm">Manage your hotel properties and business units</p>
          </div>
          <Button asChild>
            <Link href="/admin/operations/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-md border border-gray-200 p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-50 rounded-md mr-2">
                <Building className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{properties.length}</p>
                <p className="text-xs text-gray-500">Properties</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center">
              <div className="p-1.5 bg-green-50 rounded-md mr-2">
                <Eye className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{publishedCount}</p>
                <p className="text-xs text-gray-500">Published</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center">
              <div className="p-1.5 bg-amber-50 rounded-md mr-2">
                <Bed className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{totalRooms}</p>
                <p className="text-xs text-gray-500">Rooms</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center">
              <div className="p-1.5 bg-purple-50 rounded-md mr-2">
                <Calendar className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{totalBookings}</p>
                <p className="text-xs text-gray-500">Bookings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search properties..." 
              className="pl-10 bg-white border-gray-200 h-9"
            />
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-md border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-2 flex-1 min-w-0">
                    <div className="p-1.5 bg-gray-50 rounded-md flex-shrink-0">
                      <Building className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">{property.displayName}</h3>
                      <p className="text-xs text-gray-500 truncate">/{property.slug}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/operations/properties/${property.slug}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Manage
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/properties/${property.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          View Live
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <Badge 
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${getPropertyTypeVariant(property.propertyType).className}`}
                  >
                    {formatPropertyType(property.propertyType)}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${getStatusVariant(property.isActive, property.isPublished).className}`}
                  >
                    {getStatusText(property.isActive, property.isPublished)}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-center text-xs text-gray-600 mb-3">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{property.city}, {property.country}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-gray-600">
                    <Bed className="h-3 w-3 mr-1" />
                    <span className="font-medium">{property._count.rooms}</span>
                    <span className="ml-1">rooms</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-3 w-3 mr-1" />
                    <span className="font-medium">{property._count.reservations}</span>
                    <span className="ml-1">bookings</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-4 py-2">
                <div className="flex items-center justify-between">
                  <Link 
                    href={`/admin/operations/properties/${property.slug}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Manage
                  </Link>
                  {property.isPublished && (
                    <Link 
                      href={`/properties/${property.slug}`}
                      target="_blank"
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      View Live →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {properties.length === 0 && (
          <div className="text-center py-8 bg-white rounded-md border border-gray-200">
            <Building className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No properties yet</h3>
            <p className="text-gray-600 mb-3 text-sm">Get started by adding your first property.</p>
            <Button asChild size="sm">
              <Link href="/admin/operations/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
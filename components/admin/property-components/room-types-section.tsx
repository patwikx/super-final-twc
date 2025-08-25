"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Bed,
  Users,
  DollarSign,
  Settings,
  Copy,
  ToggleLeft,
  ToggleRight,
  Crown,
  Home,
  Building
} from "lucide-react"
import { BusinessUnit, RoomType_Model } from "@prisma/client"
import Link from "next/link"

interface RoomTypesSectionProps {
  property: BusinessUnit
  roomTypes: (RoomType_Model & { _count: { rooms: number } })[]
}

export function RoomTypesSection({ property, roomTypes }: RoomTypesSectionProps) {
  const getRoomTypeConfig = (type: string) => {
    switch (type) {
      case 'STANDARD': 
        return { 
          variant: "secondary" as const, 
          className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
          icon: Bed
        }
      case 'DELUXE': 
        return { 
          variant: "secondary" as const, 
          className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
          icon: Crown
        }
      case 'SUITE': 
        return { 
          variant: "secondary" as const, 
          className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
          icon: Building
        }
      case 'VILLA': 
        return { 
          variant: "secondary" as const, 
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
          icon: Home
        }
      default: 
        return { 
          variant: "secondary" as const, 
          className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
          icon: Bed
        }
    }
  }

  const statCards = [
    {
      title: 'Room Types',
      value: roomTypes.length,
      icon: Bed,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Categories'
    },
    {
      title: 'Total Rooms',
      value: roomTypes.reduce((sum, rt) => sum + rt._count.rooms, 0),
      icon: Users,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      description: 'Available'
    },
    {
      title: 'Starting Rate',
      value: roomTypes.length > 0 ? `₱${Math.min(...roomTypes.map(rt => Number(rt.baseRate))).toLocaleString()}` : '₱0',
      icon: DollarSign,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      description: 'Per night'
    },
    {
      title: 'Active Types',
      value: roomTypes.filter(rt => rt.isActive).length,
      icon: Settings,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      description: 'Bookable'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Room Types
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Manage accommodation categories, pricing, and availability for your property
          </p>
        </div>
        <Button asChild size="default" className="shrink-0">
          <Link href={`/admin/properties/${property.slug}/room-types/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room Type
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
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Room Types Table */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                All Room Types
              </CardTitle>
              <CardDescription className="mt-1">
                Configure your accommodation categories and their settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {roomTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Room Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Category</TableHead>
                  <TableHead className="font-semibold text-foreground">Base Rate</TableHead>
                  <TableHead className="font-semibold text-foreground">Occupancy</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Rooms</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((roomType) => {
                  const typeConfig = getRoomTypeConfig(roomType.type)
                  const TypeIcon = typeConfig.icon
                  
                  return (
                    <TableRow key={roomType.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                            <TypeIcon className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground leading-none">
                              {roomType.displayName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {roomType.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge 
                            variant={typeConfig.variant}
                            className={typeConfig.className}
                          >
                            {roomType.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground tabular-nums">
                            ₱{Number(roomType.baseRate).toLocaleString('en-US')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            per night
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            Up to {roomType.maxOccupancy || 2}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-center space-y-0.5">
                          <div className="text-lg font-bold text-foreground tabular-nums">
                            {roomType._count.rooms}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {roomType._count.rooms === 1 ? 'room' : 'rooms'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          {roomType.isActive ? (
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Badge 
                            variant="secondary"
                            className={roomType.isActive 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }
                          >
                            {roomType.isActive ? 'Active' : 'Inactive'}
                          </Badge>
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
                              <Link href={`/admin/properties/${property.slug}/room-types/${roomType.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Room Type
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate Type
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/properties/${property.slug}/rooms/${roomType.id}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                View Live Page
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {roomType.isActive ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Room Type
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
                <Bed className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No room types configured
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Create your first room type to start categorizing your accommodations and accepting bookings.
                </p>
              </div>
              <Button asChild className="mt-6">
                <Link href={`/admin/properties/${property.slug}/room-types/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Room Type
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  DollarSign,
  Calendar,
  Clock,
  Filter,
  ArrowLeft
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface RatesPageProps {
  params: Promise<{ slug: string }>
}

export default async function RatesPage({ params }: RatesPageProps) {
  const { slug } = await params
  
  const property = await prisma.businessUnit.findUnique({
    where: { slug },
    include: {
      roomTypes: {
        include: {
          rates: {
            orderBy: { priority: 'asc' }
          }
        }
      }
    }
  })

  if (!property) {
    return <div>Property not found</div>
  }

  const allRates = property.roomTypes.flatMap(rt => 
    rt.rates.map(rate => ({
      ...rate,
      roomTypeName: rt.displayName,
      roomTypeId: rt.id
    }))
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/admin/operations/properties/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Property
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Room Rates</h1>
            <p className="text-slate-600 mt-1">Manage pricing for {property.displayName}</p>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg">
          <Link href={`/admin/operations/properties/${slug}/rates/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rate
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{allRates.length}</p>
                <p className="text-sm text-slate-600">Total Rates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {allRates.filter(r => r.isActive).length}
                </p>
                <p className="text-sm text-slate-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ₱{allRates.length > 0 ? Math.min(...allRates.map(r => Number(r.baseRate))).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-slate-600">Lowest Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ₱{allRates.length > 0 ? Math.max(...allRates.map(r => Number(r.baseRate))).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-slate-600">Highest Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">All Rates</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search rates..." 
                  className="pl-10 w-80 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {allRates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="font-semibold text-slate-700">Rate Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Room Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Base Rate</TableHead>
                  <TableHead className="font-semibold text-slate-700">Valid Period</TableHead>
                  <TableHead className="font-semibold text-slate-700">Days</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRates.map((rate) => (
                  <TableRow key={rate.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{rate.name}</p>
                          <p className="text-sm text-slate-500">{rate.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">{rate.roomTypeName}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        ₱{Number(rate.baseRate).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">{rate.currency}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-slate-900">
                          {new Date(rate.validFrom).toLocaleDateString()}
                        </div>
                        <div className="text-slate-500">
                          to {new Date(rate.validTo).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rate.monday && <Badge variant="outline" className="text-xs">Mon</Badge>}
                        {rate.tuesday && <Badge variant="outline" className="text-xs">Tue</Badge>}
                        {rate.wednesday && <Badge variant="outline" className="text-xs">Wed</Badge>}
                        {rate.thursday && <Badge variant="outline" className="text-xs">Thu</Badge>}
                        {rate.friday && <Badge variant="outline" className="text-xs">Fri</Badge>}
                        {rate.saturday && <Badge variant="outline" className="text-xs">Sat</Badge>}
                        {rate.sunday && <Badge variant="outline" className="text-xs">Sun</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={rate.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {rate.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/operations/properties/${slug}/rates/${rate.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No rates configured</h3>
              <p className="text-slate-600 mb-6">Create your first rate to start managing pricing.</p>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                <Link href={`/admin/operations/properties/${slug}/rates/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
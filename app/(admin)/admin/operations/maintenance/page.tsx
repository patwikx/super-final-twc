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
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Settings,
  Building,
  XCircle,
  PauseCircle
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Task, User as UserModel, BusinessUnit, Room, RoomType_Model, Department } from "@prisma/client"

// Corrected type to use the 'Task' model and its actual relations
type MaintenanceWithDetails = Task & {
  creator: UserModel;
  assignedUser: UserModel | null;
  room: (Room & {
    businessUnit: BusinessUnit;
    roomType: RoomType_Model;
  }) | null;
  department: (Department & {
      businessUnit: BusinessUnit;
  }) | null;
};

export default async function MaintenancePage() {
  // Corrected Prisma query to use 'task' and its relations
  const maintenanceRequests: MaintenanceWithDetails[] = await prisma.task.findMany({
    include: {
      creator: true,
      assignedUser: true,
      room: {
        include: {
          roomType: true,
          businessUnit: true,
        }
      },
      department: {
        include: {
            businessUnit: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Updated to use ServiceStatus enum values from your schema
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'ASSIGNED': return 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100'
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      case 'ON_HOLD': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  // Updated to use TaskPriority enum values
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      case 'NORMAL': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'URGENT': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  // Updated to use ServiceCategory enum values
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MAINTENANCE': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      case 'HOUSEKEEPING': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'ROOM_SERVICE': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REQUESTED': return Clock
      case 'IN_PROGRESS': return Settings
      case 'COMPLETED': return CheckCircle
      case 'CANCELLED': return XCircle
      case 'ON_HOLD': return PauseCircle
      default: return Clock
    }
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: maintenanceRequests.length,
      icon: Wrench,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: maintenanceRequests.filter(m => m.status === 'REQUESTED' || m.status === 'ASSIGNED').length,
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'In Progress',
      value: maintenanceRequests.filter(m => m.status === 'IN_PROGRESS').length,
      icon: Settings,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Critical/Urgent',
      value: maintenanceRequests.filter(m => m.priority === 'URGENT' || m.priority === 'CRITICAL').length,
      icon: AlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Maintenance Management
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Track and manage maintenance tasks across all properties
          </p>
        </div>
        <Button asChild size="default" className="shrink-0">
          <Link href="/admin/operations/maintenance/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
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

      {/* Maintenance Table */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">
                All Maintenance Tasks
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {maintenanceRequests.length} {maintenanceRequests.length === 1 ? 'task' : 'tasks'} total
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tasks..." className="pl-10 w-full sm:w-80" />
              </div>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /><span className="sr-only">Filter tasks</span></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {maintenanceRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Task</TableHead>
                  <TableHead className="font-semibold text-foreground">Location</TableHead>
                  <TableHead className="font-semibold text-foreground">Category & Priority</TableHead>
                  <TableHead className="font-semibold text-foreground">Assigned To</TableHead>
                  <TableHead className="font-semibold text-foreground">Due Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRequests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status)
                  const businessUnit = request.room?.businessUnit || request.department?.businessUnit;
                  
                  return (
                    <TableRow key={request.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200/50">
                            <Wrench className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground leading-none truncate">{request.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{request.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground text-sm flex items-center gap-2"><Building className="h-4 w-4" />{businessUnit?.displayName}</div>
                          {request.room && (<div className="text-sm text-muted-foreground pl-6">Room {request.room.roomNumber}</div>)}
                          {request.department && !request.room && (<div className="text-sm text-muted-foreground pl-6">{request.department.name}</div>)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-2">
                           <Badge variant="secondary" className={getCategoryColor(request.category)}>{request.category.replace('_', ' ')}</Badge>
                           <Badge variant="secondary" className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {request.assignedUser ? (
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-foreground">{request.assignedUser.firstName} {request.assignedUser.lastName}</div>
                          </div>
                        ) : (<span className="text-sm text-muted-foreground">Unassigned</span>)}
                      </TableCell>
                      <TableCell className="py-4">
                        {request.dueAt ? (<div className="text-sm font-medium text-foreground">{new Date(request.dueAt).toLocaleDateString()}</div>) : (<span className="text-sm text-muted-foreground">Not set</span>)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary" className={getStatusColor(request.status)}>{request.status.replace('_', ' ')}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Open menu</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild><Link href={`/admin/operations/maintenance/${request.id}`}><Eye className="mr-2 h-4 w-4" /> View Details</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/admin/operations/maintenance/${request.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Task</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {request.status === 'ASSIGNED' && (<DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" /> Start Work</DropdownMenuItem>)}
                            {request.status === 'IN_PROGRESS' && (<DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" /> Mark Complete</DropdownMenuItem>)}
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
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted"><Wrench className="h-10 w-10 text-muted-foreground" /></div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No maintenance tasks yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">Start creating tasks to track maintenance activities and ensure property upkeep.</p>
              </div>
              <Button asChild className="mt-6"><Link href="/admin/operations/maintenance/new"><Plus className="mr-2 h-4 w-4" /> Create First Task</Link></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  Building, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DashboardCharts } from "@/components/admin/charts"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickStats } from "@/components/admin/quick-stats"


type TrendType = "up" | "down" | "neutral"

export default async function AdminDashboard() {
  // Fetch dashboard data
  const [
    totalReservations,
    totalGuests,
    totalProperties,
    todayCheckIns,
    todayCheckOuts,
    recentReservations
  ] = await Promise.all([
    prisma.reservation.count(),
    prisma.guest.count(),
    prisma.businessUnit.count({ where: { isActive: true } }),
    prisma.reservation.count({
      where: {
        checkInDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.reservation.count({
      where: {
        checkOutDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { guest: true }
    })
  ])

  const stats = [
    {
      title: "Total Reservations",
      value: totalReservations.toString(),
      change: "+12%",
      trend: "up" as TrendType,
      icon: Calendar,
      iconColor: "bg-blue-50",
      iconTextColor: "text-blue-600"
    },
    {
      title: "Active Guests",
      value: totalGuests.toString(),
      change: "+8%",
      trend: "up" as TrendType,
      icon: Users,
      iconColor: "bg-emerald-50",
      iconTextColor: "text-emerald-600"
    },
    {
      title: "Properties",
      value: totalProperties.toString(),
      change: "0%",
      trend: "neutral" as TrendType,
      icon: Building,
      iconColor: "bg-amber-50",
      iconTextColor: "text-amber-600"
    },
    {
      title: "Revenue",
      value: "₱2.4M",
      change: "+15%",
      trend: "up" as TrendType,
      icon: TrendingUp,
      iconColor: "bg-purple-50",
      iconTextColor: "text-purple-600"
    }
  ]

  const todayStats = [
    {
      title: "Today's Check-ins",
      value: todayCheckIns,
      icon: CheckCircle,
      variant: "success" as const,
      iconColor: "bg-green-50",
      iconTextColor: "text-green-600"
    },
    {
      title: "Today's Check-outs", 
      value: todayCheckOuts,
      icon: Clock,
      variant: "default" as const,
      iconColor: "bg-blue-50",
      iconTextColor: "text-blue-600"
    },
    {
      title: "Pending Tasks",
      value: 12,
      icon: AlertCircle,
      variant: "warning" as const,
      iconColor: "bg-amber-50",
      iconTextColor: "text-amber-600"
    }
  ]

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Welcome back! Here&apos;s what&apos;s happening today.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/reservations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
          </Link>
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                  <div className="flex items-center gap-1.5 text-xs">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : stat.trend === "down" ? (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    ) : null}
                    <span className={
                      stat.trend === "up" ? "text-green-600 font-medium" : 
                      stat.trend === "down" ? "text-red-600 font-medium" : 
                      "text-muted-foreground font-medium"
                    }>
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconTextColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {todayStats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconTextColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border">
          <CardContent className="pl-2">
            <DashboardCharts />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-border">
          <CardContent>
            <RecentActivity reservations={JSON.parse(JSON.stringify(recentReservations))} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="space-y-1.5">
            <CardTitle className="text-xl">Quick Statistics</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Additional metrics and insights
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <QuickStats />
        </CardContent>
      </Card>
    </div>
  )
}
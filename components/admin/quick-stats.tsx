"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Building, Star, Activity } from "lucide-react"

export function QuickStats() {
  const propertyStats = [
    { name: "Tropicana Manila", occupancy: 85, revenue: "₱1.2M", status: "Excellent" },
    { name: "Tropicana Cebu", occupancy: 92, revenue: "₱980K", status: "Outstanding" },
    { name: "Tropicana Boracay", occupancy: 78, revenue: "₱750K", status: "Good" },
  ]

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Outstanding': 
        return { variant: "default" as const, className: "bg-green-100 text-green-800 hover:bg-green-100" }
      case 'Excellent': 
        return { variant: "secondary" as const, className: "bg-blue-100 text-blue-800 hover:bg-blue-100" }
      case 'Good': 
        return { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" }
      default: 
        return { variant: "outline" as const, className: "" }
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Property Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Property Performance
          </CardTitle>
          <CardDescription>
            Current occupancy and revenue by location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {propertyStats.map((property) => (
            <div key={property.name} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{property.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Monthly Revenue: {property.revenue}
                  </p>
                </div>
                <Badge 
                  variant={getStatusVariant(property.status).variant}
                  className={getStatusVariant(property.status).className}
                >
                  {property.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Occupancy Rate</span>
                  <span className="font-medium">{property.occupancy}%</span>
                </div>
                <Progress value={property.occupancy} className="h-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </CardTitle>
          <CardDescription>
            Real-time system performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-3 text-center">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <div className="text-2xl font-bold">1.2s</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Database Performance</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                Optimal
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">API Response Time</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                Fast
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Storage Usage</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                75%
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2 text-xs">
            <Star className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">All systems operational</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
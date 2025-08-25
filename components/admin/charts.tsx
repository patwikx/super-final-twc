"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 2400000, bookings: 145 },
  { month: 'Feb', revenue: 2100000, bookings: 132 },
  { month: 'Mar', revenue: 2800000, bookings: 168 },
  { month: 'Apr', revenue: 3200000, bookings: 195 },
  { month: 'May', revenue: 2900000, bookings: 178 },
  { month: 'Jun', revenue: 3500000, bookings: 210 },
]

const occupancyData = [
  { property: 'Anchor Hotel', occupancy: 85 },
  { property: 'Dolores Tropicana Resort', occupancy: 92 },
  { property: 'Dolores Lake Resort', occupancy: 78 },
  { property: 'Dolores Farm Resort', occupancy: 88 },
]

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))']

export function DashboardCharts() {
  return (
    <div className="space-y-6 mx-8">
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Track performance across different metrics
        </p>
      </div>
      
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger 
            value="revenue"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger 
            value="bookings"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="occupancy"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            Occupancy
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <h4 className="text-base font-semibold">Monthly Revenue</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Revenue trends over the past 6 months
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
                                Month
                              </span>
                              <span className="font-semibold text-foreground">
                                {label}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
                                Revenue
                              </span>
                              <span className="font-semibold text-foreground">
                                ₱{(payload[0].value as number).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <h4 className="text-base font-semibold">Booking Trends</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Number of bookings over time
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
                                Month
                              </span>
                              <span className="font-semibold text-foreground">
                                {label}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
                                Bookings
                              </span>
                              <span className="font-semibold text-foreground">
                                {payload[0].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ 
                    fill: "hsl(var(--primary))", 
                    strokeWidth: 2, 
                    r: 4,
                    className: "fill-primary stroke-primary"
                  }}
                  activeDot={{ 
                    r: 6, 
                    className: "fill-primary stroke-primary"
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="occupancy" className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <h4 className="text-base font-semibold">Occupancy Rates</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Current occupancy by property location
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="occupancy"
                  label={({ property, occupancy }) => `${property}: ${occupancy}%`}
                  labelLine={false}
                  className="text-xs fill-muted-foreground"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(var(--chart-${(index % 4) + 1}))`}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
                                Property
                              </span>
                              <span className="font-semibold text-foreground">
                                {data.property}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
                                Occupancy
                              </span>
                              <span className="font-semibold text-foreground">
                                {data.occupancy}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
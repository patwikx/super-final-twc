"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight, Clock } from "lucide-react"
import { Reservation, Guest } from "@prisma/client"
import Link from "next/link"
import { motion } from "framer-motion"

interface RecentActivityProps {
  reservations: (Reservation & { guest: Guest })[]
}

export function RecentActivity({ reservations }: RecentActivityProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED': 
        return { variant: "secondary" as const, className: "bg-green-100 text-green-800 hover:bg-green-100" }
      case 'PENDING': 
        return { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" }
      case 'CHECKED_IN': 
        return { variant: "default" as const, className: "bg-blue-100 text-blue-800 hover:bg-blue-100" }
      case 'CHECKED_OUT': 
        return { variant: "secondary" as const, className: "" }
      case 'CANCELLED': 
        return { variant: "destructive" as const, className: "bg-red-100 text-red-800 hover:bg-red-100" }
      default: 
        return { variant: "secondary" as const, className: "" }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Latest reservations and updates
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/reservations">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {reservations.map((reservation, index) => (
          <motion.div
            key={reservation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4" />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">
                    {reservation.guest.firstName} {reservation.guest.lastName}
                  </p>
                  <Badge 
                    variant={getStatusVariant(reservation.status).variant}
                    className={`text-xs ${getStatusVariant(reservation.status).className}`}
                  >
                    {reservation.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{reservation.confirmationNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(reservation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium">₱{Number(reservation.totalAmount).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{reservation.nights} nights</p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {reservations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <Calendar className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No recent reservations</p>
          </div>
        )}
      </div>
    </div>
  )
}
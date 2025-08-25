"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Wifi, Car, Utensils, Dumbbell, Waves, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit } from "@prisma/client"

interface PropertyOverviewProps {
  property: BusinessUnit;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const features = [
    { icon: Wifi, label: "Complimentary WiFi", description: "High-speed internet throughout" },
    { icon: Car, label: "Valet Parking", description: "24/7 complimentary service" },
    { icon: Utensils, label: "Fine Dining", description: "Award-winning restaurants" },
    { icon: Dumbbell, label: "Fitness Center", description: "State-of-the-art equipment" },
    { icon: Waves, label: "Spa & Wellness", description: "Rejuvenating treatments" },
    { icon: Shield, label: "Concierge", description: "Personalized assistance" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="h-4 w-4" />
              About This Property
            </div>
            
            <h2 className="text-4xl font-bold font-serif text-slate-900 mb-6 leading-tight">
              Experience Luxury at
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                {property.displayName}
              </span>
            </h2>

            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p className="text-lg">
                {property.longDescription || property.shortDescription}
              </p>
              
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">5.0</div>
                  <div className="text-sm text-slate-600">Guest Rating</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">Concierge</div>
                </div>
              </div>

              {/* Check-in/out times */}
              <div className="flex items-center gap-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Check-in: {property.checkInTime || '3:00 PM'}</div>
                    <div className="text-sm text-slate-600">Check-out: {property.checkOutTime || '12:00 PM'}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Card className="p-6 h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white group-hover:bg-gradient-to-br group-hover:from-amber-50 group-hover:to-orange-50">
                    <CardContent className="p-0 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-2">{feature.label}</h4>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
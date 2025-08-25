"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, Car, Plane, Train } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit } from "@prisma/client"

interface PropertyLocationProps {
  property: BusinessUnit;
}

export function PropertyLocation({ property }: PropertyLocationProps) {
  const nearbyAttractions = [
    { name: "City Center", distance: "2.5 km", time: "5 min drive" },
    { name: "International Airport", distance: "15 km", time: "20 min drive" },
    { name: "Shopping District", distance: "1.2 km", time: "3 min walk" },
    { name: "Business District", distance: "800 m", time: "2 min walk" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MapPin className="h-4 w-4" />
            Location & Access
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-6 leading-tight">
            Prime Location
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Strategically located in the heart of {property.city}, with easy access to major attractions and business centers.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden shadow-xl border-0">
              <div className="relative h-96 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <div className="text-center text-slate-600">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-lg font-medium">Interactive Map</p>
                  <p className="text-sm">Coming Soon</p>
                </div>
                {/* In a real app, you'd integrate Google Maps or similar */}
              </div>
            </Card>
          </motion.div>

          {/* Location Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Address */}
            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Address</h4>
                    <p className="text-slate-600 leading-relaxed">
                      {property.address || `${property.city}, ${property.country}`}
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-amber-600 hover:text-amber-700 mt-2"
                      asChild
                    >
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(property.address || `${property.city}, ${property.country}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <Navigation className="h-4 w-4" />
                        Get Directions
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Attractions */}
            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Nearby Attractions
                </h4>
                <div className="space-y-3">
                  {nearbyAttractions.map((attraction) => (
                    <div key={attraction.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-amber-50 transition-colors">
                      <div>
                        <div className="font-medium text-slate-900">{attraction.name}</div>
                        <div className="text-sm text-slate-600">{attraction.distance}</div>
                      </div>
                      <div className="text-sm text-amber-600 font-medium">
                        {attraction.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <h4 className="font-semibold text-slate-900 mb-4">Transportation</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-amber-50 transition-colors group">
                    <Plane className="h-8 w-8 text-slate-600 group-hover:text-amber-600 mx-auto mb-2 transition-colors" />
                    <div className="text-sm font-medium text-slate-900">Airport</div>
                    <div className="text-xs text-slate-600">20 min</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-amber-50 transition-colors group">
                    <Train className="h-8 w-8 text-slate-600 group-hover:text-amber-600 mx-auto mb-2 transition-colors" />
                    <div className="text-sm font-medium text-slate-900">Train</div>
                    <div className="text-xs text-slate-600">5 min</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-amber-50 transition-colors group">
                    <Car className="h-8 w-8 text-slate-600 group-hover:text-amber-600 mx-auto mb-2 transition-colors" />
                    <div className="text-sm font-medium text-slate-900">Taxi</div>
                    <div className="text-xs text-slate-600">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
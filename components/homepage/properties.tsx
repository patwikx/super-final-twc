"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowRight, Building, Star, Wifi, Car, Utensils, Waves, Users, Calendar, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit, BusinessUnitImage, Image as PrismaImage } from "@prisma/client"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

// ✅ **CHANGE 1: Define a more specific type for the properties**
// This type includes the nested image data we're fetching from the server.
type BusinessUnitWithImages = BusinessUnit & {
  images: (BusinessUnitImage & {
    image: PrismaImage;
  })[];
};

// ✅ **CHANGE 2: Update the props interface to use the new type**
interface BusinessUnitsSectionProps {
  businessUnits: BusinessUnitWithImages[];
}

export function BusinessUnitsSection({ businessUnits = [] }: BusinessUnitsSectionProps) {
  if (businessUnits.length === 0) return null;

  type PropertyTypeInfo = {
    label: string;
    color: string;
    icon: LucideIcon;
  };

  const getPropertyTypeInfo = (type: string): PropertyTypeInfo => {
    const typeMap: Record<string, PropertyTypeInfo> = {
      'HOTEL': { label: 'Urban Hotel', color: 'bg-blue-500', icon: Building },
      'RESORT': { label: 'Beach Resort', color: 'bg-emerald-500', icon: Waves },
      'VILLA_COMPLEX': { label: 'Villa Complex', color: 'bg-purple-500', icon: Building },
      'APARTMENT_HOTEL': { label: 'Apartment Hotel', color: 'bg-orange-500', icon: Building },
      'BOUTIQUE_HOTEL': { label: 'Boutique Hotel', color: 'bg-pink-500', icon: Building },
    };
    return typeMap[type] || { label: type, color: 'bg-slate-500', icon: Building };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <section id="properties" className="bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjFmNWY5IiBzdG9wLW9wYWNpdHk9Ii4xIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZjFmNWY5IiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 mb-6 leading-tight">
            Our Luxury
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Properties
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover our collection of world-class properties, each offering unique experiences and unparalleled hospitality.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {businessUnits.map((property, index) => {
            const typeInfo = getPropertyTypeInfo(property.propertyType);
            const IconComponent = typeInfo.icon;
            const isEven = index % 2 === 0;

            // ✅ **CHANGE 3: Get the primary image from the nested 'images' array**
            const primaryImage = 
              property.images?.[0]?.image?.largeUrl || // Prefer large images for this layout
              property.images?.[0]?.image?.originalUrl;
            
            const fallbackImageUrl = `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
            
            return (
              <motion.div
                key={property.id}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="group"
              >
                <Card className="overflow-hidden shadow-xl mb-20 hover:shadow-2xl transition-all duration-700 bg-white border-0 relative">
                  <div className={`grid lg:grid-cols-2 gap-0 ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
                    {/* Image Section */}
                    <div className={`relative h-96 lg:h-[500px] overflow-hidden ${!isEven ? 'lg:col-start-2' : ''}`}>
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7 }}
                        src={primaryImage || fallbackImageUrl}
                        alt={property.displayName}
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      <div className="absolute top-6 left-6">
                        <Badge className={`${typeInfo.color} text-white font-medium border-0 shadow-lg px-4 py-2`}>
                          <IconComponent className="h-4 w-4 mr-2" />
                          {typeInfo.label}
                        </Badge>
                      </div>

                      <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-slate-900">5.0</span>
                      </div>

                      <div className="absolute bottom-6 left-6 flex items-center gap-2 text-white">
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">{property.city}, {property.country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${!isEven ? 'lg:col-start-1' : ''}`}>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 font-serif mb-4 group-hover:text-amber-700 transition-colors leading-tight">
                            {property.displayName}
                          </h3>
                          <p className="text-slate-600 text-lg leading-relaxed">
                            {property.shortDescription}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Wifi className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">Free WiFi</div>
                              <div className="text-xs text-slate-500">High-speed internet</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Car className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">Parking</div>
                              <div className="text-xs text-slate-500">Complimentary valet</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Utensils className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">Fine Dining</div>
                              <div className="text-xs text-slate-500">Award-winning cuisine</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Users className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">Concierge</div>
                              <div className="text-xs text-slate-500">24/7 service</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                          {property.phone && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm font-medium">{property.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">Available year-round</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                          <Button 
                            asChild
                            size="lg"
                            className="group/btn flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
                          >
                            <Link href={`/properties/${property.slug}`} className="flex items-center justify-center gap-2">
                              <Calendar className="h-5 w-5" />
                              <span>Book Now</span>
                              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                            </Link>
                          </Button>
                          
                          <Button 
                            asChild
                            size="lg"
                            variant="outline"
                            className="group/btn flex-1 border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-semibold py-4 rounded-xl transition-all duration-300"
                          >
                            <Link href={`/properties/${property.slug}`} className="flex items-center justify-center gap-2">
                              <Building className="h-5 w-5" />
                              <span>Explore Property</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  )
}
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Bed, ArrowRight, Wifi, Coffee, Bath, Tv } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit, RoomType_Model, RoomTypeImage, Image as PrismaImage } from "@prisma/client"
import Link from "next/link"

// ✅ 1. Define a more specific type for the roomTypes prop
type RoomTypeWithDetails = RoomType_Model & {
  _count: { rooms: number };
  images: (RoomTypeImage & {
    image: PrismaImage;
  })[];
};

// ✅ 2. Update the props interface to use the new type
interface PropertyRoomsProps {
  property: BusinessUnit;
  roomTypes: RoomTypeWithDetails[];
}

export function PropertyRooms({ property, roomTypes }: PropertyRoomsProps) {
  // This function can remain as a final fallback
  const getFallbackImage = (type: string) => {
    const imageMap: Record<string, string> = {
      'STANDARD': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'DELUXE': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'SUITE': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'VILLA': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    };
    return imageMap[type] || imageMap['STANDARD'];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-6 leading-tight">
            Luxury Accommodations
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Choose from our carefully designed rooms and suites, each offering comfort, elegance, and stunning views.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {roomTypes.map((roomType) => {
            // ✅ 3. Get the primary image from the nested 'images' array
            const primaryImage = 
              roomType.images?.[0]?.image?.mediumUrl ||
              roomType.images?.[0]?.image?.originalUrl;

            return (
              <motion.div
                key={roomType.id}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="group"
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border-0 h-full">
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      src={primaryImage || getFallbackImage(roomType.type)}
                      alt={roomType.displayName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-slate-900 font-medium">
                        {roomType._count.rooms} Available
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-2xl font-bold">₱{Number(roomType.baseRate).toLocaleString()}</div>
                      <div className="text-sm text-white/80">per night</div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 font-serif group-hover:text-amber-700 transition-colors">
                        {roomType.displayName}
                      </h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {roomType.type.replace('_', ' ').toLowerCase()}
                      </Badge>
                    </div>

                    <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-2">
                      {roomType.description || "Elegantly appointed accommodation with modern amenities and stunning views."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Up to {roomType.maxOccupancy} guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Bed className="h-4 w-4" />
                        <span className="text-sm">{roomType.bedConfiguration || "King bed"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6 text-slate-400">
                      <Wifi className="h-4 w-4" />
                      <Coffee className="h-4 w-4" />
                      <Bath className="h-4 w-4" />
                      <Tv className="h-4 w-4" />
                    </div>

                    <Button 
                      asChild
                      className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg group/btn"
                    >
                      <Link href={`/properties/${property.slug}/rooms/${roomType.id}`} className="flex items-center justify-center gap-2">
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-300 group"
          >
            <Link href={`/properties/${property.slug}/rooms`} className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              <span>View All Rooms & Suites</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
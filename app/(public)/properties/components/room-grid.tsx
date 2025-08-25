"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Bed, ArrowRight, Wifi, Coffee, Bath, Tv, Maximize, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { BusinessUnit, RoomType_Model, RoomRate, RoomTypeImage, Image as PrismaImage } from "@prisma/client"

// ✅ 1. Define a more specific type for the roomTypes prop
type RoomTypeWithDetails = RoomType_Model & {
  _count: { rooms: number };
  rates: RoomRate[];
  images: (RoomTypeImage & {
    image: PrismaImage;
  })[];
};

// ✅ 2. Update the props interface to use the new type
interface RoomsGridProps {
  property: BusinessUnit;
  roomTypes: RoomTypeWithDetails[];
}

export function RoomsGrid({ property, roomTypes }: RoomsGridProps) {
  const router = useRouter();

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

  const handleViewDetails = (roomTypeId: string) => {
    router.push(`/properties/${property.slug}/rooms/${roomTypeId}`);
  };

  const handleBookRoom = (roomTypeId: string) => {
    router.push(`/properties/${property.slug}/rooms/${roomTypeId}`);
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {roomTypes.map((roomType, index) => {
        const isEven = index % 2 === 0;
        const currentRate = roomType.rates[0];
        
        // ✅ 3. Get the primary image from the nested 'images' array
        const primaryImage = 
          roomType.images?.find(img => img.isPrimary)?.image?.mediumUrl ||
          roomType.images?.[0]?.image?.mediumUrl ||
          roomType.images?.[0]?.image?.originalUrl;

        return (
          <motion.div
            key={roomType.id}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group"
          >
            <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 bg-white border-0">
              <div className={`grid lg:grid-cols-5 gap-0 ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Image Section */}
                <div className={`lg:col-span-2 relative h-80 lg:h-96 overflow-hidden ${!isEven ? 'lg:col-start-4' : ''}`}>
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                    src={primaryImage || getFallbackImage(roomType.type)}
                    alt={roomType.displayName}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/90 text-slate-900 font-medium border-0 shadow-lg capitalize">
                      {roomType.type.replace('_', ' ').toLowerCase()}
                    </Badge>
                  </div>

                  <div className="absolute top-6 right-6">
                    <Badge className="bg-green-500 text-white font-medium border-0 shadow-lg">
                      {roomType._count.rooms} Available
                    </Badge>
                  </div>

                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="text-3xl font-bold">₱{Number(currentRate?.baseRate || roomType.baseRate).toLocaleString()}</div>
                    <div className="text-sm text-white/80">per night</div>
                  </div>

                  <div className="absolute bottom-6 right-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(roomType.id)}
                      className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Gallery
                    </Button>
                  </div>
                </div>

                {/* Content Section */}
                <div className={`lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center ${!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 font-serif mb-4 group-hover:text-amber-700 transition-colors leading-tight">
                        {roomType.displayName}
                      </h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        {roomType.description || "Elegantly appointed accommodation with modern amenities and stunning views."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Occupancy</div>
                          <div className="text-xs text-slate-500">Up to {roomType.maxOccupancy}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Bed className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Bed Type</div>
                          <div className="text-xs text-slate-500">{roomType.bedConfiguration || "King bed"}</div>
                        </div>
                      </div>
                      
                      {roomType.roomSize && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Maximize className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">Size</div>
                            <div className="text-xs text-slate-500">{Number(roomType.roomSize)} sqm</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900">Room Amenities</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Wifi className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Free WiFi</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Coffee className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">Coffee Maker</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Bath className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Luxury Bathroom</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Tv className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Smart TV</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button 
                        size="lg"
                        onClick={() => handleBookRoom(roomType.id)}
                        className="group/btn flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
                      >
                        <span>Book This Room</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                      </Button>
                      
                      <Button 
                        size="lg"
                        variant="outline"
                        onClick={() => handleViewDetails(roomType.id)}
                        className="group/btn flex-1 border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-semibold py-4 rounded-xl transition-all duration-300"
                      >
                        <Eye className="h-5 w-5 mr-2" />
                        <span>View Details</span>
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
  )
}
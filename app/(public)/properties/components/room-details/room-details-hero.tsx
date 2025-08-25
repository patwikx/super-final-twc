"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Users, Bed, Maximize, Wifi, Coffee, Bath, Tv } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessUnit, RoomType_Model, RoomTypeImage, Image as PrismaImage } from "@prisma/client"
import Link from "next/link"

// ✅ 1. Define a more specific type for the roomType prop
type RoomTypeWithImages = RoomType_Model & {
  images: (RoomTypeImage & {
    image: PrismaImage;
  })[];
};

// ✅ 2. Update the props interface to use the new type
interface RoomDetailsHeroProps {
  property: BusinessUnit;
  roomType: RoomTypeWithImages;
}

export function RoomDetailsHero({ property, roomType }: RoomDetailsHeroProps) {
  // This function can remain as a final fallback
  const getFallbackImage = (type: string) => {
    const imageMap: Record<string, string> = {
      'STANDARD': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'DELUXE': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'SUITE': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'VILLA': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    };
    return imageMap[type] || imageMap['STANDARD'];
  };

  // ✅ 3. Get the primary image from the nested 'images' array
  const primaryImage = 
    roomType.images?.find(img => img.isPrimary)?.image?.largeUrl ||
    roomType.images?.[0]?.image?.largeUrl ||
    roomType.images?.[0]?.image?.originalUrl;

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${primaryImage || getFallbackImage(roomType.type)})` 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Button
          asChild
          variant="outline"
          className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
        >
          <Link href={`/properties/${property.slug}/rooms`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>
        </Button>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end z-10">
        <div className="container mx-auto px-6 pb-16">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif leading-tight text-white">
              {roomType.displayName}
            </h1>

            {/* Property Name */}
            <p className="text-xl text-slate-200 mb-8">
              at {property.displayName}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Up to {roomType.maxOccupancy}</div>
                    <div className="text-slate-300 text-sm">Guests</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Bed className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{roomType.bedConfiguration || "King"}</div>
                    <div className="text-slate-300 text-sm">Bed</div>
                  </div>
                </div>
              </div>

              {roomType.roomSize && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Maximize className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{Number(roomType.roomSize)} sqm</div>
                      <div className="text-slate-300 text-sm">Size</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">5.0</div>
                    <div className="text-slate-300 text-sm">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Amenities */}
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Free WiFi</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-amber-400" />
                <span className="text-sm">Coffee Maker</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-purple-400" />
                <span className="text-sm">Luxury Bath</span>
              </div>
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-green-400" />
                <span className="text-sm">Smart TV</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Calendar, Phone, Mail, ChevronLeft, ChevronRight, Building, Waves } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { BusinessUnit, BusinessUnitImage, Image as PrismaImage } from "@prisma/client"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

// ✅ 1. Define a more specific type for the property prop
type PropertyWithImages = BusinessUnit & {
  images: (BusinessUnitImage & {
    image: PrismaImage;
  })[];
};

// ✅ 2. Update the props interface to use the new type
interface PropertyHeroProps {
  property: PropertyWithImages;
}

type PropertyTypeInfo = {
  label: string;
  color: string;
  icon: LucideIcon;
}

export function PropertyHero({ property }: PropertyHeroProps) {
  const [currentImage, setCurrentImage] = useState(0);
  
  // ✅ 3. Dynamically create the images array from the property data
  const images = property.images?.length > 0
    ? property.images.map(img => img.image.largeUrl || img.image.originalUrl)
    : [ "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" ];

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

  const typeInfo = getPropertyTypeInfo(property.propertyType);
  const IconComponent = typeInfo.icon;

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${images[currentImage]})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <Button
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-20"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Content */}
      <div className="relative h-full flex items-center justify-center z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            {/* Property Type Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/20">
              <IconComponent className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium">{typeInfo.label}</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif leading-tight">
              <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                {property.displayName}
              </span>
            </h1>

            {/* Location */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <MapPin className="h-5 w-5 text-amber-400" />
              <span className="text-xl text-slate-200">{property.city}, {property.country}</span>
            </div>

            {/* Description */}
            {property.shortDescription && (
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-slate-200">
                {property.shortDescription}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center justify-center gap-2 mb-10">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-slate-300 ml-2">5-Star Luxury Experience</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 border-0 rounded-full"
              >
                <Link href={`/properties/${property.slug}#booking-widget`}>
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Your Stay
                </Link>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 rounded-full"
              >
                <Link href={`/properties/${property.slug}/rooms`}>
                  View Rooms & Suites
                </Link>
              </Button>
            </div>

            {/* Quick Contact */}
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-slate-300">
              {property.phone && (
                <a href={`tel:${property.phone}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Phone className="h-4 w-4 text-amber-400" />
                  <span>{property.phone}</span>
                </a>
              )}
              {property.email && (
                <a href={`mailto:${property.email}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Mail className="h-4 w-4 text-amber-400" />
                  <span>{property.email}</span>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <Button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-2 transition-all duration-300 rounded-full ${
                index === currentImage
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
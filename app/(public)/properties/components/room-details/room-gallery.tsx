/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { RoomType_Model, RoomTypeImage, Image as PrismaImage } from "@prisma/client"

// ✅ 1. Define a more specific type for the roomType prop
type RoomTypeWithImages = RoomType_Model & {
  images: (RoomTypeImage & {
    image: PrismaImage;
  })[];
};

// ✅ 2. Update the props interface to use the new type
interface RoomGalleryProps {
  roomType: RoomTypeWithImages;
}

export function RoomGallery({ roomType }: RoomGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // This function provides fallback images if none are in the database
  const getFallbackImages = (type: string) => {
    const imageMap: Record<string, string[]> = {
      'STANDARD': ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', /* ... */],
      'DELUXE': ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', /* ... */],
      'SUITE': ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', /* ... */],
      'VILLA': ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', /* ... */],
    };
    return (imageMap[type] || imageMap['STANDARD']).map(url => ({
      thumb: url,
      full: url
    }));
  };
  
  // ✅ 3. Process the images from the database into a consistent format
  const images = roomType.images?.length > 0
    ? roomType.images.map(img => ({
        thumb: img.image.thumbnailUrl || img.image.smallUrl || img.image.originalUrl,
        full: img.image.largeUrl || img.image.originalUrl,
      }))
    : getFallbackImages(roomType.type);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  if (images.length === 0) {
    return null; // Don't render the gallery if there are no images at all
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="p-8 pb-6">
          <h3 className="text-2xl font-bold font-serif text-slate-900 mb-2">Room Gallery</h3>
          <p className="text-slate-600">Explore every detail of your future accommodation</p>
        </div>

        <div className="relative">
          <div className="relative h-96 overflow-hidden rounded-lg">
            <motion.img
              key={currentImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              src={images[currentImage].full} // ✅ Use the 'full' size image
              alt={`${roomType.displayName} - Image ${currentImage + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            />
            
            {images.length > 1 && (
              <>
                <Button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            <button onClick={() => setIsLightboxOpen(true)} className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white hover:bg-black/70 transition-all duration-300 flex items-center gap-2">
              <Maximize className="h-4 w-4" />
              <span className="text-sm">View Gallery</span>
            </button>
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm">
              {currentImage + 1} / {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <div className="p-6">
              <div className="flex gap-3 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentImage ? "border-amber-400 ring-2 ring-amber-400/20" : "border-slate-200 hover:border-amber-300"}`}
                  >
                    <img
                      src={image.thumb} // ✅ Use the 'thumb' size image
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[currentImage].full} // ✅ Use the 'full' size image in lightbox
                alt={`${roomType.displayName} - Image ${currentImage + 1}`}
                className="w-full h-full object-contain rounded-lg"
              />
              
              <Button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300">
                <X className="h-5 w-5" />
              </Button>

              {images.length > 1 && (
                <>
                  <Button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300">
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
                {currentImage + 1} of {images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
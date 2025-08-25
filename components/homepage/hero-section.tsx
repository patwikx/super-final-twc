"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Play, Calendar, Users } from "lucide-react";
import { BusinessUnit, BusinessUnitImage, Image as PrismaImage } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

// Define a more specific type for our properties that includes the nested image data
type FeaturedProperty = BusinessUnit & {
  images: (BusinessUnitImage & {
    image: PrismaImage;
  })[];
};

// Update the props interface to use the new type
interface HeroSectionProps {
  featuredProperties: FeaturedProperty[];
}

export function HeroSection({ featuredProperties = [] }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (featuredProperties.length <= 1 || !isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [featuredProperties.length, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  if (featuredProperties.length === 0) {
    return (
      <section className="relative h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii4wNSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-20"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center text-white z-10"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 font-serif bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
            Tropicana
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-300">Experience Unforgettable Hospitality</p>
          <div className="flex items-center justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images with Crossfade Transition */}
      <div className="absolute inset-0">
        {featuredProperties.map((slide, index) => {
          const heroImage = 
            slide.images?.find(img => img.context === 'hero')?.image?.largeUrl ||
            slide.images?.find(img => img.context === 'hero')?.image?.originalUrl ||
            slide.images?.[0]?.image?.largeUrl ||
            slide.images?.[0]?.image?.originalUrl;
          
          const fallbackImageUrl = `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80`;

          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{ 
                opacity: index === currentSlide ? 1 : 0,
                scale: index === currentSlide ? 1 : 1.02
              }}
              transition={{ 
                opacity: { duration: 0.8, ease: "easeInOut" },
                scale: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${heroImage || fallbackImageUrl})` 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
            </motion.div>
          );
        })}
      </div>

      {/* Floating Elements with Improved Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 3, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -2, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 left-16 w-24 h-24 bg-amber-400/10 rounded-full backdrop-blur-sm"
        />
      </div>

      {/* Main Content with Staggered Animations */}
      <div className="relative h-full flex items-center justify-center z-10">
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            {featuredProperties.map((slide, index) => (
              index === currentSlide && (
                <motion.div
                  key={slide.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-center text-white max-w-5xl mx-auto"
                >
                  {/* Property Badge */}
                  {/* Main Title with Character Animation */}
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                    className="text-5xl md:text-8xl font-bold mb-6 font-serif leading-tight"
                  >
                    <motion.span 
                      initial={{ backgroundPosition: "0% 50%" }}
                      animate={{ backgroundPosition: "100% 50%" }}
                      transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
                      className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent bg-[length:200%_100%]"
                    >
                      {slide.displayName}
                    </motion.span>
                  </motion.h1>

                  {/* Description */}
                  {slide.shortDescription && (
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
                      className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-slate-200"
                    >
                      {slide.shortDescription}
                    </motion.p>
                  )}

                  {/* Rating with Staggered Stars */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.4, type: "spring", stiffness: 200 }}
                    className="flex items-center justify-center gap-2 mb-10"
                  >
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.5 + (i * 0.05), duration: 0.3, type: "spring", stiffness: 200 }}
                        >
                          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.75, duration: 0.3 }}
                      className="text-sm text-slate-300 ml-2"
                    >
                      Luxury Hospitality Excellence
                    </motion.span>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Button
                        size="lg"
                        asChild
                        className="group text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 border-0 rounded-full"
                      >
                        <Link href={`/properties/${slide.slug}`} className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                          Book Your Stay
                        </Link>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="group text-lg px-8 py-6 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 rounded-full"
                      >
                        <Link href={`/properties/${slide.slug}`} className="flex items-center gap-2">
                          <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                          Virtual Tour
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Quick Info */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
                    className="flex items-center justify-center gap-8 mt-12 text-sm text-slate-300"
                  >
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.85, duration: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4 text-amber-400" />
                      <span>Premium Service</span>
                    </motion.div>
                    <div className="h-4 w-px bg-slate-400"></div>
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4 text-amber-400" />
                      <span>5-Star Luxury</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls with Enhanced Interactions */}
      {featuredProperties.length > 1 && (
        <>
          {/* Slide Indicators with Smoother Transitions */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {featuredProperties.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goToSlide(index)}
                className={`relative transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "w-12 h-3 bg-white shadow-lg"
                    : "w-3 h-3 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentSlide && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Auto-play Control */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute bottom-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 z-20"
          >
            {isAutoPlaying ? (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-current rounded-full" 
              />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </motion.button>
        </>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent"
        />
      </motion.div>
    </section>
  )
}
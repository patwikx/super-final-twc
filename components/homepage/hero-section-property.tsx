"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Play, Calendar, Users, Sparkles, Zap, Heart } from "lucide-react";
import { BusinessUnit, BusinessUnitImage, Image as PrismaImage } from "@prisma/client";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

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

export function HeroSectionProperty({ featuredProperties = [] }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  useEffect(() => {
    if (featuredProperties.length <= 1 || !isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [featuredProperties.length, isAutoPlaying]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  if (featuredProperties.length === 0) {
    return (
      <section ref={containerRef} className="relative h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        {/* Dynamic Particle Background */}
        <motion.div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              }}
              animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
            />
          ))}
        </motion.div>

        {/* Interactive Cursor Glow */}
        <motion.div
          className="fixed w-96 h-96 rounded-full pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)`,
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Gradient Meshes */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 100 }}
          className="text-center text-white z-10 relative"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 1.5, 
              type: "spring", 
              stiffness: 100,
              delay: 0.3 
            }}
            className="relative inline-block"
          >
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-white mb-8 leading-none tracking-tight">
              TROPICANA
            </h1>
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xl md:text-2xl mb-8 text-slate-300 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Immersive luxury experiences that transcend the ordinary hospitality.
          </motion.p>
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.1 + (i * 0.05), duration: 0.4, type: "spring", stiffness: 200 }}
              >
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Background Images with Enhanced Transitions */}
      <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
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
                scale: index === currentSlide ? 1 : 1.05
              }}
              transition={{ 
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${heroImage || fallbackImageUrl})` 
                }}
              />
              {/* Enhanced Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
              
              {/* Holographic Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-blue-500/10"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(245,158,11,0.1) 0%, rgba(168,85,247,0.05) 50%, rgba(59,130,246,0.1) 100%)",
                    "linear-gradient(225deg, rgba(59,130,246,0.1) 0%, rgba(236,72,153,0.05) 50%, rgba(245,158,11,0.1) 100%)",
                    "linear-gradient(45deg, rgba(245,158,11,0.1) 0%, rgba(168,85,247,0.05) 50%, rgba(59,130,246,0.1) 100%)"
                  ]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dynamic Particle Background */}
      <motion.div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        ))}
      </motion.div>

      {/* Interactive Cursor Glow */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)`,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Elements with Enhanced Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -25, 0], 
            rotate: [0, 5, 0], 
            scale: [1, 1.1, 1],
            background: [
              "rgba(245, 158, 11, 0.05)",
              "rgba(168, 85, 247, 0.05)", 
              "rgba(245, 158, 11, 0.05)"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 rounded-full backdrop-blur-sm border border-white/10"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0], 
            rotate: [0, -3, 0], 
            scale: [1, 0.9, 1],
            background: [
              "rgba(59, 130, 246, 0.05)",
              "rgba(236, 72, 153, 0.05)", 
              "rgba(59, 130, 246, 0.05)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-32 left-16 w-24 h-24 rounded-full backdrop-blur-sm border border-white/10"
        />
        <motion.div
          animate={{ 
            y: [0, -20, 0], 
            rotate: [0, 2, 0], 
            scale: [1, 1.05, 1] 
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-20 w-16 h-16 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full backdrop-blur-sm border border-white/10"
        />
      </div>

      {/* Main Content with Enhanced Staggered Animations */}
      <div className="relative h-full flex items-center justify-center z-20">
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            {featuredProperties.map((slide, index) => (
              index === currentSlide && (
                <motion.div
                  key={slide.id}
                  initial={{ y: 60, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -30, opacity: 0, scale: 1.05 }}
                  transition={{ 
                    duration: 1.0, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  style={{ y: titleY, opacity }}
                  className="text-center text-white max-w-5xl mx-auto"
                >
                  {/* Main Title with Advanced Character Animation */}
                  <motion.div className="relative mb-8">
                    <motion.h1
                      initial={{ y: 40, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: 0.3, 
                        duration: 1.2, 
                        ease: "easeOut",
                        type: "spring",
                        stiffness: 100
                      }}
                      className="text-5xl font-serif md:text-8xl font-black mb-6 leading-tight tracking-tight relative"
                    >
                      <motion.span 
                        initial={{ backgroundPosition: "0% 50%" }}
                        animate={{ backgroundPosition: "100% 50%" }}
                        transition={{ 
                          delay: 0.6, 
                          duration: 2.0, 
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-white  to-white bg-[length:400%_100%]"
                      >
                        {slide.displayName}
                      </motion.span>
                    </motion.h1>
                    
                    {/* Glowing Text Effect */}
                    <motion.div
                      className="absolute -inset-4 bg-gradient-to-r from-amber-600/20 via-white/10 to-amber-600/20 blur-2xl"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>

                  {/* Description with Floating Effect */}
                  {slide.shortDescription && (
                    <motion.div className="relative mb-10">
                      <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ 
                          delay: 0.5, 
                          duration: 0.8, 
                          ease: "easeOut" 
                        }}
                        className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed text-slate-200 font-light"
                      >
                        {slide.shortDescription}
                      </motion.p>
                      
                      {/* Sparkle Effects */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute -top-4 -right-4 w-6 h-6"
                      >
                        <Sparkles className="h-6 w-6 text-amber-400/60" />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Rating with Advanced Staggered Stars */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.7, 
                      duration: 0.6, 
                      type: "spring", 
                      stiffness: 200 
                    }}
                    className="flex items-center justify-center gap-3 mb-12"
                  >
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180, y: 20 }}
                          animate={{ scale: 1, rotate: 0, y: 0 }}
                          transition={{ 
                            delay: 0.8 + (i * 0.08), 
                            duration: 0.5, 
                            type: "spring", 
                            stiffness: 300,
                            damping: 20
                          }}
                          whileHover={{ 
                            scale: 1.3, 
                            rotate: 15,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <Star className="h-6 w-6 fill-amber-400 text-amber-400 drop-shadow-lg" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        delay: 1.2, 
                        duration: 0.6,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="ml-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                    >
                      <span className="text-sm text-slate-300 font-medium flex items-center gap-2">
                        <Heart className="h-4 w-4 text-amber-400" />
                        Luxury Hospitality Excellence
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* Action Buttons with Advanced Hover Effects */}
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      delay: 0.9, 
                      duration: 0.8, 
                      ease: "easeOut" 
                    }}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
                  >
                    <motion.div
                      whileHover={{ 
                        scale: 1.05, 
                        y: -5,
                        rotateX: 5,
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Button
                        size="lg"
                        asChild
                        className="group text-lg px-10 py-6 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 shadow-2xl hover:shadow-amber-500/40 transition-all duration-500 border-0 rounded-2xl font-black relative overflow-hidden"
                      >
                        <Link href={`/properties/${slide.slug}`} className="flex items-center gap-3 relative z-10">
                          <Calendar className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                          BOOK YOUR STAY
                          
                          {/* Animated Button Background */}
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                          />
                        </Link>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ 
                        scale: 1.05, 
                        y: -5,
                        rotateX: 5,
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="group text-lg px-10 py-6 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:shadow-2xl transition-all duration-500 rounded-2xl font-bold relative overflow-hidden"
                      >
                        <Link href={`/properties/${slide.slug}`} className="flex items-center gap-3 relative z-10">
                          <Play className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                          VIRTUAL TOUR
                          
                          {/* Animated Button Background */}
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                          />
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Quick Info with Enhanced Design */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      delay: 1.1, 
                      duration: 0.6, 
                      ease: "easeOut" 
                    }}
                    className="flex items-center justify-center gap-8 text-sm text-slate-300"
                  >
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/20"
                    >
                      <Users className="h-5 w-5 text-amber-400" />
                      <span className="font-medium">Premium Service</span>
                    </motion.div>
                    
                    <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-400 to-transparent"></div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/20"
                    >
                      <Zap className="h-5 w-5 text-amber-400" />
                      <span className="font-medium">5-Star Luxury</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Navigation Controls */}
      {featuredProperties.length > 1 && (
        <>
          {/* Slide Indicators with Modern Design */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-30">
            {featuredProperties.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.3, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goToSlide(index)}
                className={`relative transition-all duration-500 rounded-full backdrop-blur-md ${
                  index === currentSlide
                    ? "w-16 h-4 bg-gradient-to-r from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/30"
                    : "w-4 h-4 bg-white/40 hover:bg-white/60 border border-white/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentSlide && (
                  <>
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full blur-sm"
                    />
                  </>
                )}
              </motion.button>
            ))}
          </div>

          {/* Auto-play Control with Modern Design */}
          <motion.button
            whileHover={{ 
              scale: 1.15, 
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              borderColor: "rgba(245, 158, 11, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute bottom-12 right-12 w-14 h-14 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl flex items-center justify-center text-white transition-all duration-300 z-30 shadow-2xl"
          >
            {isAutoPlaying ? (
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg" 
              />
            ) : (
              <Play className="h-5 w-5 ml-0.5 text-amber-400" />
            )}
          </motion.button>
        </>
      )}

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 1.0 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/70 z-20"
      >
        <motion.div className="text-xs font-medium tracking-wider uppercase">
          Scroll to Explore
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 8, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-white/60 via-amber-400/80 to-transparent rounded-full"
        />
      </motion.div>

      {/* Floating Action Indicators */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.0, duration: 0.8 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20"
      >
        {['Luxury', 'Comfort', 'Experience'].map((label, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.2 + (index * 0.2), duration: 0.6 }}
            whileHover={{ scale: 1.1, x: 10 }}
            className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-sm font-medium cursor-pointer"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ 
                duration: 2 + (index * 0.5), 
                repeat: Infinity, 
                delay: index * 0.7 
              }}
              className="w-2 h-2 bg-amber-400 rounded-full"
            />
            {label}
          </motion.div>
        ))}
      </motion.div>

      {/* Right Side Social Proof */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.0, duration: 0.8 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 3 }}
          className="px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white text-center"
        >
          <motion.div
            animate={{ textShadow: ['0 0 0px rgba(245,158,11,0)', '0 0 20px rgba(245,158,11,0.5)', '0 0 0px rgba(245,158,11,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-3xl font-black text-amber-400 mb-1"
          >
            50K+
          </motion.div>
          <div className="text-xs text-white/70 font-medium">Happy Guests</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05, rotate: -3 }}
          className="px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white text-center"
        >
          <motion.div
            animate={{ textShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 20px rgba(34,197,94,0.5)', '0 0 0px rgba(34,197,94,0)'] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            className="text-3xl font-black text-emerald-400 mb-1"
          >
            98%
          </motion.div>
          <div className="text-xs text-white/70 font-medium">Satisfaction</div>
        </motion.div>
      </motion.div>
    </section>
  )
}
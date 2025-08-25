"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowRight, Building, Star, Wifi, Car, Utensils, Waves, Users, Calendar, Phone } from "lucide-react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { BusinessUnit, BusinessUnitImage, Image as PrismaImage } from "@prisma/client"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { useRef, useState, useEffect } from "react"

// Define a more specific type for the properties
type BusinessUnitWithImages = BusinessUnit & {
  images: (BusinessUnitImage & {
    image: PrismaImage;
  })[];
};

interface BusinessUnitsSectionProps {
  businessUnits: BusinessUnitWithImages[];
}

export function BusinessUnitsSection({ businessUnits = [] }: BusinessUnitsSectionProps) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.3, 1, 1, 0.3]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (businessUnits.length === 0) return null;

  type PropertyTypeInfo = {
    label: string;
    gradientClass: string;
    icon: LucideIcon;
  };

  const getPropertyTypeInfo = (type: string): PropertyTypeInfo => {
    const typeMap: Record<string, PropertyTypeInfo> = {
      'HOTEL': { label: 'Urban Hotel', gradientClass: 'from-blue-400 via-indigo-400 to-purple-400', icon: Building },
      'RESORT': { label: 'Beach Resort', gradientClass: 'from-emerald-400 via-teal-400 to-cyan-400', icon: Waves },
      'VILLA_COMPLEX': { label: 'Villa Complex', gradientClass: 'from-purple-400 via-violet-400 to-indigo-400', icon: Building },
      'APARTMENT_HOTEL': { label: 'Apartment Hotel', gradientClass: 'from-amber-400 via-orange-400 to-red-400', icon: Building },
      'BOUTIQUE_HOTEL': { label: 'Boutique Hotel', gradientClass: 'from-pink-400 via-rose-400 to-red-400', icon: Building },
    };
    return typeMap[type] || { label: type, gradientClass: 'from-slate-400 via-gray-400 to-zinc-400', icon: Building };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  return (
    <section ref={containerRef} id="properties" className="relative min-h-screen overflow-hidden bg-white">
      {/* Dynamic Particle Background */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{ y: backgroundY }}
      >
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gray-800 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            transition={{
              duration: Math.random() * 25 + 15,
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
          background: `radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: hoveredProperty ? 1.5 : 1,
          opacity: hoveredProperty ? 0.8 : 0.4,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Gradient Meshes */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>
      
      <div className="container mx-auto px-6 py-32 relative z-20">
        {/* Enhanced Header - Fixed Animation */}
        <motion.div 
          style={{ y: titleY, opacity }}
          className="text-center mb-24"
        >
            <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
            viewport={{ once: true }}
            className="relative inline-block"
          >
                        <motion.h2 
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 mb-8 leading-none tracking-tight"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            >
             OUR PROPERTIES
            </motion.h2>
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
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
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light mt-12"
          >
            Immersive experiences that transcend ordinary hospitality. Where every moment becomes extraordinary.
          </motion.p>
        </motion.div>

        {/* Properties Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-32"
        >
          {businessUnits.map((property, index) => {
            const typeInfo = getPropertyTypeInfo(property.propertyType);
            const IconComponent = typeInfo.icon;
            const isEven = index % 2 === 0;

            const primaryImage = 
              property.images?.[0]?.image?.largeUrl ||
              property.images?.[0]?.image?.originalUrl;
            
            const fallbackImageUrl = `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
            
            return (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                typeInfo={typeInfo}
                IconComponent={IconComponent}
                isEven={isEven}
                primaryImage={primaryImage}
                fallbackImageUrl={fallbackImageUrl}
                onHover={setHoveredProperty}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  )
}

// Separate Property Card Component - Removed Shadow Effects
interface PropertyCardProps {
  property: BusinessUnitWithImages;
  index: number;
  typeInfo: {
    label: string;
    gradientClass: string;
    icon: LucideIcon;
  };
  IconComponent: LucideIcon;
  isEven: boolean;
  primaryImage: string | undefined;
  fallbackImageUrl: string;
  onHover: (id: string | null) => void;
}

function PropertyCard({ 
  property, 
  index, 
  typeInfo, 
  IconComponent, 
  isEven, 
  primaryImage, 
  fallbackImageUrl,
  onHover 
}: PropertyCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 100, scale: 0.9 }}
      transition={{ 
        duration: 1.0, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3, type: "spring", stiffness: 400 }
      }}
      onHoverStart={() => {
        setIsHovered(true);
        onHover(property.id);
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        onHover(null);
      }}
      className="group relative"
    >
      {/* Floating Layout without Card Container */}
      <div className={`grid lg:grid-cols-2 gap-16 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
        
        {/* Image Section - Removed Shadow Effects */}
        <motion.div 
          className={`relative ${!isEven ? 'lg:col-start-2' : ''}`}
          animate={isHovered ? { scale: 1.02, rotateY: 2 } : { scale: 1, rotateY: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Image Container - Removed glowing border */}
          <div className="relative h-96 lg:h-[500px] font-ser overflow-hidden rounded-3xl bg-gray-100 border border-gray-200">
            <motion.img
              src={primaryImage || fallbackImageUrl}
              alt={property.displayName}
              className="w-full h-full object-cover"
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            
            {/* Simplified Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"
              animate={isHovered ? {
                background: [
                  "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 100%)",
                  "linear-gradient(225deg, rgba(0,0,0,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 100%)"
                ]
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Floating Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
                transition={{ delay: index * 0.2 + 0.5 }}
              >
                <Badge className={`bg-gradient-to-r ${typeInfo.gradientClass} text-white font-bold border-0 backdrop-blur-sm px-4 py-2`}>
                  <IconComponent className="h-4 w-4 mr-2" />
                  {typeInfo.label}
                </Badge>
              </motion.div>
            </div>

            {/* Enhanced Rating Badge - Removed shadow */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
              transition={{ delay: index * 0.2 + 0.6 }}
              className="absolute top-6 right-6"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-3 flex items-center gap-2 border border-gray-200/50">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-black text-slate-900">5.0</span>
              </div>
            </motion.div>

            {/* Enhanced Location Badge */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{ delay: index * 0.2 + 0.7 }}
              className="absolute bottom-6 left-6"
            >
              <div className="bg-black/70 backdrop-blur-xl rounded-2xl px-6 py-3 flex items-center gap-3 border border-white/20">
                <MapPin className="h-5 w-5 text-white" />
                <span className="text-white font-bold">{property.city}, {property.country}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          className={`space-y-8 ${!isEven ? 'lg:col-start-1' : ''}`}
          animate={isHovered ? { x: isEven ? 10 : -10 } : { x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title - Removed text shadow */}
          <motion.div className="space-y-6">
            <motion.h3 
              className="text-4xl lg:text-5xl font-black font-serif text-gray-900 leading-tight"
              animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {property.displayName}
            </motion.h3>
            
            <p className="text-gray-600 text-xl leading-relaxed">
              {property.shortDescription}
            </p>
          </motion.div>

          {/* Enhanced Feature Grid - Removed shadows */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Wifi, label: 'Free WiFi', desc: 'High-speed internet', color: 'from-blue-400 to-cyan-400' },
              { icon: Car, label: 'Parking', desc: 'Complimentary valet', color: 'from-emerald-400 to-teal-400' },
              { icon: Utensils, label: 'Fine Dining', desc: 'Award-winning cuisine', color: 'from-purple-400 to-pink-400' },
              { icon: Users, label: 'Concierge', desc: '24/7 service', color: 'from-amber-400 to-orange-400' },
            ].map((feature) => (
              <motion.div
                key={feature.label}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 p-4 bg-gray-50/50 backdrop-blur-sm rounded-2xl group-hover:bg-white/80 transition-all duration-500 border border-gray-200/50"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{feature.label}</div>
                  <div className="text-xs text-gray-500">{feature.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Contact Info */}
          <div className="flex items-center gap-8 pt-6 border-t border-gray-200">
            {property.phone && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl"
              >
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{property.phone}</span>
              </motion.div>
            )}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl"
            >
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Available year-round</span>
            </motion.div>
          </div>

          {/* Enhanced Action Buttons - Removed heavy shadows */}
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button 
                asChild
                size="lg"
                className={`w-full bg-gradient-to-r ${typeInfo.gradientClass} hover:brightness-110 text-white font-black py-6 rounded-2xl transition-all duration-500 relative overflow-hidden border-2 border-gray-200/50`}
              >
                <Link href={`/properties/${property.slug}`} className="flex items-center justify-center gap-4 relative z-10">
                  <Calendar className="h-6 w-6" />
                  <span className="text-lg">BOOK NOW</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
                  
                  {/* Animated Button Background */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-black py-6 rounded-2xl transition-all duration-500 relative overflow-hidden"
              >
                <Link href={`/properties/${property.slug}`} className="flex items-center justify-center gap-4 relative z-10">
                  <Building className="h-6 w-6" />
                  <span className="text-lg">EXPLORE</span>
                  
                  {/* Animated Button Background */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-blue-100/50"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
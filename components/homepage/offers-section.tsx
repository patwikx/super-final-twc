"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  ArrowRight, 
  Percent, 
  Clock, 
  Gift,
  Sparkles,
  Star,
  Zap
} from "lucide-react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { SpecialOffer, SpecialOfferImage, Image as PrismaImage } from "@prisma/client"

// Define a more specific type for the offers that includes the nested image data
type SpecialOfferWithImages = SpecialOffer & {
  images: (SpecialOfferImage & {
    image: PrismaImage;
  })[];
};

interface SpecialOffersSectionProps {
  specialOffers: SpecialOfferWithImages[]
}

interface OfferCardProps {
  offer: SpecialOfferWithImages;
  index: number;
  savings: number | null;
  featuredImage: string | undefined;
  fallbackImageUrl: string;
  onHover: (id: string | null) => void;
}

export function SpecialOffersSection({ specialOffers = [] }: SpecialOffersSectionProps) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredOffer, setHoveredOffer] = useState<string | null>(null)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.3, 1, 1, 0.3])

  if (specialOffers.length === 0) return null;

  const calculateSavings = (original?: number | null, offer?: number) => {
    if (!original || !offer || original === 0) return null
    const savings = ((original - offer) / original) * 100
    return Math.round(savings)
  }

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden bg-white">
      {/* Dynamic Particle Background */}
      <motion.div 
        className="absolute inset-0 opacity-15"
        style={{ y: backgroundY }}
      >
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
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
          background: `radial-gradient(circle, rgba(251, 146, 60, 0.12) 0%, transparent 70%)`,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: hoveredOffer ? 1.8 : 1,
          opacity: hoveredOffer ? 0.9 : 0.5,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Dynamic Gradient Meshes */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full"
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 30%, rgba(251, 146, 60, 0.08) 0%, transparent 60%)",
              "radial-gradient(circle at 80% 70%, rgba(245, 101, 101, 0.08) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 20%, rgba(249, 115, 22, 0.08) 0%, transparent 60%)",
              "radial-gradient(circle at 20% 30%, rgba(251, 146, 60, 0.08) 0%, transparent 60%)"
            ]
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0], 
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full backdrop-blur-sm border border-amber-200/30"
        />
        <motion.div
          animate={{ 
            y: [0, 40, 0], 
            rotate: [0, -8, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut", 
            delay: 4 
          }}
          className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full backdrop-blur-sm border border-orange-200/30"
        />
        <motion.div
          animate={{ 
            x: [0, 20, 0], 
            rotate: [0, 15, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut", 
            delay: 2 
          }}
          className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-tr from-yellow-200/25 to-amber-200/25 rounded-lg backdrop-blur-sm border border-yellow-200/40 transform rotate-45"
        />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-20">
        {/* Hero Header with Advanced Animations */}
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
             SPECIAL OFFERS
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
            transition={{ delay: 0.8, duration: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light mt-12"
          >
            Curated collection of premium offers and exclusive packages designed to create unforgettable moments at exceptional value.
          </motion.p>
        </motion.div>

        {/* Enhanced Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {specialOffers.map((offer, index) => {
            const savings = calculateSavings(Number(offer.originalPrice), Number(offer.offerPrice))
            
            const featuredImage = 
              offer.images?.find(img => img.context === 'featured')?.image?.mediumUrl ||
              offer.images?.find(img => img.isPrimary)?.image?.mediumUrl ||
              offer.images?.[0]?.image?.mediumUrl ||
              offer.images?.[0]?.image?.originalUrl;
              
            const fallbackImageUrl = `https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;

            return (
              <OfferCard
                key={offer.id}
                offer={offer}
                index={index}
                savings={savings}
                featuredImage={featuredImage}
                fallbackImageUrl={fallbackImageUrl}
                onHover={setHoveredOffer}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Enhanced Offer Card Component - NO CARD STYLING
function OfferCard({ 
  offer, 
  index, 
  savings, 
  featuredImage, 
  fallbackImageUrl, 
  onHover 
}: OfferCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 120, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 120, scale: 0.8 }}
      transition={{ 
        duration: 0.9, 
        delay: index * 0.25,
        type: "spring",
        stiffness: 100,
        damping: 25
      }}
      whileHover={{ 
        y: -25,
        transition: { duration: 0.4, type: "spring", stiffness: 400 }
      }}
      onHoverStart={() => {
        setIsHovered(true)
        onHover(offer.id)
      }}
      onHoverEnd={() => {
        setIsHovered(false)
        onHover(null)
      }}
      className="group relative cursor-pointer h-full"
    >


      {/* Main Content Container - NO CARD WRAPPER */}
      <div className="relative overflow-hidden h-full flex flex-col">
        
        {/* Enhanced Image Container */}
        <motion.div 
          className="relative h-80 overflow-hidden rounded-2xl"
          animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.img
            animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            src={featuredImage || fallbackImageUrl}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
          
          {/* Dynamic Overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            animate={isHovered ? {
              background: [
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                "linear-gradient(to top, rgba(251,146,60,0.4) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)"
              ]
            } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Floating Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-3">
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
              transition={{ delay: index * 0.25 + 0.5 }}
            >
              <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 font-bold border-0 shadow-xl px-4 py-2 capitalize rounded-full">
                <Gift className="h-4 w-4 mr-2" />
                {offer.type.replace('_', ' ').toLowerCase()}
              </Badge>
            </motion.div>

            {savings && (
              <motion.div
                initial={{ x: -60, opacity: 0 }}
                animate={isInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
                transition={{ delay: index * 0.25 + 0.7 }}
              >
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black border-0 shadow-xl px-4 py-2 rounded-full">
                  <Percent className="h-4 w-4 mr-2" />
                  Save {savings}%
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Enhanced Price Display */}
          <motion.div 
            initial={{ x: 60, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: 60, opacity: 0 }}
            transition={{ delay: index * 0.25 + 0.6 }}
            className="absolute bottom-6 left-6 text-white"
          >
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-white">₱{Number(offer.offerPrice).toLocaleString()}</span>
                {offer.originalPrice && (
                  <span className="text-sm line-through text-white/70 font-medium">₱{Number(offer.originalPrice).toLocaleString()}</span>
                )}
              </div>
              <span className="text-xs text-white/80 font-medium">per package</span>
            </div>
          </motion.div>

          {/* Sparkle Effects */}
          <motion.div
            className="absolute top-4 right-4"
            animate={isHovered ? { 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
          </motion.div>
        </motion.div>

        {/* Enhanced Content - NO CARD CONTENT WRAPPER */}
        <div className="pt-8 flex-1 flex flex-col relative">
          {/* Floating Content Animation */}
          <motion.div
            animate={isHovered ? { y: -8 } : { y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <motion.h3 
              className="text-2xl font-black text-gray-900 mb-4 leading-tight"
              animate={isHovered ? { 
                textShadow: "0 0 20px rgba(251, 146, 60, 0.3)",
                scale: 1.02 
              } : { 
                textShadow: "0 0 0px rgba(0,0,0,0)",
                scale: 1 
              }}
              transition={{ duration: 0.3 }}
            >
              {offer.title}
            </motion.h3>

            <p className="text-gray-600 text-lg mb-6 flex-1 leading-relaxed line-clamp-3">
              {offer.shortDesc}
            </p>

            {/* Enhanced Details */}
            <div className="space-y-4 mb-8">
              <motion.div 
                className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">Valid until {new Date(offer.validTo).toLocaleDateString()}</span>
                </div>
                {offer.minNights > 1 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{offer.minNights} nights min</span>
                  </div>
                )}
              </motion.div>
              
              {offer.promoCode && (
                <motion.div 
                  className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200/50"
                  whileHover={{ scale: 1.02, borderColor: "rgb(251 146 60 / 0.8)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-bold text-gray-700">Promo Code:</span>
                    </div>
                    <Badge className="font-mono text-amber-800 border-amber-400 bg-amber-100/80 px-3 py-1 font-black">
                      {offer.promoCode}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Enhanced CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                asChild 
                className="group/btn w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:shadow-2xl text-white font-black py-6 rounded-2xl transition-all duration-500 relative overflow-hidden border-2 border-amber-200/30 mt-auto"
              >
                <Link href={`/offers/${offer.slug}`} className="flex items-center justify-center gap-4">
                  <Zap className="h-5 w-5 group-hover/btn:rotate-12 transition-all duration-300 relative z-10" />
                  <span className="relative z-10 text-lg">CLAIM OFFER</span>
                  <ArrowRight className="h-6 w-6 group-hover/btn:translate-x-2 group-hover/btn:scale-110 transition-all duration-300 relative z-10" />
                  
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
          </motion.div>

          {/* Animated Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            animate={isHovered ? {
              background: [
                "linear-gradient(to top, rgba(251, 146, 60, 0.05) 0%, transparent 100%)",
                "linear-gradient(to top, rgba(249, 115, 22, 0.05) 0%, transparent 100%)",
                "linear-gradient(to top, rgba(251, 146, 60, 0.05) 0%, transparent 100%)"
              ]
            } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Particle Trail Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={isHovered ? {
          background: [
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)",
            "radial-gradient(circle at 30% 40%, rgba(251,146,60,0.03) 0%, rgba(0,0,0,0) 60%)",
            "radial-gradient(circle at 70% 60%, rgba(249,115,22,0.03) 0%, rgba(0,0,0,0) 60%)",
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)"
          ]
        } : {}}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </motion.div>
  )
}
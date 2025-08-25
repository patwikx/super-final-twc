"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Music,
  PartyPopper,
  Heart,
  Sparkles,
  Zap
} from "lucide-react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { Event, EventImage, Image as PrismaImage, EventType } from "@prisma/client"

// Type definition based on your Prisma schema
type EventWithImages = Event & {
  images: (EventImage & {
    image: PrismaImage;
  })[];
};

interface EventsSectionProps {
  events: EventWithImages[]
}

interface EventCardProps {
  event: EventWithImages;
  index: number;
  EventIcon: React.ComponentType<{ className?: string }>;
  eventColorClass: string;
  featuredImage: string | undefined;
  fallbackImageUrl: string;
  isUpcoming: boolean;
  eventTime: string | null;
  formatEventDate: (start: Date, end: Date, isMulti: boolean) => string;
  onHover: (id: string | null) => void;
}

const eventTypeIcons: Record<EventType, typeof Music> = {
  WEDDING: Heart,
  CONFERENCE: Users,
  MEETING: Users,
  WORKSHOP: Users,
  CELEBRATION: PartyPopper,
  CULTURAL: Star,
  SEASONAL: Calendar,
  ENTERTAINMENT: Music,
  CORPORATE: Users,
  PRIVATE: Users,
}

const eventTypeColors: Record<EventType, string> = {
  WEDDING: "from-pink-400 via-rose-400 to-red-400",
  CONFERENCE: "from-blue-400 via-indigo-400 to-purple-400", 
  MEETING: "from-slate-400 via-gray-400 to-zinc-400",
  WORKSHOP: "from-purple-400 via-violet-400 to-indigo-400",
  CELEBRATION: "from-yellow-400 via-orange-400 to-red-400",
  CULTURAL: "from-emerald-400 via-teal-400 to-cyan-400",
  SEASONAL: "from-amber-400 via-orange-400 to-yellow-400",
  ENTERTAINMENT: "from-fuchsia-400 via-pink-400 to-rose-400",
  CORPORATE: "from-cyan-400 via-blue-400 to-indigo-400",
  PRIVATE: "from-indigo-400 via-purple-400 to-pink-400",
}

export function EventsSection({ events = [] }: EventsSectionProps) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  
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

  if (events.length === 0) return null;

  const formatEventDate = (startDate: Date, endDate: Date, isMultiDay: boolean) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isMultiDay) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    
    return start.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatEventTime = (startTime?: string | null, endTime?: string | null) => {
    if (!startTime) return null
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }
    
    if (endTime) {
      return `${formatTime(startTime)} - ${formatTime(endTime)}`
    }
    
    return formatTime(startTime)
  }

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden bg-white">
      {/* Dynamic Particle Background */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{ y: backgroundY }}
      >
        {[...Array(50)].map((_, i) => (
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
          background: `radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: hoveredEvent ? 1.5 : 1,
          opacity: hoveredEvent ? 0.8 : 0.4,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Gradient Meshes */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-100/30 via-transparent to-blue-100/30"
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-20">
        {/* Hero Header with Advanced Animations */}
        <motion.div 
          style={{ y: titleY, opacity }}
          className="text-center mb-12"
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
                       <motion.h3 
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 leading-none tracking-tight"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            >
               EVENTS
            </motion.h3>
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-yellow-600/20 to-red-600/20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
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
            Immersive experiences that transcend the ordinary. Where every moment becomes a masterpiece.
          </motion.p>
        </motion.div>

        {/* Borderless Event Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-16">
          {events.map((event, index) => {
            const EventIcon = eventTypeIcons[event.type]
            const eventColorClass = eventTypeColors[event.type]
            
            const featuredImage = 
              event.images?.find(img => img.context === 'featured')?.image?.largeUrl ||
              event.images?.find(img => img.isPrimary)?.image?.largeUrl ||
              event.images?.[0]?.image?.largeUrl ||
              event.images?.[0]?.image?.originalUrl;
              
            const fallbackImageUrl = `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`;

            const isUpcoming = new Date(event.startDate) > new Date()
            const eventTime = formatEventTime(event.startTime, event.endTime)

            return (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                EventIcon={EventIcon}
                eventColorClass={eventColorClass}
                featuredImage={featuredImage}
                fallbackImageUrl={fallbackImageUrl}
                isUpcoming={isUpcoming}
                eventTime={eventTime}
                formatEventDate={formatEventDate}
                onHover={setHoveredEvent}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Separate Event Card Component for better performance
function EventCard({ 
  event, 
  index, 
  EventIcon, 
  eventColorClass, 
  featuredImage, 
  fallbackImageUrl, 
  isUpcoming, 
  eventTime, 
  formatEventDate,
  onHover 
}: EventCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 100, scale: 0.8 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      whileHover={{ 
        y: -20,
        transition: { duration: 0.3, type: "spring", stiffness: 400 }
      }}
      onHoverStart={() => {
        setIsHovered(true)
        onHover(event.id)
      }}
      onHoverEnd={() => {
        setIsHovered(false)
        onHover(null)
      }}
      className="group relative cursor-pointer"
    >
      {/* Floating Image */}
      <motion.div
        className="relative h-80 mb-8 overflow-hidden"
        animate={isHovered ? { scale: 1.05, rotateX: 5 } : { scale: 1, rotateX: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Glowing Border Effect */}
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${eventColorClass} blur-lg opacity-0 group-hover:opacity-60`}
          animate={isHovered ? { 
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Image Container */}
        <div className="relative h-full rounded-3xl overflow-hidden bg-gray-100 border border-gray-200">
          <motion.img
            src={featuredImage || fallbackImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Holographic Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 via-purple-500/10 to-blue-500/20"
            animate={isHovered ? {
              background: [
                "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(168,85,247,0.1) 50%, rgba(59,130,246,0.2) 100%)",
                "linear-gradient(225deg, rgba(59,130,246,0.2) 0%, rgba(236,72,153,0.1) 50%, rgba(255,255,255,0.2) 100%)",
                "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(168,85,247,0.1) 50%, rgba(59,130,246,0.2) 100%)"
              ]
            } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Floating Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-3">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
              transition={{ delay: index * 0.2 + 0.5 }}
            >
              <Badge className={`bg-gradient-to-r ${eventColorClass} text-white font-bold border-0 shadow-2xl backdrop-blur-sm px-4 py-2`}>
                <EventIcon className="h-4 w-4 mr-2" />
                {event.type.replace('_', ' ')}
              </Badge>
            </motion.div>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
              transition={{ delay: index * 0.2 + 0.7 }}
            >
              <Badge className={`${isUpcoming ? 'bg-emerald-500/90' : 'bg-red-500/90'} text-white font-medium border-0 backdrop-blur-sm shadow-xl px-3 py-1`}>
                <Sparkles className="h-3 w-3 mr-1" />
                {isUpcoming ? 'Upcoming' : 'Past'}
              </Badge>
            </motion.div>
          </div>

          {/* Price Display */}
          {!event.isFree && event.ticketPrice && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
              transition={{ delay: index * 0.2 + 0.6 }}
              className="absolute bottom-6 right-6"
            >
              <div className="bg-black/70 backdrop-blur-xl rounded-2xl px-6 py-3 border border-gray-200/30">
                <div className="text-right">
                  <span className="text-3xl font-black text-white">₱{Number(event.ticketPrice).toLocaleString()}</span>
                  <div className="text-xs text-white/80 font-medium">per ticket</div>
                </div>
              </div>
            </motion.div>
          )}

          {event.isFree && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
              transition={{ delay: index * 0.2 + 0.6 }}
              className="absolute bottom-6 right-6"
            >
              <Badge className="bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-lg px-6 py-3 backdrop-blur-sm shadow-2xl">
                <Zap className="h-5 w-5 mr-2" />
                FREE EVENT
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Floating Content */}
      <motion.div 
        className="relative z-10"
        animate={isHovered ? { y: -10 } : { y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Title */}
        <motion.h3 
          className="text-3xl font-black text-gray-900 mb-6 leading-tight"
          animate={isHovered ? { 
            textShadow: "0 0 20px rgba(0,0,0,0.3)",
            scale: 1.02 
          } : { 
            textShadow: "0 0 0px rgba(0,0,0,0)",
            scale: 1 
          }}
          transition={{ duration: 0.3 }}
        >
          {event.title}
        </motion.h3>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-8 leading-relaxed line-clamp-3">
          {event.shortDesc || event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-4 mb-10">
          {/* Date and Time */}
          <motion.div 
            className="flex items-center gap-4 text-gray-600 group-hover:text-gray-900 transition-colors duration-300"
            whileHover={{ x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${eventColorClass} shadow-lg`}>
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">
                {formatEventDate(new Date(event.startDate), new Date(event.endDate), event.isMultiDay)}
              </div>
              {eventTime && (
                <div className="text-sm opacity-70 flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  {eventTime}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Venue */}
          <motion.div 
            className="flex items-center gap-4 text-gray-600 group-hover:text-gray-900 transition-colors duration-300"
            whileHover={{ x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg line-clamp-1 text-gray-900">{event.venue}</div>
              {event.venueCapacity && (
                <div className="text-sm opacity-70 flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4" />
                  Up to {event.venueCapacity} guests
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            asChild 
            className={`w-full bg-gradient-to-r ${eventColorClass} hover:shadow-2xl text-white font-black py-6 rounded-2xl transition-all duration-500 relative overflow-hidden group/btn border-2 border-gray-200/50`}
          >
            <Link href={`/events/${event.slug}`} className="flex items-center justify-center gap-4">
              <span className="relative z-10 text-lg">DISCOVER EVENT</span>
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

      {/* Particle Trail Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={isHovered ? {
          background: [
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)",
            "radial-gradient(circle at 20% 30%, rgba(168,85,247,0.05) 0%, rgba(0,0,0,0) 50%)",
            "radial-gradient(circle at 80% 70%, rgba(59,130,246,0.05) 0%, rgba(0,0,0,0) 50%)",
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)"
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}
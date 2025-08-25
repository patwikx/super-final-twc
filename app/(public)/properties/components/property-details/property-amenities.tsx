"use client"

import { Wifi, Car, Utensils, Dumbbell, Waves, Users, Coffee, Bath, Tv, Shield, Music, Gamepad2 } from "lucide-react"
import { motion } from "framer-motion"
import { Amenity } from "@prisma/client"

interface PropertyAmenitiesProps {
  amenities: Amenity[];
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  // Default amenities if none provided
  const defaultAmenities: Array<{
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
  }> = [
    { name: "High-Speed WiFi", icon: Wifi, category: "Technology" },
    { name: "Valet Parking", icon: Car, category: "Services" },
    { name: "Fine Dining", icon: Utensils, category: "Dining" },
    { name: "Fitness Center", icon: Dumbbell, category: "Wellness" },
    { name: "Spa & Wellness", icon: Waves, category: "Wellness" },
    { name: "24/7 Concierge", icon: Users, category: "Services" },
    { name: "In-Room Coffee", icon: Coffee, category: "In-Room" },
    { name: "Luxury Bathrooms", icon: Bath, category: "In-Room" },
    { name: "Smart TV", icon: Tv, category: "Technology" },
    { name: "Security", icon: Shield, category: "Services" },
    { name: "Live Entertainment", icon: Music, category: "Entertainment" },
    { name: "Game Room", icon: Gamepad2, category: "Entertainment" },
  ];

  const getIconComponent = (iconName?: string | null) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'wifi': Wifi, 'car': Car, 'utensils': Utensils, 'dumbbell': Dumbbell,
      'waves': Waves, 'users': Users, 'coffee': Coffee, 'bath': Bath,
      'tv': Tv, 'shield': Shield, 'music': Music, 'gamepad2': Gamepad2
    };
    return iconMap[iconName?.toLowerCase() || ''] || Wifi;
  };

  const displayAmenities = amenities.length > 0 
    ? amenities.map(amenity => ({
        name: amenity.name,
        icon: getIconComponent(amenity.icon),
        category: amenity.category || 'General'
      }))
    : defaultAmenities;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent)] "></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,0,0.08),transparent)]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            Premium Amenities
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-3 leading-tight font-serif">
            World-Class Facilities
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every detail carefully considered for your comfort and convenience.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto"
        >
          {displayAmenities.map((amenity) => (
            <motion.div
              key={amenity.name}
              whileHover={{ 
                scale: 1.1, 
                y: -8,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-orange-500/0 to-amber-500/0 group-hover:from-amber-500/20 group-hover:via-orange-500/30 group-hover:to-amber-500/20 rounded-xl blur-xl transition-all duration-500"></div>
              
              {/* Main Content */}
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center group-hover:border-amber-500/40 group-hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                  <amenity.icon className="h-6 w-6 text-amber-400 group-hover:text-amber-300" />
                </div>
                <h4 className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors duration-300 leading-tight">
                  {amenity.name}
                </h4>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-amber-500/30 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute top-3/4 right-16 w-1 h-1 bg-orange-500/40 rounded-full blur-sm animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-10 w-3 h-3 bg-amber-400/20 rounded-full blur-sm animate-pulse delay-500"></div>
      </div>
    </section>
  )
}
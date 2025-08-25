"use client"


import { Users, CheckCircle, Wifi, Coffee, Bath, Tv, Car, Utensils, Dumbbell, Waves, Shield, Music, Gamepad2, Wind, Clock, CreditCard, AlertCircle, LucideIcon, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react"
import { motion } from "framer-motion"
import { RoomType_Model, RoomTypeAmenity, Amenity, BusinessUnit, RoomTypeImage, Image as PrismaImage } from "@prisma/client"
import { RoomGallery } from "./room-gallery"

interface RoomDetailsContentProps {
  roomType: RoomType_Model & {
    _count: { rooms: number };
    amenities: (RoomTypeAmenity & { amenity: Amenity })[];
    images: (RoomTypeImage & {
      image: PrismaImage;
    })[];
  };
  property: BusinessUnit;
}

interface AmenityDisplay {
  name: string;
  icon: LucideIcon;
  category: string;
  description?: string | null;
}

export function RoomDetailsContent({ roomType, property }: RoomDetailsContentProps) {
  // Default amenities if none provided
  const defaultAmenities: AmenityDisplay[] = [
    { name: "High-Speed WiFi", icon: Wifi, category: "Technology" },
    { name: "Premium Coffee", icon: Coffee, category: "In-Room" },
    { name: "Luxury Bathroom", icon: Bath, category: "In-Room" },
    { name: "Smart TV", icon: Tv, category: "Technology" },
    { name: "Air Conditioning", icon: Wind, category: "Comfort" },
    { name: "Mini Bar", icon: Utensils, category: "In-Room" },
  ];

  const getIconComponent = (iconName?: string | null): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      'wifi': Wifi, 
      'coffee': Coffee, 
      'bath': Bath, 
      'tv': Tv,
      'car': Car, 
      'utensils': Utensils, 
      'dumbbell': Dumbbell,
      'waves': Waves, 
      'shield': Shield, 
      'music': Music, 
      'gamepad2': Gamepad2, 
      'wind': Wind
    };
    return iconMap[iconName?.toLowerCase() || ''] || Wifi;
  };

  const displayAmenities: AmenityDisplay[] = roomType.amenities?.length > 0 
    ? roomType.amenities.map(({ amenity }: { amenity: Amenity }) => ({
        name: amenity.name,
        icon: getIconComponent(amenity.icon),
        category: amenity.category || 'General',
        description: amenity.description
      }))
    : defaultAmenities;

  const features = [
    { 
      title: "Spacious Layout", 
      description: "Thoughtfully designed for comfort",
      available: true 
    },
    { 
      title: "Premium Bedding", 
      description: "Egyptian cotton linens and luxury pillows",
      available: true 
    },
    { 
      title: "City/Ocean Views", 
      description: "Panoramic views from windows",
      available: roomType.hasOceanView || roomType.hasBalcony 
    },
    { 
      title: "Private Balcony", 
      description: "Outdoor space with seating",
      available: roomType.hasBalcony 
    },
    { 
      title: "Kitchenette", 
      description: "Mini-fridge and coffee station",
      available: roomType.hasKitchenette 
    },
    { 
      title: "Living Area", 
      description: "Separate seating and work area",
      available: roomType.hasLivingArea 
    },
  ];

  const policies = [
    {
      icon: Clock,
      title: "Check-in & Check-out",
      items: [
        `Check-in: ${property.checkInTime || '3:00 PM'}`,
        `Check-out: ${property.checkOutTime || '12:00 PM'}`,
        "Early check-in subject to availability"
      ]
    },
    {
      icon: CreditCard,
      title: "Payment & Cancellation",
      items: [
        `Free cancellation up to ${property.cancellationHours || 24} hours before arrival`,
        "Credit card required for booking",
        "Payment due at check-in"
      ]
    },
    {
      icon: Users,
      title: "Guest Policies",
      items: [
        "Valid ID required at check-in",
        "Maximum occupancy strictly enforced",
        "Children under 12 stay free"
      ]
    },
    {
      icon: AlertCircle,
      title: "House Rules",
      items: [
        "No smoking in rooms",
        "Quiet hours: 10:00 PM - 7:00 AM",
        "Pool hours: 6:00 AM - 10:00 PM"
      ]
    }
  ];

  return (
    <div className="container mx-auto space-y-16">
      {/* Custom Layout - Room Features | Amenities | Policies */}
      <div className="flex flex-col lg:flex-row gap-8 mt-[-30px]">
        
        {/* Room Features - Fixed Width */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="w-80 flex-shrink-0 space-y-6"
        >
          <h2 className="text-2xl font-bold text-slate-900 border-b font-serif border-slate-200 pb-3">Room Features</h2>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className={`flex items-start gap-3 ${
                  feature.available ? "opacity-100" : "opacity-50"
                }`}
              >
                <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  feature.available ? "text-emerald-500" : "text-slate-400"
                }`} />
                <div>
                  <div className="font-medium text-slate-900 text-sm">
                    {feature.title}
                  </div>
                  <div className="text-xs text-slate-600">
                    {feature.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Amenities - With Left Margin */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-64 flex-shrink-0 ml-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-slate-900 border-b font-serif border-slate-200 pb-3">Amenities</h2>

          <div className="grid grid-cols-1 gap-3">
            {displayAmenities.map((amenity, index) => (
              <motion.div
                key={amenity.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 py-1"
              >
                <amenity.icon className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-700">
                  {amenity.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Policies Section - Column 3 */}
        <motion.section
  
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-slate-900 border-b font-serif border-slate-200 pb-3">Policies & Information</h2>

          <div className="flex flex-cols-1 gap-4">
            {policies.map((policy, index) => (
              <motion.div
                key={policy.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <policy.icon className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">{policy.title}</h3>
                </div>
                
                <ul className="space-y-1.5">
                  {policy.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-xs text-slate-600 leading-relaxed pl-1 whitespace-nowrap">
                      • {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Contact Information - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-slate-50 rounded-lg p-6 mt-8"
          >
 <div className="flex items-start gap-4">
  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
  <div className="flex-1">
    <h4 className="font-semibold text-slate-900 mb-2">Need Assistance?</h4>
    <p className="text-sm text-slate-600 mb-3">
      Our team is available 24/7 for special requests or questions about your stay.
    </p>
    <div className="flex flex-wrap gap-4 text-sm">
      {property.phone && (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-blue-600" />
          <span className="text-slate-700">{property.phone}</span>
        </div>
      )}
      {property.email && (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-blue-600" />
          <span className="text-slate-700">{property.email}</span>
        </div>
      )}
  
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-700 hover:text-blue-600"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          <span>Facebook</span>
        </a>
    
   
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-700 hover:text-pink-500"
        >
          <Instagram className="h-4 w-4 text-pink-500" />
          <span>Instagram</span>
        </a>
     
   
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-700 hover:text-sky-500"
        >
          <Twitter className="h-4 w-4 text-sky-500" />
          <span>Twitter</span>
        </a>
      
    </div>
  </div>
</div>
          </motion.div>
        </motion.section>
      </div>

      {/* Room Gallery - Adjusted for new layout */}
      <div className="lg:flex lg:gap-8 -mt-10">
        <div className="lg:w-[calc(500px+512px+32px)] mt-[-20px]">
          <RoomGallery roomType={roomType} />
        </div>
      </div>

    </div>
  )
}
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight, Percent, Clock, Gift } from "lucide-react"
import { motion } from "framer-motion"
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

export function SpecialOffersSection({ specialOffers = [] }: SpecialOffersSectionProps) {
  if (specialOffers.length === 0) return null;

  const calculateSavings = (original?: number | null, offer?: number) => {
    if (!original || !offer || original === 0) return null
    const savings = ((original - offer) / original) * 100
    return Math.round(savings)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-amber-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background Pattern - FIXED */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmJmNWYwIiBzdG9wLW9wYWNpdHk9Ii4xIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmJmNWYwIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-amber-200/20 rounded-full backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-32 left-16 w-24 h-24 bg-orange-200/20 rounded-full backdrop-blur-sm"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 mb-6 leading-tight">
            Exclusive
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Packages
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover our curated collection of special offers and exclusive packages designed to create unforgettable moments at exceptional value.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {specialOffers.map((offer) => {
            const savings = calculateSavings(Number(offer.originalPrice), Number(offer.offerPrice))
            
            const featuredImage = 
              offer.images?.find(img => img.context === 'featured')?.image?.mediumUrl ||
              offer.images?.find(img => img.isPrimary)?.image?.mediumUrl ||
              offer.images?.[0]?.image?.mediumUrl ||
              offer.images?.[0]?.image?.originalUrl;
              
            const fallbackImageUrl = `https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;

            return (
              <motion.div
                key={offer.id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="group"
              >
                <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 relative h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      src={featuredImage || fallbackImageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {savings && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold border-0 shadow-lg">
                          <Percent className="h-3 w-3 mr-1" />
                          Save {savings}%
                        </Badge>
                      </div>
                    )}

                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 font-medium border-0 capitalize">
                        <Gift className="h-3 w-3 mr-1" />
                        {offer.type.replace('_', ' ').toLowerCase()}
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">₱{Number(offer.offerPrice).toLocaleString()}</span>
                        {offer.originalPrice && (
                          <span className="text-sm line-through text-white/70">₱{Number(offer.originalPrice).toLocaleString()}</span>
                        )}
                      </div>
                      <span className="text-xs text-white/80">per night</span>
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 font-serif mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
                      {offer.title}
                    </h3>

                    <p className="text-slate-600 text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">
                      {offer.shortDesc}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Valid until {new Date(offer.validTo).toLocaleDateString()}</span>
                        </div>
                        {offer.minNights > 1 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{offer.minNights} nights min</span>
                          </div>
                        )}
                      </div>
                      
                      {offer.promoCode && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">Promo Code:</span>
                            <Badge variant="outline" className="font-mono text-amber-700 border-amber-300">
                              {offer.promoCode}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button 
                      asChild 
                      className="group/btn w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 mt-auto"
                    >
                      <Link href={`/offers/${offer.slug}`} className="flex items-center justify-center gap-2">
                        <span>View Offer</span>
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </Button>
                  </CardContent>

                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
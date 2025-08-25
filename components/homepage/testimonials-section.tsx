"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, MapPin, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { Testimonial } from "@prisma/client"

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials = [] }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };


  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjFmNWY5IiBzdG9wLW9wYWNpdHk9Ii4wNSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2YxZjVmOSIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>
      
      {/* Floating Quote Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-32 right-32"
        >
          <Quote className="h-24 w-24 text-amber-200" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-32 left-32"
        >
          <Quote className="h-20 w-20 text-slate-200" />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 mb-6 leading-tight">
            What Our Guests
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Are Saying
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Real stories from our valued guests who have experienced the exceptional hospitality and luxury that defines our properties.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
          
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="group"
            >
              <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                {/* Background Quote */}
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Quote className="h-16 w-16 text-slate-900" />
                </div>

                <CardContent className="p-8 relative z-10 h-full flex flex-col">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            i < (testimonial.rating || 5) 
                              ? "text-amber-400 fill-amber-400" 
                              : "text-slate-300"
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-slate-700 mb-8 leading-relaxed font-serif italic text-lg flex-1 relative">
                    <Quote className="absolute -top-2 -left-2 h-6 w-6 text-amber-400 opacity-50" />
                    <span className="relative z-10">{testimonial.content}</span>
                  </blockquote>

                  {/* Guest Info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {testimonial.guestName.charAt(0)}
                      </span>
                    </div>
                    
                    {/* Guest Details */}
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 font-serif text-lg">
                        {testimonial.guestName}
                      </div>
                      {testimonial.guestTitle && (
                        <div className="text-sm text-slate-600 mb-1">
                          {testimonial.guestTitle}
                        </div>
                      )}
                      {testimonial.guestCountry && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          <span>{testimonial.guestCountry}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Source & Date */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Verified Guest</span>
                    </div>
                    {testimonial.source && (
                      <div className="text-xs text-slate-500">
                        via {testimonial.source}
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Overall Rating Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl shadow-lg px-8 py-6 border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-3xl font-bold text-slate-900">4.9</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-left">
              <div className="text-lg font-semibold text-slate-900">Excellent</div>
              <div className="text-sm text-slate-600">Based on 2,847 reviews</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
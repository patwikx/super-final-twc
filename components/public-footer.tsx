'use client'

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Star, Award, Shield, Clock } from "lucide-react";
import { WebsiteConfiguration, BusinessUnit } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";

interface PublicFooterProps {
  allHotels: BusinessUnit[];
  websiteConfig: WebsiteConfiguration | null;
}

export function PublicFooter({ allHotels = [], websiteConfig }: PublicFooterProps) {
  const siteName = websiteConfig?.siteName || 'Tropicana';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii4wMyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-amber-400/5 rounded-full backdrop-blur-sm"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-32 left-16 w-24 h-24 bg-amber-400/5 rounded-full backdrop-blur-sm"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Trust Indicators */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-12 border-b border-slate-700/50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">5-Star</div>
                <div className="text-sm text-slate-400">Luxury Service</div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-slate-400">Secure Booking</div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-slate-400">Concierge</div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-slate-400">Happy Guests</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <Image src={websiteConfig?.logo || "https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx"} height={40} width={40} alt={`${siteName} Logo`} />
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full blur"></div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">{siteName}</h3>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {websiteConfig?.tagline || 'Experience unparalleled luxury and hospitality at our world-class properties around the globe.'}
              </p>
              <div className="flex space-x-3">
                {websiteConfig?.facebookUrl && (
                  <motion.a 
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={websiteConfig.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 bg-slate-700/50 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  >
                    <Facebook className="h-5 w-5 text-slate-300 group-hover:text-white" />
                  </motion.a>
                )}
                {websiteConfig?.instagramUrl && (
                  <motion.a 
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={websiteConfig.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 bg-slate-700/50 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  >
                    <Instagram className="h-5 w-5 text-slate-300 group-hover:text-white" />
                  </motion.a>
                )}
                {websiteConfig?.twitterUrl && (
                  <motion.a 
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={websiteConfig.twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 bg-slate-700/50 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  >
                    <Twitter className="h-5 w-5 text-slate-300 group-hover:text-white" />
                  </motion.a>
                )}
                {websiteConfig?.youtubeUrl && (
                    <motion.a 
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={websiteConfig.youtubeUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 bg-slate-700/50 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  >
                    <Youtube className="h-5 w-5 text-slate-300 group-hover:text-white" />
                  </motion.a>
                )}
              </div>
            </motion.div>

            {/* Properties */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold text-white mb-6 relative">
                Our Properties
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              </h4>
              <ul className="space-y-3">
                {allHotels.slice(0, 4).map((hotel) => ( // Show a maximum of 4 properties
                  <li key={hotel.id}>
                    <Link 
                      href={`/properties/${hotel.slug}`} 
                      className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                    >
                      <div className="w-1 h-1 bg-amber-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      {hotel.displayName}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold text-white mb-6 relative">
                Services
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/accommodations" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-amber-400 rounded-full group-hover:scale-150 transition-transform"></div>
                    Luxury Accommodations
                  </Link>
                </li>
                <li>
                  <Link href="/dining" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-amber-400 rounded-full group-hover:scale-150 transition-transform"></div>
                    Fine Dining
                  </Link>
                </li>
                <li>
                  <Link href="/wellness" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-amber-400 rounded-full group-hover:scale-150 transition-transform"></div>
                    Spa & Wellness
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-amber-400 rounded-full group-hover:scale-150 transition-transform"></div>
                    Events & Weddings
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold text-white mb-6 relative">
                Contact Us
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              </h4>
              <div className="space-y-4">
                {websiteConfig?.headquarters && (
                  <div className="flex items-start space-x-3 group">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <MapPin className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-slate-300 text-sm leading-relaxed">{websiteConfig.headquarters}</span>
                  </div>
                )}
                {websiteConfig?.primaryPhone && (
                  <div className="flex items-center space-x-3 group">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <Phone className="h-4 w-4 text-amber-400" />
                    </div>
                    <a href={`tel:${websiteConfig.primaryPhone}`} className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                      {websiteConfig.primaryPhone}
                    </a>
                  </div>
                )}
                {websiteConfig?.primaryEmail && (
                  <div className="flex items-center space-x-3 group">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <Mail className="h-4 w-4 text-amber-400" />
                    </div>
                    <a href={`mailto:${websiteConfig.primaryEmail}`} className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                      {websiteConfig.primaryEmail}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-t border-slate-700/50 py-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center gap-2">
              <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link href="/privacy-policy" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Accessibility
              </Link>
              <Link href="/sitemap" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
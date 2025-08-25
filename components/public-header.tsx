"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, Mail, MapPin, ChevronDown, Calendar, Star, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessUnit, WebsiteConfiguration } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PublicHeaderProps {
  allHotels: BusinessUnit[];
  websiteConfig: WebsiteConfiguration | null;
}

export function PublicHeader({ allHotels, websiteConfig }: PublicHeaderProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100); // Increased threshold for smoother transition
    };
    
    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, []);

  const navigationItems = [
    { name: "Home", href: "/" },
    {
      name: "Our Properties",
      href: "/properties",
      submenu: allHotels.map((hotel) => ({
        name: hotel.displayName,
        href: `/properties/${hotel.slug}`,
        location: hotel.city,
        type: hotel.propertyType,
      })),
    },
    { name: "Experiences", href: "/experiences" },
    { name: "Dining", href: "/dining" },
    { name: "Wellness", href: "/wellness" },
    { name: "Events", href: "/events" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Top Bar - Always visible, no hiding on scroll */}
      <div className="hidden lg:block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/50 fixed top-0 left-0 right-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4 text-sm">
            <div className="flex items-center gap-8">
              {websiteConfig?.primaryPhone && (
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href={`tel:${websiteConfig.primaryPhone}`} 
                  className="flex items-center gap-2 hover:text-amber-400 transition-colors group"
                >
                  <Phone className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  <span>{websiteConfig.primaryPhone}</span>
                </motion.a>
              )}
              {websiteConfig?.primaryEmail && (
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href={`mailto:${websiteConfig.primaryEmail}`} 
                  className="flex items-center gap-2 hover:text-amber-400 transition-colors group"
                >
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>{websiteConfig.primaryEmail}</span>
                </motion.a>
              )}
            </div>
            <div className="flex items-center gap-6 text-slate-300">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium">{allHotels.length} Luxury Destinations</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs ml-1">5-Star Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Solid background, always positioned below top bar */}
      <motion.header 
        className="fixed left-0 right-0 z-50 top-0 lg:top-[52px] bg-white shadow-xl border-b border-slate-200 transition-all duration-300"
        animate={{
          y: 0
        }}
        transition={{
          duration: 0.3,
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className={cn(
                    "flex items-center justify-center duration-300"
                  
                  )}>
                  <Image src="https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx" height={40} width={40} alt="TWC Logo" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br rounded-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold font-serif text-slate-900 transition-colors duration-300">
                    Tropicana
                  </span>
                  <span className="text-xs font-medium -mt-1 text-slate-600 transition-colors duration-300">
                    Worldwide Corporation
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
       
              {navigationItems.map((item) => (
                <div 
                  key={item.name} 
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.submenu ? item.name : null)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.submenu && item.submenu.length > 0 ? (
                    <>
                      <motion.button 
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 group text-slate-700 hover:text-amber-600 hover:bg-amber-50"
                      >
                        {item.name}
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-300",
                          activeDropdown === item.name ? "rotate-180" : ""
                        )} />
                      </motion.button>
                      
                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-50"
                          >
                            <div className="p-2">
                              {item.submenu.map((subItem) => (
                                <Link 
                                  key={subItem.name}
                                  href={subItem.href} 
                                  className="block p-4 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200 group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                                        {subItem.name}
                                      </div>
                                      <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        {subItem.location}
                                      </div>
                                    </div>
                                    <div className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                                      {subItem.type?.replace('_', ' ')}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <motion.div 
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Link 
                        href={item.href} 
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 block text-slate-700 hover:text-amber-600 hover:bg-amber-50"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button 
                  asChild 
                  className="hidden sm:inline-flex bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                >
                  <Link href="#booking" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Now
                  </Link>
                </Button>
              </motion.div>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <motion.div 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative text-slate-600 hover:text-slate-900"
                    >
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80 bg-white">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <span className="text-white font-bold">T</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Tropicana</div>
                        <div className="text-xs text-slate-600">Worldwide Corporation</div>
                      </div>
                    </div>
                    
                    <nav className="flex-1">
                      {navigationItems.map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="mb-2"
                        >
                          <Link 
                            href={item.href}
                            className="block p-4 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 group"
                          >
                            <span className="font-medium text-slate-900 group-hover:text-amber-700">
                              {item.name}
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </nav>

                    <div className="border-t pt-6 mt-6">
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Your Stay
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Spacer to prevent content jumping */}
      <div className="lg:h-[132px] h-[80px]" />
    </>
  );
}
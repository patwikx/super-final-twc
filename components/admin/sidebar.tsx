"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  Building, 
  FileText, 
  Settings, 
  Users, 
  Bed,
  CreditCard,
  BarChart3,
  ChevronDown,
  Star,
  Shield,
  Key,
  Images,
  Calendar,
  Utensils,
  Percent,
  Ticket,
  Wrench,
  ClipboardList,
  MessageSquare,
  Mail,
  HelpCircle,
  Globe,
  Search,
  Bell,
  FileBarChart,
  Tag,
  Phone,
  PartyPopperIcon,
  UserStar
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    title: "Operations",
    items: [
      { title: "Reservations", url: "/admin/operations/reservations", icon: Calendar },
      { title: "Guests", url: "/admin/operations/guests", icon: Users },
      { title: "Properties", url: "/admin/operations/properties", icon: Building },
      { title: "Rooms", url: "/admin/operations/rooms", icon: Bed },
      { title: "Payments", url: "/admin/operations/payments", icon: CreditCard },
      { title: "Services", url: "/admin/operations/services", icon: ClipboardList },
      { title: "Tasks", url: "/admin/operations/tasks", icon: ClipboardList },
      { title: "Maintenance", url: "/admin/operations/maintenance", icon: Wrench },
    ]
  },
  {
    title: "Hospitality",
    items: [
      { title: "Restaurants", url: "/admin/hospitality/restaurants", icon: Utensils },
      { title: "Menu Management", url: "/admin/hospitality/menus", icon: FileText },
      { title: "Restaurant Reservations", url: "/admin/hospitality/restaurant-reservations", icon: Calendar },
    ]
  },
  {
    title: "Content Management",
    items: [
      { title: "Hero Slides", url: "/admin/cms/hero-slides", icon: FileText },
      { title: "Events", url: "/admin/cms/events", icon: PartyPopperIcon },
      { title: "Special Offers", url: "/admin/cms/offers", icon: Star },
      { title: "Testimonials", url: "/admin/cms/testimonials", icon: UserStar },
      { title: "FAQs", url: "/admin/cms/faqs", icon: HelpCircle },
      { title: "Media Library", url: "/admin/cms/media", icon: Images },
      { title: "Content Items", url: "/admin/cms/content", icon: FileText },
      { title: "SEO Settings", url: "/admin/cms/seo", icon: Search },
      { title: "Website Config", url: "/admin/cms/website-config", icon: Globe },
    ]
  },
  {
    title: "Marketing & Promotions",
    items: [
      { title: "Promotions", url: "/admin/marketing-and-promotions/promos", icon: Percent },
      { title: "Vouchers", url: "/admin/marketing-and-promotions/vouchers", icon: Ticket },
      { title: "Room Rates", url: "/admin/marketing-and-promotions/room-rates", icon: Tag },
      { title: "Newsletter", url: "/admin/marketing-and-promotions/newsletter", icon: Mail },
      { title: "Announcements", url: "/admin/marketing-and-promotions/announcements", icon: Bell },
    ]
  },
  {
    title: "Communication",
    items: [
      { title: "Contact Forms", url: "/admin/communications/contact-forms", icon: Phone },
      { title: "Guest Interactions", url: "/admin/communications/guest-interactions", icon: MessageSquare },
      { title: "Email Templates", url: "/admin/communications/email-templates", icon: Mail },
      { title: "Notifications", url: "/admin/communications/notifications", icon: Bell },
    ]
  },
  {
    title: "Configuration",
    items: [
      { title: "Amenities", url: "/admin/configuration/amenities", icon: Shield },
      { title: "Users", url: "/admin/configuration/users", icon: Users },
      { title: "Roles", url: "/admin/configuration/roles", icon: Shield },
      { title: "Permissions", url: "/admin/configuration/permissions", icon: Key },
      { title: "Departments", url: "/admin/configuration/departments", icon: Building },
    ]
  },
  {
    title: "System & Reports",
    items: [
      { title: "Payment Analytics", url: "/admin/system-and-reports/payment-analytics", icon: FileBarChart },
      { title: "Search Analytics", url: "/admin/system-and-reports/search-analytics", icon: Search },
      { title: "Page Analytics", url: "/admin/system-and-reports/page-analytics", icon: BarChart3 },
      { title: "Feedback", url: "/admin/system-and-reports/feedback", icon: MessageSquare },
      { title: "Audit Logs", url: "/admin/system-and-reports/audit-logs", icon: FileBarChart },
      { title: "System Settings", url: "/admin/system-and-reports/settings", icon: Settings },
      { title: "PayMongo Config", url: "/admin/system-and-reports/paymongo", icon: CreditCard },
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 }
  }
}

const groupVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 }
  }
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<string[]>(["Overview", "Operations", "Content Management"])

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    )
  }

  return (
    <Sidebar className="border-r bg-background w-64">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="h-full"
      >
        <SidebarHeader className="p-6 border-b">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-xl border flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Image src="https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx" height={32} width={32} alt="TWC Logo" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold font-serif">Tropicana</h2>
              <p className="text-sm font-medium text-muted-foreground">Worldwide Corporation</p>
            </div>
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="p-6 overflow-y-auto">
          {navigationItems.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              variants={itemVariants}
              custom={groupIndex}
            >
              <SidebarGroup>
                <Collapsible 
                  open={openGroups.includes(group.title)}
                  onOpenChange={() => toggleGroup(group.title)}
                >
                  <CollapsibleTrigger asChild>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <SidebarGroupLabel className="group/label flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-xl transition-all duration-200 cursor-pointer mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group.title}
                        </span>
                        <motion.div
                          animate={{ rotate: openGroups.includes(group.title) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </SidebarGroupLabel>
                    </motion.div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <AnimatePresence>
                      {openGroups.includes(group.title) && (
                        <motion.div
                          variants={groupVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <SidebarGroupContent>
                            <SidebarMenu className="space-y-1">
                              {group.items.map((item, itemIndex) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                                
                                return (
                                  <motion.div
                                    key={item.title}
                                    variants={itemVariants}
                                    custom={itemIndex}
                                    whileHover={{ x: 6 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <SidebarMenuItem>
                                      <SidebarMenuButton 
                                        asChild 
                                        isActive={isActive}
                                        className="group relative"
                                      >
                                        <Link href={item.url} className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200">
                                          <motion.div 
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                              isActive 
                                                ? 'bg-primary text-primary-foreground shadow-lg' 
                                                : 'bg-muted group-hover:bg-muted/80 group-hover:scale-110'
                                            }`}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                          >
                                            <item.icon className="h-5 w-5" />
                                          </motion.div>
                                          <span className={`font-medium text-xs transition-colors ${
                                            isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                                          }`}>
                                            {item.title}
                                          </span>
                                          <AnimatePresence>
                                            {isActive && (
                                              <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute right-3 w-2 h-2 bg-primary rounded-full"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                              />
                                            )}
                                          </AnimatePresence>
                                        </Link>
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  </motion.div>
                                )
                              })}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            </motion.div>
          ))}
        </SidebarContent>
      </motion.div>
    </Sidebar>
  )
}
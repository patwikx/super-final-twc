"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Command,
  Calendar,
  FileText,
  Building
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"

export function AdminHeader() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      // Fix: Correct href construction
      const href = '/' + segments.slice(0, i + 1).join('/')
      const isLast = i === segments.length - 1
      
      let title = segment.charAt(0).toUpperCase() + segment.slice(1)
      if (title === 'Cms') title = 'CMS'
      if (title === 'Admin') title = 'Dashboard'
      
      breadcrumbs.push({
        title,
        href,
        isLast
      })
    }
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  const quickActions = [
    { title: "New Reservation", icon: Calendar, href: "/admin/reservations/new" },
    { title: "Add Property", icon: Building, href: "/admin/properties/new" },
    { title: "Create Page", icon: FileText, href: "/admin/cms/pages/new" },
  ]

  return (
    <header className="sticky top-0 z-35 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          
          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage className="font-semibold text-slate-900">
                        {crumb.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={crumb.href}
                        className="text-slate-600 hover:text-amber-600 transition-colors"
                      >
                        {crumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search reservations, guests, pages..."
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 transition-all duration-200"
              onFocus={() => setSearchOpen(true)}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs text-slate-500"
            >
              <Command className="h-3 w-3 mr-1" />
              ⌘K
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.href} asChild>
                  <Link href={action.href} className="flex items-center gap-2">
                    <action.icon className="h-4 w-4" />
                    {action.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-slate-900">Admin User</div>
                  <div className="text-xs text-slate-500">admin@tropicana.com</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
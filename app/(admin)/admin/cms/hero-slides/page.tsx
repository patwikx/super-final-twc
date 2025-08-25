import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Filter,
  Star,
  Play,
  Pause
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Hero } from "@prisma/client"

// Define a type for our hero slide data to prevent 'any' type errors
type HeroSlide = Hero;

export default async function HeroSlidesPage() {
  const heroSlides: HeroSlide[] = await prisma.hero.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  const getDisplayTypeIcon = (type: string) => {
    switch (type) {
      case 'fullscreen': return Monitor
      case 'banner': return ImageIcon
      case 'carousel': return Smartphone // Changed 'card' to 'carousel' to match schema possibility
      default: return ImageIcon
    }
  }

  const getDisplayTypeColor = (type: string) => {
    switch (type) {
      case 'fullscreen': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'banner': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'carousel': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  const statCards = [
    {
      title: 'Total Slides',
      value: heroSlides.length,
      icon: ImageIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active',
      value: heroSlides.filter((h: HeroSlide) => h.isActive).length,
      icon: Play,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Featured',
      value: heroSlides.filter((h: HeroSlide) => h.isFeatured).length,
      icon: Star,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Inactive',
      value: heroSlides.filter((h: HeroSlide) => !h.isActive).length,
      icon: Pause,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hero Slides
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Manage homepage hero sections and promotional banners
          </p>
        </div>
        <Button asChild size="default" className="shrink-0">
          <Link href="/admin/cms/hero-slides/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Hero Slide
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.title} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Hero Slides Table */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">
                All Hero Slides
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {heroSlides.length} {heroSlides.length === 1 ? 'slide' : 'slides'} total
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search slides..." 
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter slides</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {heroSlides.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Slide</TableHead>
                  <TableHead className="font-semibold text-foreground">Display Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Target Pages</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Order</TableHead>
                  <TableHead className="font-semibold text-foreground">Visibility</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {heroSlides.map((slide: HeroSlide) => {
                  const DisplayIcon = getDisplayTypeIcon(slide.displayType)
                  
                  return (
                    <TableRow key={slide.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200/50">
                            <ImageIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground leading-none truncate">
                              {slide.title}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {slide.subtitle}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <DisplayIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge 
                            variant="secondary" 
                            className={getDisplayTypeColor(slide.displayType)}
                          >
                            {slide.displayType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {slide.targetPages?.map((page: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize">
                              {page}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="secondary" 
                          className={slide.isActive 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }
                        >
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm font-medium text-foreground tabular-nums">
                          {slide.sortOrder}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {slide.isFeatured && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/cms/hero-slides/${slide.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Slide
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Slide
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  No hero slides created yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start creating hero slides to showcase your properties and special offers on the homepage.
                </p>
              </div>
              <Button asChild className="mt-6">
                <Link href="/admin/cms/hero-slides/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Hero Slide
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

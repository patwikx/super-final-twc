import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"



export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>

      <div className="min-h-screen w-full flex bg-slate-50">
        <div className="flex-shrink-0">
          <AdminSidebar />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 w-full max-w-none">
            <div className="w-full max-w-none">
              {children}
            </div>
          </main>
        </div>
      </div>

    </SidebarProvider>
  )
}
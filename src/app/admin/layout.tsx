import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Sprout, Users, Lock, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarContent className="p-2">
              <SidebarHeader>
                  <div className="flex items-center justify-between">
                      <Link href="/admin" className="flex items-center gap-2 font-bold text-lg group-data-[collapsible=icon]:hidden">
                          <Sprout className="w-6 h-6 text-primary" />
                          <span className="font-headline">Admin</span>
                      </Link>
                      <div className="group-data-[collapsible=icon]:hidden">
                          <SidebarTrigger />
                      </div>
                  </div>
              </SidebarHeader>
              <SidebarMenu className="mt-8">
                  <SidebarMenuItem>
                      <Link href="/admin/users" className="w-full">
                          <SidebarMenuButton tooltip="Users">
                              <Users />
                              <span>Users</span>
                          </SidebarMenuButton>
                      </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Sign-ins">
                          <Lock />
                          <span>Sign-in Management</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                       <SidebarMenuButton tooltip="System">
                          <Settings />
                          <span>System Oversight</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-6">
              <div className="flex items-center gap-4">
                  <div className="block md:hidden">
                      <SidebarTrigger />
                  </div>
                  <Button variant="outline" asChild>
                      <Link href="/">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to App
                      </Link>
                  </Button>
              </div>
              <UserNav />
          </header>
          <main className="p-6">
              {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

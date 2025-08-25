
'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Sprout, Users, Lock, Settings, ArrowLeft, Newspaper, Loader2, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        const checkAdminStatus = async () => {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().isAdmin === true) {
                setIsAdmin(true);
            } else {
                // To prevent non-admins from seeing the admin panel, even for a flash
                router.push('/');
            }
            setLoading(false);
        };

        checkAdminStatus();

    }, [user, authLoading, router]);

    if (loading || authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!isAdmin) {
        // This part is mainly a fallback, as the useEffect will redirect.
        // It prevents rendering the admin layout for non-admins.
        return (
            <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
                 <ShieldAlert className="h-12 w-12 text-destructive" />
                 <div className="text-center">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                 </div>
                 <Button asChild>
                    <Link href="/">Return to Homepage</Link>
                 </Button>
            </div>
        );
    }

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
                      <Link href="/admin/blog" className="w-full">
                          <SidebarMenuButton tooltip="Blog">
                              <Newspaper />
                              <span>Blog</span>
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

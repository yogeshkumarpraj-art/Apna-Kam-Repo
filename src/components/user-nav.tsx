
"use client"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, Heart, LogOut, Settings, Shield, User, Briefcase } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { auth, db } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
    isAdmin: boolean;
    isWorker: boolean;
}

export function UserNav() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({ isAdmin: false, isWorker: false });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            isAdmin: data.isAdmin === true,
            isWorker: data.isWorker === true,
          });
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || "https://placehold.co/100x100.png"} alt={user.displayName || "User"} data-ai-hint="person" />
            <AvatarFallback>{user.phoneNumber ? user.phoneNumber.slice(-2) : 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || user.phoneNumber}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
           <Link href="/my-bookings">
            <DropdownMenuItem>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>My Bookings</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/favorites">
            <DropdownMenuItem>
              <Heart className="mr-2 h-4 w-4" />
              <span>Favorites</span>
            </DropdownMenuItem>
          </Link>
          {!profile.isWorker && (
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
          )}
          <Link href="/profile/edit">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          {profile.isAdmin && (
            <Link href="/admin">
                <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Loader2, CheckCircle } from "lucide-react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Worker' | 'Customer';
  isApproved?: boolean;
  avatar: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList: User[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'N/A',
            email: data.email || 'N/A',
            role: data.isWorker ? 'Worker' : 'Customer',
            isApproved: data.isApproved,
            avatar: data.avatar || `https://placehold.co/100x100.png`
          };
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
        toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleApproveWorker = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    try {
        await updateDoc(userRef, {
            isApproved: true
        });
        setUsers(users.map(user => user.id === userId ? { ...user, isApproved: true } : user));
        toast({ title: "Success", description: "Worker has been approved." });
    } catch (error) {
        console.error("Error approving worker: ", error);
        toast({ title: "Error", description: "Failed to approve worker.", variant: "destructive" });
    }
  }

  const getStatus = (user: User): { text: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string } => {
      if (user.role !== 'Worker') {
          return { text: 'N/A', variant: 'secondary' };
      }
      if (user.isApproved) {
          return { text: 'Approved', variant: 'default', className: 'bg-green-100 text-green-800' };
      }
      return { text: 'Pending Approval', variant: 'destructive', className: 'bg-yellow-100 text-yellow-800' };
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View, approve, and manage all users on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const status = getStatus(user);
                return (
                    <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar className="hidden sm:flex">
                            <AvatarImage src={user.avatar} data-ai-hint="person"/>
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                    <TableCell>
                        <Badge variant={status.variant} className={status.className}>
                        {status.text}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View profile</DropdownMenuItem>
                            {user.role === 'Worker' && !user.isApproved && (
                                <DropdownMenuItem onClick={() => handleApproveWorker(user.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Worker
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete user</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

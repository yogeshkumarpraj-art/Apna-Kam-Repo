
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
import { MoreHorizontal, Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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

  const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
    const userRef = doc(db, "users", userId);
    const newStatus = !currentStatus;
    try {
        await updateDoc(userRef, {
            isApproved: newStatus
        });
        setUsers(users.map(user => user.id === userId ? { ...user, isApproved: newStatus } : user));
        toast({ title: "Success", description: `Worker has been ${newStatus ? 'approved' : 'unapproved'}.` });
    } catch (error) {
        console.error("Error updating worker status: ", error);
        toast({ title: "Error", description: "Failed to update worker status.", variant: "destructive" });
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast({
        title: "User Deleted",
        description: `The user "${userToDelete.name}" has been deleted.`,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to delete the user.",
        variant: 'destructive',
      });
    } finally {
      setIsAlertOpen(false);
      setUserToDelete(null);
    }
  };


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
    <>
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
                            {user.role === 'Worker' && (
                                user.isApproved ? (
                                    <DropdownMenuItem onClick={() => handleToggleApproval(user.id, user.isApproved!)}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Revoke Approval
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => handleToggleApproval(user.id, user.isApproved || false)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve Worker
                                    </DropdownMenuItem>
                                )
                            )}
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete user
                            </DropdownMenuItem>
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

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              &quot;{userToDelete?.name}&quot; from the platform records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

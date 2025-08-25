
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react"
import { getSortedPostsData, PostMeta } from "@/lib/blog"
import Link from "next/link"
import { format } from "date-fns"
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
import { deletePost } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


export default function BlogManagementPage() {
  const allPosts = getSortedPostsData();
  const [posts, setPosts] = useState<PostMeta[]>(allPosts);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostMeta | null>(null);
  const { toast } = useToast();
  const router = useRouter();


  const handleDeleteClick = (post: PostMeta) => {
    setPostToDelete(post);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await deletePost(postToDelete.id);
      setPosts(posts.filter(p => p.id !== postToDelete.id));
      toast({
        title: "Post Deleted",
        description: `The post "${postToDelete.title}" has been deleted.`,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to delete the post.",
        variant: 'destructive',
      });
    } finally {
      setIsAlertOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
              <CardTitle>Blog Management</CardTitle>
              <CardDescription>Create, edit, and manage all blog posts.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/blog/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link href={`/blog/${post.id}`} className="font-medium hover:underline">
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                      {format(new Date(post.date), 'MMMM d, yyyy')}
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                         <DropdownMenuItem asChild><Link href={`/blog/${post.id}`} className="w-full">View post</Link></DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDeleteClick(post)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              titled &quot;{postToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Yes, delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

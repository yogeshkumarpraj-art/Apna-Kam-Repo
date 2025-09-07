
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { updatePost, getPost } from '@/app/admin/blog/actions';
import { PostData } from '@/lib/blog';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPostPage() {
  const [post, setPost] = useState<PostData | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const postData = await getPost(slug);
        setPost(postData);
        setTitle(postData.title);
        setDescription(postData.description);
        setContent(postData.content);
      } catch (error) {
        toast({
          title: "Error fetching post",
          description: "Could not retrieve the post data.",
          variant: "destructive",
        });
        router.push('/admin/blog');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, router, toast]);

  const handleUpdate = async () => {
    if (!title || !description || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill out all the fields before updating.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updatePost(slug, { title, description, content });
      toast({
        title: "Post Updated!",
        description: "Your blog post has been successfully updated.",
      });
      router.push('/admin/blog');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-2/4" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </CardContent>
             <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-28" />
             </CardFooter>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Blog Post</CardTitle>
        <CardDescription>
          Make changes to your article below. The slug for this post is `/{slug}`.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Post Title</Label>
          <Input 
            id="title" 
            placeholder="Enter the title of your blog post" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUpdating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Short Description</Label>
          <Input 
            id="description" 
            placeholder="A brief summary of the post for previews" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUpdating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea 
            id="content" 
            placeholder="Write your blog post content here. You can use Markdown for formatting."
            rows={15}
            className="font-code"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/blog">Cancel</Link>
        </Button>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Post
        </Button>
      </CardFooter>
    </Card>
  );
}

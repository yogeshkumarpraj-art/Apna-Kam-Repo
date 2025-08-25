
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createPost } from '@/app/admin/blog/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { generateBlogPost } from '@/ai/flows/generate-blog-post';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerateContent = async () => {
    if (!title || !description) {
      toast({
        title: "Title and Description needed",
        description: "Please fill out the title and description to generate content with AI.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateBlogPost({ title, shortDescription: description });
      setContent(result.blogPostContent);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Generation Failed",
        description: "Could not generate blog content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const handlePublish = async () => {
    if (!title || !description || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill out all the fields before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      await createPost({ title, description, content });
      toast({
        title: "Post Published!",
        description: "Your new blog post is now live.",
      });
      router.push('/admin/blog');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to publish the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Blog Post</CardTitle>
        <CardDescription>
          Fill out the details below to publish a new article to your blog.
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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Short Description</Label>
          <Input 
            id="description" 
            placeholder="A brief summary of the post for previews" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
           <div className="flex justify-between items-center">
             <Label htmlFor="content">Content (Markdown)</Label>
             <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateContent} 
              disabled={isGenerating || !title || !description}
            >
               {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate with AI
            </Button>
           </div>
          <Textarea 
            id="content" 
            placeholder="Write your blog post content here, or generate it with AI."
            rows={15}
            className="font-code"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/blog">Cancel</Link>
        </Button>
        <Button onClick={handlePublish} disabled={isPublishing}>
          {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish Post
        </Button>
      </CardFooter>
    </Card>
  );
}

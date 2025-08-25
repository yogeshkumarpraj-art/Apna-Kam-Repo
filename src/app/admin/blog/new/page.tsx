
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewPostPage() {
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
          <Input id="title" placeholder="Enter the title of your blog post" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Short Description</Label>
          <Input id="description" placeholder="A brief summary of the post for previews" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea 
            id="content" 
            placeholder="Write your blog post content here. You can use Markdown for formatting."
            rows={15}
            className="font-code"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/blog">Cancel</Link>
        </Button>
        <Button>Publish Post</Button>
      </CardFooter>
    </Card>
  );
}


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { getSortedPostsData } from "@/lib/blog"
import Link from "next/link"
import { PostsTable } from "./posts-table"

export default function BlogManagementPage() {
  const allPosts = getSortedPostsData();

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
           <PostsTable initialPosts={allPosts} />
        </CardContent>
      </Card>
    </>
  )
}

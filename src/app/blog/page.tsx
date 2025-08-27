
import Link from 'next/link';
import { getSortedPostsData, PostMeta } from '@/lib/blog';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Footer } from '@/components/footer';

export default function BlogPage() {
  const allPostsData: PostMeta[] = getSortedPostsData();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 font-headline">Apna Kam Blog</h1>
          <div className="space-y-6">
            {allPostsData.map(({ id, date, title, description }) => (
              <Link href={`/blog/${id}`} key={id} className="block">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
                     <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(date), 'MMMM d, yyyy')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

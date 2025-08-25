
import { getPostData, getAllPostIds, PostData } from '@/lib/blog';
import { Header } from '@/components/header';
import { format } from 'date-fns';

// This function gets called at build time
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map(p => ({ slug: p.params.slug }));
}

async function getPost(slug: string) {
    const postData = await getPostData(slug, true);
    return postData;
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const postData: PostData = await getPost(params.slug);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <article className="max-w-3xl mx-auto prose dark:prose-invert lg:prose-xl">
          <h1 className="font-headline mb-2">{postData.title}</h1>
          <div className="text-muted-foreground mb-8">
            <time dateTime={postData.date}>{format(new Date(postData.date), 'MMMM d, yyyy')}</time>
          </div>
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </main>
    </div>
  );
}

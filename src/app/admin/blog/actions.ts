
'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { revalidatePath } from 'next/cache';

const postsDirectory = path.join(process.cwd(), 'src/posts');

interface PostInput {
    title: string;
    description: string;
    content: string;
}

export async function createPost(post: PostInput) {
    const { title, description, content } = post;
    
    // Create a slug from the title
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .trim()
        .replace(/\s+/g, '-'); // replace spaces with hyphens

    const date = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const matterResult = matter.stringify(content, {
        title,
        date,
        description,
    });

    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    fs.writeFileSync(fullPath, matterResult);

    // Revalidate paths to show the new post immediately
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/admin/blog');
}

export async function deletePost(slug: string) {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/admin/blog');
}

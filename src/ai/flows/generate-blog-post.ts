
'use server';
/**
 * @fileOverview AI agent to generate blog post content.
 *
 * - generateBlogPost - A function that generates blog post content based on a title and description.
 * - GenerateBlogPostInput - The input type for the generateBlogPost function.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostInputSchema = z.object({
  title: z
    .string()
    .describe('The title of the blog post.'),
  shortDescription: z
    .string()
    .describe('A short description or summary of what the blog post should be about.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  blogPostContent: z
    .string()
    .describe('The full content of the blog post, formatted in Markdown.'),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: {schema: GenerateBlogPostInputSchema},
  output: {schema: GenerateBlogPostOutputSchema},
  prompt: `You are an expert content writer for "Apna Kaushal," a platform connecting skilled workers in India with customers. Your tone should be helpful, informative, and encouraging.

You are tasked with writing a blog post. Use the following details to generate the content.

Blog Post Title: "{{title}}"
Short Description: "{{shortDescription}}"

Based on this, write a full, engaging, and SEO-friendly blog post. The post must be in Markdown format.

- Start with a compelling introduction that grabs the reader's attention.
- Use Markdown for headings (e.g., ###), bullet points (e.g., -), and bold text (**text**).
- Structure the post with clear headings and paragraphs.
- If relevant, include practical tips or numbered lists.
- End with a concluding paragraph that summarizes the key points and encourages readers to use the "Apna Kaushal" platform.
- The language should be simple and easy to understand for a general audience in India. You can use some Hindi words if it feels natural (e.g., "Apna Kaushal par," "ekdum aasan").`,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

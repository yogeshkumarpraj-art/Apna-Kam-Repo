
'use server';
/**
 * @fileOverview AI agent to summarize worker reviews.
 *
 * - summarizeReviews - A function that generates a summary of all reviews for a given worker.
 * - SummarizeReviewsInput - The input type for the summarizeReviews function.
 * - SummarizeReviewsOutput - The return type for the summarizeReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Review } from '@/lib/types';


const SummarizeReviewsInputSchema = z.object({
  workerId: z
    .string()
    .describe('The ID of the worker whose reviews should be summarized.'),
});
export type SummarizeReviewsInput = z.infer<typeof SummarizeReviewsInputSchema>;


const SummarizeReviewsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise, balanced summary of the worker\'s reviews.'),
});
export type SummarizeReviewsOutput = z.infer<typeof SummarizeReviewsOutputSchema>;


// This is the main function that will be called from the frontend.
export async function summarizeReviews(input: SummarizeReviewsInput): Promise<SummarizeReviewsOutput> {
  // 1. Fetch all reviews for the worker.
  const reviewsQuery = query(
      collection(db, 'reviews'), 
      where('workerId', '==', input.workerId)
  );
  const reviewsSnapshot = await getDocs(reviewsQuery);
  const reviews: Review[] = reviewsSnapshot.docs.map(doc => doc.data() as Review);

  // If there are no reviews, return an empty summary.
  if (reviews.length === 0) {
      return { summary: '' };
  }
  
  // 2. Extract just the comments from the reviews.
  const reviewTexts = reviews.map(r => r.comment).filter(Boolean); // Filter out any empty comments

  // 3. Call the Genkit flow with the review texts.
  return summarizeReviewsFlow({ reviewTexts });
}


const InternalFlowInputSchema = z.object({
    reviewTexts: z.array(z.string()).describe('A list of review comments.')
});

const prompt = ai.definePrompt({
  name: 'summarizeReviewsPrompt',
  input: {schema: InternalFlowInputSchema},
  output: {schema: SummarizeReviewsOutputSchema},
  prompt: `You are an expert review analyst for the "Apna Kaushal" platform. Your task is to provide a fair and balanced summary of a worker based on customer reviews.

Analyze the following review comments:
{{#each reviewTexts}}
- "{{this}}"
{{/each}}

Based on these reviews, generate a short, easy-to-read paragraph (3-4 sentences). The summary should:
- Be written in a neutral and objective tone.
- Mention both the positive aspects (strengths) and the negative aspects (areas for improvement) if they exist.
- Focus on recurring themes or common points mentioned by multiple customers.
- Do not invent any information. Base the summary strictly on the provided reviews.
- Conclude with an overall impression.
- Write the summary in a way that helps a new customer make an informed decision.`,
});

const summarizeReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeReviewsFlow',
    inputSchema: InternalFlowInputSchema,
    outputSchema: SummarizeReviewsOutputSchema,
  },
  async (input) => {
    // If there are no review texts to process, return early.
    if (input.reviewTexts.length === 0) {
        return { summary: 'This worker has not received any written feedback yet.' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);

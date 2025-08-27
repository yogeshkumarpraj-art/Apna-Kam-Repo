
// This file uses server-side code.
'use server';

/**
 * @fileOverview AI-powered search functionality to provide more relevant and intelligent search results.
 *
 * - aiSearch - A function that handles the AI search process.
 * - AiSearchInput - The input type for the aiSearch function.
 * - AiSearchOutput - The return type for the aiSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchWorkersTool } from '../tools/worker-search';
import type { Worker } from '@/lib/types';


const AiSearchInputSchema = z.object({
  query: z.string().describe('The search query from the user (e.g., "plumber", "AC repair"). Can be an empty string if using filters.'),
  skillCategories: z.array(z.string()).optional().describe('Optional list of skill categories to filter by.'),
  pincode: z.string().optional().describe('Optional 6-digit pincode to filter by location.'),
});

export type AiSearchInput = z.infer<typeof AiSearchInputSchema>;

// The output will now be a direct array of Worker objects.
const AiSearchOutputSchema = z.array(z.custom<Worker>());

export type AiSearchOutput = z.infer<typeof AiSearchOutputSchema>;

export async function aiSearch(input: AiSearchInput): Promise<AiSearchOutput> {
  // If the query is empty, and there are no filters, we can return an empty array
  // to avoid making an unnecessary AI call.
  if (!input.query && !input.pincode && (!input.skillCategories || input.skillCategories.length === 0)) {
    return [];
  }
  return aiSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSearchPrompt',
  input: {schema: AiSearchInputSchema},
  // The output from the prompt will be the direct list of workers now.
  output: {schema: AiSearchOutputSchema},
  tools: [searchWorkersTool],
  prompt: `You are an AI search assistant for the "Apna Kam" platform. Your goal is to help users find the best-skilled workers in India.

User's search query: "{{query}}"
{{#if pincode}}
The user is searching in pincode: {{pincode}}.
{{/if}}
{{#if skillCategories}}
The user has filtered by the following skill categories: {{#each skillCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

IMPORTANT:
1.  Analyze the user's query, pincode, and category filters.
2.  Use the 'searchWorkersTool' to find relevant, *approved* workers from the database.
3.  If the query is specific (e.g., "I need someone to fix my leaky tap"), infer the correct category (e.g., "Plumber") and use the tool.
4.  If the user provides a pincode, you MUST use it in the tool.
5.  If the user provides skill categories, you MUST use them in the tool.
6.  Do NOT invent workers. Only return workers provided by the 'searchWorkersTool'.
7.  Return the search results as a JSON array of worker profiles. If the tool returns no workers, return an empty array.
`,
});

const aiSearchFlow = ai.defineFlow(
  {
    name: 'aiSearchFlow',
    inputSchema: AiSearchInputSchema,
    outputSchema: AiSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // The output is now directly the array of workers.
    return output || [];
  }
);

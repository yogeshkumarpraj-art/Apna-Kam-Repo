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

const AiSearchInputSchema = z.object({
  query: z.string().describe('The search query from the user.'),
  skillCategories: z.array(z.string()).optional().describe('Optional list of skill categories to filter by.'),
  location: z.string().optional().describe('Optional location to filter by.'),
});

export type AiSearchInput = z.infer<typeof AiSearchInputSchema>;

const AiSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      workerId: z.string().describe('The ID of the worker.'),
      name: z.string().describe('The name of the worker.'),
      skills: z.array(z.string()).describe('The skills of the worker.'),
      category: z.string().describe('The category of the worker.'),
      location: z.string().describe('The location of the worker.'),
      description: z.string().describe('A short description of the worker.'),
    })
  ).describe('The search results, an array of worker profiles.'),
});

export type AiSearchOutput = z.infer<typeof AiSearchOutputSchema>;

export async function aiSearch(input: AiSearchInput): Promise<AiSearchOutput> {
  return aiSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSearchPrompt',
  input: {schema: AiSearchInputSchema},
  output: {schema: AiSearchOutputSchema},
  prompt: `You are an AI search assistant designed to find workers based on user queries. 

Given the following search query: "{{query}}"

Return a JSON array of worker profiles that match the search query. Each worker profile should include workerId, name, skills, category, location and a short description. 

Consider the following skill categories if provided: {{skillCategories}}
Consider the following location if provided: {{location}}

Ensure that the results are relevant to the query and the worker profiles contain the information requested in the correct fields.
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
    return output!;
  }
);

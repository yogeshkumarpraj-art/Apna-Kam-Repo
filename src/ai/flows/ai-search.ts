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
  query: z.string().describe('The search query from the user (e.g., "plumber", "AC repair").'),
  skillCategories: z.array(z.string()).optional().describe('Optional list of skill categories to filter by.'),
  pincode: z.string().optional().describe('Optional 6-digit pincode to filter by location.'),
});

export type AiSearchInput = z.infer<typeof AiSearchInputSchema>;

const AiSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      workerId: z.string().describe('The ID of the worker.'),
      name: z.string().describe('The name of the worker.'),
      skills: z.array(z.string()).describe('The skills of the worker.'),
      category: z.string().describe('The category of the worker.'),
      location: z.string().describe('The location of the worker, which should be a city or area.'),
      pincode: z.string().optional().describe('The 6-digit postal code of the worker.'),
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
  prompt: `You are an AI search assistant for the "Apna Kaushal" platform, designed to find skilled workers in India based on user queries.

Your task is to find workers who match the user's request.

User's search query: "{{query}}"
{{#if pincode}}
The user is searching in pincode: {{pincode}}. You MUST filter the results to only include workers from this pincode.
{{/if}}
{{#if skillCategories}}
The user has filtered by the following skill categories: {{#each skillCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}. You should prioritize workers in these categories.
{{/if}}

Based on this, provide a JSON array of worker profiles. For demonstration, you can create up to 8 realistic but fictional worker profiles that match the criteria. Each worker profile MUST include a workerId, name, skills, category, location, pincode, and a short description. If a pincode is provided, all returned workers must have that exact pincode. If no workers are found for the given criteria, return an empty array for the "results" field.`,
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

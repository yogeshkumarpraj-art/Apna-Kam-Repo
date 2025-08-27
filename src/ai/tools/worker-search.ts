
'use server';
/**
 * @fileOverview A tool for searching approved workers from the Firestore database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Worker } from '@/lib/types';

const WorkerSearchInputSchema = z.object({
    pincode: z.string().optional().describe('A 6-digit pincode to filter workers by location.'),
    categories: z.array(z.string()).optional().describe('A list of skill categories to filter workers by (e.g., "Plumber", "Electrician").'),
});

// The output will be an array of Worker objects.
const WorkerSearchOutputSchema = z.array(z.custom<Worker>());

export const searchWorkersTool = ai.defineTool(
  {
    name: 'searchWorkersTool',
    description: 'Searches for approved skilled workers in the database. Use this to find workers based on location (pincode) or skill category.',
    inputSchema: WorkerSearchInputSchema,
    outputSchema: WorkerSearchOutputSchema,
  },
  async (input) => {
    const { pincode, categories } = input;

    // Start with the base query for approved workers
    let q = query(
        collection(db, 'users'), 
        where('isWorker', '==', true),
        where('isApproved', '==', true)
    );

    // Apply filters if they exist
    if (pincode) {
        q = query(q, where('pincode', '==', pincode));
    }
    if (categories && categories.length > 0) {
        q = query(q, where('category', 'in', categories));
    }

    const querySnapshot = await getDocs(q);
    
    const workers: Worker[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        workers.push({
            id: doc.id,
            name: data.name,
            category: data.category,
            location: data.location,
            pincode: data.pincode,
            description: data.description,
            skills: data.skills,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            price: data.price,
            priceType: data.priceType,
            isFavorite: false, // This needs to be determined client-side
            avatar: data.avatar || "https://placehold.co/100x100.png",
            portfolio: data.portfolio || [{url: "https://placehold.co/600x400.png", hint: "worker professional", fullPath: ''}],
        });
    });

    return workers;
  }
);

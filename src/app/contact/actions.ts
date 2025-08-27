'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ContactFormInput {
    name: string;
    email: string;
    message: string;
}

export async function saveContactMessage(input: ContactFormInput) {
    const { name, email, message } = input;

    if (!name || !email || !message) {
        throw new Error('Missing required fields for contact message.');
    }

    try {
        await addDoc(collection(db, 'contacts'), {
            name,
            email,
            message,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error saving contact message:", error);
        throw new Error("Could not save your message. Please try again.");
    }
}

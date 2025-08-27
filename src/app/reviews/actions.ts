
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, runTransaction, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface SubmitReviewInput {
    bookingId: string;
    workerId: string;
    customerId: string;
    customerName: string;
    customerAvatar: string;
    rating: number;
    comment: string;
}

export async function submitReview(input: SubmitReviewInput) {
    const { bookingId, workerId, customerId, customerName, customerAvatar, rating, comment } = input;

    if (!bookingId || !workerId || !customerId || !rating) {
        throw new Error('Missing required fields for review submission.');
    }

    const workerRef = doc(db, 'users', workerId);
    const reviewColRef = collection(db, 'reviews');
    const bookingRef = doc(db, 'bookings', bookingId);

    try {
        await runTransaction(db, async (transaction) => {
            const workerDoc = await transaction.get(workerRef);
            if (!workerDoc.exists()) {
                throw new Error("Worker does not exist!");
            }

            // Create the new review
            transaction.set(doc(reviewColRef), {
                bookingId,
                workerId,
                customerId,
                customerName,
                customerAvatar,
                rating,
                comment,
                createdAt: serverTimestamp(),
            });

            // Calculate new average rating for the worker
            const workerData = workerDoc.data();
            const currentRating = workerData.rating || 0;
            const reviewCount = workerData.reviewCount || 0;

            const newReviewCount = reviewCount + 1;
            const newRating = ((currentRating * reviewCount) + rating) / newReviewCount;

            // Update worker's rating and review count
            transaction.update(workerRef, { 
                rating: newRating,
                reviewCount: newReviewCount 
            });

            // Mark the booking as reviewed
            transaction.update(bookingRef, { hasBeenReviewed: true });
        });

        revalidatePath(`/worker/${workerId}`);
        revalidatePath('/my-bookings');

    } catch (error) {
        console.error("Error submitting review:", error);
        throw new Error("Could not submit review. Please try again.");
    }
}

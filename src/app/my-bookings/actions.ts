
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') {
    if (!bookingId || !status) {
        throw new Error('Missing booking ID or status.');
    }

    const bookingRef = doc(db, 'bookings', bookingId);

    try {
        await updateDoc(bookingRef, { status });
        revalidatePath('/my-bookings');
    } catch (error) {
        console.error("Error updating booking status:", error);
        throw new Error("Could not update booking status.");
    }
}

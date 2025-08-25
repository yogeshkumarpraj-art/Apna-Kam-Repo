
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface CreateBookingInput {
    workerId: string;
    customerId: string;
    bookingDate: Date;
}

export async function createBooking(input: CreateBookingInput) {
    const { workerId, customerId, bookingDate } = input;

    if (!workerId || !customerId || !bookingDate) {
        throw new Error('Missing required fields for booking.');
    }
    
    // Fetch worker and customer names to store in the booking for easier display
    const workerDoc = await getDoc(doc(db, "users", workerId));
    const customerDoc = await getDoc(doc(db, "users", customerId));

    if (!workerDoc.exists() || !customerDoc.exists()) {
        throw new Error("Worker or Customer not found.");
    }


    try {
        await addDoc(collection(db, 'bookings'), {
            workerId,
            customerId,
            workerName: workerDoc.data().name,
            customerName: customerDoc.data().name,
            bookingDate: bookingDate, // The fix is here
            status: 'pending', // Initial status
            createdAt: serverTimestamp(),
        });
        
        // Revalidate the worker's page, although this won't show bookings yet.
        // It's good practice for when we do show booking info.
        revalidatePath(`/worker/${workerId}`);
        revalidatePath('/my-bookings');

    } catch (error) {
        console.error("Error creating booking:", error);
        throw new Error("Could not create booking. Please try again.");
    }
}

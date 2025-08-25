
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface CreateBookingInput {
    workerId: string;
    customerId: string;
    workerName: string;
    customerName: string;
    bookingDate: Date;
}

export async function createBooking(input: CreateBookingInput) {
    const { workerId, customerId, bookingDate, workerName, customerName } = input;

    if (!workerId || !customerId || !bookingDate || !workerName || !customerName) {
        throw new Error('Missing required fields for booking.');
    }

    try {
        await addDoc(collection(db, 'bookings'), {
            workerId,
            customerId,
            workerName,
            customerName,
            bookingDate: Timestamp.fromDate(new Date(bookingDate)),
            status: 'pending', // Initial status
            createdAt: serverTimestamp(),
        });
        
        revalidatePath(`/worker/${workerId}`);
        revalidatePath('/my-bookings');

    } catch (error) {
        console.error("Error creating booking:", error);
        throw new Error("Could not create booking. Please try again.");
    }
}


'use server';

import { razorpay } from '@/lib/razorpay';
import crypto from 'crypto';

interface RazorpayOrder {
    id: string;
    currency: string;
    amount: number;
}

// IMPORTANT: This is a placeholder. You must implement your own logic
// to create and store the order in your database before creating it in Razorpay.
export async function createRazorpayOrder(options: { amount: number, currency: string }): Promise<RazorpayOrder | null> {
    const { amount, currency } = options;
    
    // Convert amount to the smallest currency unit (e.g., paisa for INR)
    const amountInPaisa = amount * 100;

    const orderOptions = {
        amount: amountInPaisa,
        currency,
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(orderOptions);
        console.log('Razorpay order created:', order);
        
        // You should save the order details (order.id, etc.) to your database here
        // associated with the user and the worker they are trying to contact.

        return {
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        };
    } catch (error) {
        console.error('Failed to create Razorpay order:', error);
        return null;
    }
}


interface PaymentVerificationInput {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

// IMPORTANT: This is where you verify the payment signature to confirm the payment is legitimate.
// You must complete this logic.
export async function verifyPayment(input: PaymentVerificationInput) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        console.log('Payment verification successful');
        
        // Payment is successful. You should now:
        // 1. Find the order in your database using razorpay_order_id.
        // 2. Update the order status to 'paid'.
        // 3. Record the payment_id.
        // 4. Grant the user access to the worker's contact details.
        
        return { isSuccess: true, orderId: razorpay_order_id };
    } else {
        console.error('Payment verification failed');
        return { isSuccess: false };
    }
}

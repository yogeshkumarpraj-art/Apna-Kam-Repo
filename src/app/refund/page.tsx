
import { Header } from '@/components/header';
import { BadgeHelp } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <BadgeHelp className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-4 font-headline">Cancellation & Refund Policy</h1>
            <p className="text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="prose dark:prose-invert lg:prose-xl mx-auto text-foreground">
            <p>
              At Apna Kam, we strive to create a fair and transparent platform for both our customers and our workers. This policy outlines the terms for booking cancellations and refunds.
            </p>

            <h2>1. Booking Cancellation by Customer</h2>
            <ul>
                <li><strong>Cancellation before Worker Confirmation:</strong> If a customer cancels a booking request before the worker has confirmed it, any amount paid will be refunded in full.</li>
                <li><strong>Cancellation after Worker Confirmation:</strong> If a customer cancels a booking after a worker has confirmed it, a small cancellation fee may apply. This fee is to compensate the worker for their time and lost opportunity. The exact fee will be mentioned at the time of cancellation.</li>
                <li><strong>No-Show:</strong> If the customer is not available at the specified time and location, it will be treated as a cancellation, and a fee may be charged.</li>
            </ul>

            <h2>2. Booking Cancellation by Worker</h2>
            <p>
              If a worker cancels a confirmed booking, we will do our best to find you an alternative worker. If we are unable to find a suitable replacement, any amount paid for the booking will be refunded in full. We also take worker cancellations very seriously and penalize workers who cancel frequently without valid reasons.
            </p>

            <h2>3. Refund Process</h2>
            <p>
              All refunds will be processed to the original mode of payment within 5-7 business days. The platform fee for revealing a worker's contact is non-refundable under any circumstances.
            </p>
            
            <h2>4. Disputes</h2>
            <p>
              If you are not satisfied with the service provided, we encourage you to first discuss the issue with the worker. If the issue is not resolved, you can raise a dispute with our support team within 24 hours of service completion. Our team will investigate the matter and provide a resolution, which may include a partial or full refund, depending on the circumstances.
            </p>

            <h2>5. Changes to This Policy</h2>
            <p>
              Apna Kam reserves the right to modify this cancellation and refund policy at any time. Any changes will be effective immediately upon posting on our website.
            </p>
            
            <h2>6. Contact Us</h2>
             <p>
              If you have any questions about our Cancellation & Refund Policy, please contact us at support@apnakam.com.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

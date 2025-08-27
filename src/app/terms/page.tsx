
import { Header } from '@/components/header';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-4 font-headline">Terms & Conditions</h1>
            <p className="text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="prose dark:prose-invert lg:prose-xl mx-auto text-foreground">
            <p>
              Welcome to Apna Kam. These terms and conditions outline the rules and regulations for the use of Apna Kam's Website. By accessing this website we assume you accept these terms and conditions. Do not continue to use Apna Kam if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2>1. Introduction</h2>
            <p>
             Apna Kam ("we", "us", "our") provides an online platform that connects skilled workers ("Workers") with individuals or businesses seeking services ("Customers"). These Terms govern your use of our platform and services.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>

            <h2>3. Services</h2>
            <p>
                Apna Kam is a marketplace. We are not a party to the contracts for services between Customers and Workers. We do not hire or employ Workers, and we are not responsible for their conduct or the quality of their work. We simply facilitate the connection.
            </p>
            
            <h2>4. Payments</h2>
             <p>
                Customers are obligated to pay for the services they book through the platform. Apna Kam may charge a fee for using the platform to connect Customers and Workers. All payments are subject to the pricing terms and conditions displayed at the time of the transaction.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              In no event shall Apna Kam, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>

            <h2>6. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

            <h2>7. Changes to Terms</h2>
            <p>
             We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

             <h2>8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at yogeshkumarpraj@gmail.com.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


import { Header } from '@/components/header';
import { Shield } from 'lucide-react';

export default function PolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-4 font-headline">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="prose dark:prose-invert lg:prose-xl mx-auto text-foreground">
            <p>
              Welcome to Apna Kam. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              We may collect personal information from you in a variety of ways, including, but not limited to, when you visit our site, register on the site, place an order, and in connection with other activities, services, features or resources we make available on our Site. You may be asked for, as appropriate, name, email address, mailing address, phone number.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We may use the information we collect from you to:
            </p>
            <ul>
                <li>Personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.</li>
                <li>Improve our website in order to better serve you.</li>
                <li>To allow us to better service you in responding to your customer service requests.</li>
                <li>To administer a contest, promotion, survey or other site feature.</li>
                <li>To quickly process your transactions.</li>
            </ul>

            <h2>3. How We Protect Your Information</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
            </p>

            <h2>4. Sharing Your Personal Information</h2>
            <p>
              We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates and advertisers for the purposes outlined above.
            </p>
            
            <h2>5. Changes to This Privacy Policy</h2>
            <p>
              Apna Kam has the discretion to update this privacy policy at any time. When we do, we will revise the updated date at the top of this page. We encourage you to frequently check this page for any changes to stay informed about how we are helping to protect the personal information we collect.
            </p>

            <h2>6. Contacting Us</h2>
            <p>
              If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at support@apnakam.com.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

    

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Sprout } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Sprout className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-4 font-headline">About Apna Kam</h1>
            <p className="text-xl text-muted-foreground">
              Connecting skilled workers with those who need them.
            </p>
          </div>

          <div className="prose dark:prose-invert lg:prose-xl mx-auto text-foreground">
            <h2>Our Mission</h2>
            <p>
              Our mission at Apna Kam is to bridge the gap between skilled local workers and customers in India. We aim to create a reliable and easy-to-use platform where individuals and businesses can find verified and talented professionals for a wide range of services. We are dedicated to empowering local workers by providing them with a platform to showcase their skills and grow their business.
            </p>

            <h2>Our Vision</h2>
            <p>
              We envision a future where finding a skilled worker is as easy as a few clicks. A future where every talented worker, regardless of their location, has the opportunity to connect with potential customers and earn a respectable livelihood. We want to build India's largest and most trusted network of skilled professionals, fostering a community built on quality work and mutual respect.
            </p>

            <h2>Why Choose Apna Kam?</h2>
            <ul>
              <li><strong>Verified Workers:</strong> We verify the credentials of our workers to ensure you hire trusted professionals.</li>
              <li><strong>Wide Range of Services:</strong> From plumbers and electricians to painters and carpenters, find experts for over 25+ services.</li>
              <li><strong>Transparent Ratings:</strong> Make informed decisions with genuine reviews and ratings from other users.</li>
              <li><strong>Direct Communication:</strong> Connect directly with workers to discuss your requirements and negotiate prices.</li>
              <li><strong>Empowering Local Talent:</strong> By using our platform, you support local economies and help skilled individuals grow.</li>
            </ul>
            
            <p>
              Thank you for being a part of our journey. Together, let's build a better, more connected community.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    

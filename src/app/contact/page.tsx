
'use client'

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle form submission, e.g., send an email or save to a database.
    // For this example, we'll just show a toast notification.
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We will get back to you shortly.",
    });
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 font-headline">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              We'd love to hear from you. Get in touch with us for any queries or feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                <div className="space-y-4 text-lg">
                  <p className="flex items-center gap-4">
                    <Mail className="w-6 h-6 text-primary" />
                    <span>support@apnakam.com</span>
                  </p>
                  <p className="flex items-center gap-4">
                    <Phone className="w-6 h-6 text-primary" />
                    <span>+91 98765 43210</span>
                  </p>
                  <p className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <span>Apna Kam Headquarters<br />New Delhi, India</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

    
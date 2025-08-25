'use client'

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import type { Worker, Review } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Phone, Mail, Heart, Flag, Calendar as CalendarIcon, Share2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const mockWorker: Worker = { id: '1', name: 'Ramesh Kumar', category: 'Electrician', location: 'Mumbai', rating: 4.5, reviews: 120, price: 500, priceType: 'daily', skills: ['Wiring', 'Fixture Installation', 'Repairs', 'Circuit Breakers', 'Inspections'], description: 'Experienced electrician with over 10 years in the field. Reliable and efficient. I specialize in both residential and commercial projects, ensuring safety and quality in all my work.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "electrical work"}, {url: "https://placehold.co/600x400.png", hint: "person wiring"}, {url: "https://placehold.co/600x400.png", hint: "electrical panel"}], contact: { phone: "+91 9876543210", email: "ramesh.k@example.com"} };

const mockReviews: Review[] = [
    { id: '1', author: 'Amit Patel', avatar: 'https://placehold.co/100x100.png', rating: 5, comment: 'Ramesh was very professional and fixed the issue quickly. Highly recommended!', date: '2 weeks ago' },
    { id: '2', author: 'Sunita Rao', avatar: 'https://placehold.co/100x100.png', rating: 4, comment: 'Good work, but was a bit late. Overall satisfied with the service.', date: '1 month ago' }
]

export default function WorkerProfilePage({ params }: { params: { id: string } }) {
    const [contactRevealed, setContactRevealed] = useState(false);

    const handleRevealContact = () => {
        // Here you would implement the payment flow
        setContactRevealed(true);
    };

    const handleWhatsAppShare = () => {
        const text = `Check out this skilled worker on Apna Kaushal: ${mockWorker.name} - ${window.location.href}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Portfolio</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {mockWorker.portfolio.map((image, index) => (
                                    <div key={index} className="overflow-hidden rounded-lg shadow-md aspect-w-1 aspect-h-1">
                                      <Image src={image.url} alt={`Portfolio image ${index + 1}`} width={400} height={400} className="object-cover w-full h-full" data-ai-hint={image.hint}/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">About {mockWorker.name}</h2>
                            <p className="text-muted-foreground leading-relaxed">{mockWorker.description}</p>
                        </div>
                        
                        <Separator />

                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Reviews ({mockWorker.reviews})</h2>
                            <div className="space-y-6">
                                {mockReviews.map(review => (
                                    <div key={review.id} className="flex gap-4">
                                        <Avatar>
                                            <AvatarImage src={review.avatar} alt={review.author} data-ai-hint="person" />
                                            <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{review.author}</p>
                                                <span className="text-xs text-muted-foreground">{review.date}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 my-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="w-24 h-24 border-4 border-primary ring-4 ring-primary/20">
                                        <AvatarImage src={mockWorker.avatar} alt={mockWorker.name} data-ai-hint="person portrait" />
                                        <AvatarFallback>{mockWorker.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h1 className="text-2xl font-bold mt-4 font-headline">{mockWorker.name}</h1>
                                    <p className="text-primary font-semibold">{mockWorker.category}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{mockWorker.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm mt-2">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold">{mockWorker.rating}</span>
                                        <span className="text-muted-foreground">({mockWorker.reviews} reviews)</span>
                                    </div>
                                </div>
                                <Separator className="my-6" />
                                <div>
                                    <h3 className="font-bold mb-3">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {mockWorker.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
                                    </div>
                                </div>
                                <Separator className="my-6" />
                                
                                {contactRevealed ? (
                                    <div className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start"><Phone className="mr-2 h-4 w-4" /> {mockWorker.contact?.phone}</Button>
                                        <Button variant="outline" className="w-full justify-start"><Mail className="mr-2 h-4 w-4" /> {mockWorker.contact?.email}</Button>
                                    </div>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                          Reveal Contact (₹50)
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          You are about to pay ₹50 to reveal the contact details for {mockWorker.name}. This action is non-refundable.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleRevealContact} className="bg-accent text-accent-foreground hover:bg-accent/90">Pay and Reveal</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}

                                <Button variant="default" className="w-full mt-2"><CalendarIcon className="mr-2 h-4 w-4" /> Request Booking</Button>
                                
                                <div className="grid grid-cols-2 gap-2 text-center mt-6 text-sm text-muted-foreground">
                                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent hover:text-primary flex-1">
                                        <Heart className="mr-2 h-4 w-4" /> Add to Favorites
                                    </Button>
                                     <Button variant="ghost" className="p-0 h-auto hover:bg-transparent hover:text-primary flex-1" onClick={handleWhatsAppShare}>
                                        <Share2 className="mr-2 h-4 w-4" /> Share
                                    </Button>
                                </div>
                                 <div className="text-center mt-4">
                                     <Button variant="ghost" className="p-0 h-auto text-destructive hover:bg-transparent hover:text-destructive/80 text-xs">
                                        <Flag className="mr-2 h-4 w-4" /> Report Profile
                                    </Button>
                                 </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    );
}

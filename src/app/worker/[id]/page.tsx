
'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import type { Worker, Review } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Phone, Mail, Heart, Flag, Calendar as CalendarIcon, Share2, Loader2, Sparkles, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { createBooking } from '@/app/bookings/actions';
import { summarizeReviews } from '@/ai/flows/summarize-reviews';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { createRazorpayOrder, verifyPayment } from '@/app/payments/actions';
import Script from 'next/script';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function WorkerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const [worker, setWorker] = useState<Worker | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewSummary, setReviewSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(true);
    const [loading, setLoading] = useState(true);
    const [contactRevealed, setContactRevealed] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
    const [isBooking, setIsBooking] = useState(false);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    
    const { id } = params;

    useEffect(() => {
        const fetchWorkerAndReviews = async () => {
            if (!id) return;
            setLoading(true);
            setIsSummarizing(true);
            try {
                // Fetch worker data
                const workerDocRef = doc(db, "users", id as string);
                const workerDocSnap = await getDoc(workerDocRef);

                if (workerDocSnap.exists()) {
                    const data = workerDocSnap.data();
                    setWorker({
                        id: workerDocSnap.id,
                        name: data.name,
                        category: data.category,
                        location: data.location,
                        pincode: data.pincode,
                        description: data.description,
                        skills: data.skills,
                        price: data.price,
                        priceType: data.priceType,
                        avatar: data.avatar || "https://placehold.co/100x100.png",
                        portfolio: data.portfolio || [{url: "https://placehold.co/600x400.png", hint: "worker professional", fullPath: ''}],
                        rating: data.rating || 0,
                        reviewCount: data.reviewCount || 0,
                        isFavorite: false, // Will be updated below
                        contact: { phone: data.phone, email: data.email },
                    });
                }

                // Fetch reviews for the worker
                const reviewsQuery = query(
                    collection(db, 'reviews'), 
                    where('workerId', '==', id as string)
                );
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const reviewsList: Review[] = reviewsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate(),
                })) as Review[];

                // Sort reviews by date client-side to avoid complex index
                reviewsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                
                setReviews(reviewsList);

                // Check favorite status if user is logged in
                if (user) {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setIsFavorite(userData.favorites?.includes(id as string));
                    }
                }
                 // Generate review summary
                if (reviewsList.length > 0) {
                    summarizeReviews({ workerId: id as string })
                        .then(result => setReviewSummary(result.summary))
                        .catch(err => console.error("Failed to get summary", err))
                        .finally(() => setIsSummarizing(false));
                } else {
                    setIsSummarizing(false);
                }

            } catch (error) {
                console.error("Error fetching worker data: ", error);
                 toast({ title: "Error", description: "Could not fetch worker data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchWorkerAndReviews();
    }, [id, user, toast]);

    const handlePayment = async () => {
        if (!user || !worker) return;
        setIsPaying(true);
        try {
            const order = await createRazorpayOrder({ amount: 50, currency: 'INR' });
            if (!order) {
                throw new Error("Order creation failed");
            }
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use NEXT_PUBLIC_ for client-side env vars
                amount: order.amount,
                currency: order.currency,
                name: "Apna Kam",
                description: `Fee to contact ${worker.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    const verificationResult = await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    if (verificationResult.isSuccess) {
                        toast({ title: "Payment Successful!", description: `You can now contact ${worker?.name}.` });
                        setContactRevealed(true);
                    } else {
                        toast({ title: "Payment Verification Failed", description: "Please contact support.", variant: "destructive" });
                    }
                },
                prefill: {
                    name: user.displayName || 'Customer',
                    email: user.email || '',
                    contact: user.phoneNumber || ''
                },
                notes: {
                    address: "Apna Kam Corporate Office"
                },
                theme: {
                    color: "#5DADE2"
                }
            };
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Payment failed", error);
            toast({ title: "Payment Failed", description: "Could not initiate payment. Please try again.", variant: "destructive" });
        } finally {
            setIsPaying(false);
        }
    }

    const handleWhatsAppShare = () => {
        if (!worker) return;
        const text = `Check out this skilled worker on Apna Kam: ${worker.name} - ${window.location.href}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    const handleToggleFavorite = async () => {
        if (!user) {
            toast({
                title: "Please log in",
                description: "You need to be logged in to add favorites.",
                variant: "destructive"
            });
            router.push('/login');
            return;
        }

        const userDocRef = doc(db, "users", user.uid);
        
        try {
            if (isFavorite) {
                await updateDoc(userDocRef, {
                    favorites: arrayRemove(id)
                });
                toast({ title: "Removed from favorites." });
            } else {
                await updateDoc(userDocRef, {
                    favorites: arrayUnion(id)
                }, { merge: true });
                toast({ title: "Added to favorites!" });
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error("Error updating favorites:", error);
            toast({ title: "Error", description: "Could not update favorites.", variant: "destructive" });
        }
    };
    
     const handleBookingRequest = async () => {
        if (!user) {
            toast({ title: "Please log in", description: "You must be logged in to book a worker.", variant: "destructive" });
            router.push('/login');
            return;
        }
        if (!bookingDate) {
            toast({ title: "Select a date", description: "Please select a date for the booking.", variant: "destructive" });
            return;
        }
        setIsBooking(true);
        try {
            await createBooking({
                workerId: worker!.id,
                customerId: user.uid,
                workerName: worker!.name,
                customerName: user.displayName || 'Customer', // Pass customer name
                bookingDate: bookingDate.toISOString(),
            });
            toast({
                title: "Booking Request Sent!",
                description: `${worker!.name} has been notified. You will be updated on the status soon.`,
            });
            setIsBookingDialogOpen(false); // Close the dialog on success
        } catch (error) {
            console.error(error);
            toast({
                title: "Booking Failed",
                description: "Could not send booking request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsBooking(false);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </main>
            </div>
        )
    }

    if (!worker) {
         return (
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center text-center">
                    <h1 className="text-2xl font-bold mb-4">Worker Not Found</h1>
                    <p className="text-muted-foreground mb-6">The profile you are looking for does not exist.</p>
                    <Button asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </main>
            </div>
        )
    }


    return (
        <>
        <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
        />
        <div className="bg-background min-h-screen">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Portfolio</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {worker.portfolio.map((image, index) => (
                                    <div key={index} className="overflow-hidden rounded-lg shadow-md aspect-w-1 aspect-h-1">
                                      <Image src={image.url} alt={`Portfolio image ${index + 1}`} width={400} height={400} className="object-cover w-full h-full" data-ai-hint={image.hint}/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">About {worker.name}</h2>
                            <p className="text-muted-foreground leading-relaxed">{worker.description}</p>
                        </div>
                        
                        <Separator />

                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Reviews ({worker.reviewCount})</h2>

                            {worker.reviewCount > 1 && (
                                <Card className="mb-6 bg-accent/10 border-accent/30 dark:bg-accent/20 dark:border-accent/50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg text-accent-foreground/80">
                                            <Sparkles className="w-5 h-5 text-accent" />
                                            AI Generated Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isSummarizing ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                &quot;{reviewSummary}&quot;
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-6">
                                {reviews.length > 0 ? reviews.map(review => (
                                    <div key={review.id} className="flex gap-4">
                                        <Avatar>
                                            <AvatarImage src={review.customerAvatar} alt={review.customerName} data-ai-hint="person" />
                                            <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{review.customerName}</p>
                                                <span className="text-xs text-muted-foreground">{formatDistanceToNow(review.createdAt)} ago</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 my-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-muted-foreground">No reviews yet. Be the first one to leave a review!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="w-24 h-24 border-4 border-primary ring-4 ring-primary/20">
                                        <AvatarImage src={worker.avatar} alt={worker.name} data-ai-hint="person portrait" />
                                        <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h1 className="text-2xl font-bold mt-4 font-headline">{worker.name}</h1>
                                    <p className="text-primary font-semibold">{worker.category}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{worker.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm mt-2">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold">{worker.rating.toFixed(1)}</span>
                                        <span className="text-muted-foreground">({worker.reviewCount} reviews)</span>
                                    </div>
                                </div>
                                <Separator className="my-6" />
                                <div>
                                    <h3 className="font-bold mb-3">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {worker.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
                                    </div>
                                </div>
                                <Separator className="my-6" />
                                
                                <Alert variant="destructive" className="mb-4">
                                    <ShieldAlert className="h-4 w-4" />
                                    <AlertTitle>Disclaimer</AlertTitle>
                                    <AlertDescription>
                                        Apna Kam is a discovery platform. We are not responsible for any fraud, crime, or accidents. Please verify the worker's credentials on your own.
                                    </AlertDescription>
                                </Alert>
                                
                                {contactRevealed ? (
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-center mb-2">Contact Details</h3>
                                        <Button variant="outline" className="w-full justify-start"><Phone className="mr-2 h-4 w-4" /> {worker.contact?.phone}</Button>
                                        <Button variant="outline" className="w-full justify-start"><Mail className="mr-2 h-4 w-4" /> {worker.contact?.email}</Button>
                                    </div>
                                ) : (
                                  <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handlePayment} disabled={isPaying}>
                                      {isPaying && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                      Reveal Contact & Pay ₹50
                                  </Button>
                                )}

                                <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default" className="w-full mt-2"><CalendarIcon className="mr-2 h-4 w-4" /> Request Booking</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Request a Booking with {worker.name}</DialogTitle>
                                            <DialogDescription>
                                                Select a date for the service. The worker will confirm their availability.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-center">
                                            <Calendar
                                                mode="single"
                                                selected={bookingDate}
                                                onSelect={setBookingDate}
                                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                                className="rounded-md border"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleBookingRequest} disabled={isBooking || !bookingDate}>
                                                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Confirm Booking
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                
                                <div className="grid grid-cols-2 gap-2 text-center mt-6 text-sm text-muted-foreground">
                                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent hover:text-primary flex-1" onClick={handleToggleFavorite}>
                                        <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} /> {isFavorite ? 'Favorited' : 'Add to Favorites'}
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
        </>
    );
}

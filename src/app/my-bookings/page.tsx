
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Header } from '@/components/header';
import { Loader2, Calendar, Briefcase, User, Check, X, CheckCircle2, Star, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { updateBookingStatus } from './actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Booking } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { submitReview } from '../reviews/actions';
import { Label } from '@/components/ui/label';

const ReviewDialog = ({ booking, onReviewSubmitted }: { booking: Booking, onReviewSubmitted: (bookingId: string) => void }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!user) return;
        if (rating === 0) {
            toast({ title: "Please select a rating.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            await submitReview({
                bookingId: booking.id,
                workerId: booking.workerId,
                customerId: user.uid,
                customerName: user.displayName || "Anonymous",
                customerAvatar: user.photoURL || "https://placehold.co/100x100.png",
                rating,
                comment,
            });
            toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
            onReviewSubmitted(booking.id);
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            toast({ title: "Submission Failed", description: "Could not submit your review.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Leave a Review
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Review your booking with {booking.workerName}</DialogTitle>
                    <DialogDescription>Your feedback helps other users make better decisions.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Your Rating</Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer transition-colors ${
                                        (hoverRating >= star || rating >= star)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Comment (Optional)</Label>
                        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function MyBookingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const customerQuery = query(
                    collection(db, 'bookings'),
                    where('customerId', '==', user.uid),
                    orderBy('bookingDate', 'desc')
                );
                const workerQuery = query(
                    collection(db, 'bookings'),
                    where('workerId', '==', user.uid),
                    orderBy('bookingDate', 'desc')
                );

                const [customerSnapshot, workerSnapshot] = await Promise.all([
                    getDocs(customerQuery),
                    getDocs(workerQuery)
                ]);

                const allBookingsMap = new Map<string, Booking>();

                const processSnapshot = (snapshot: any) => {
                    snapshot.forEach((doc: any) => {
                        const data = doc.data();
                        if (!allBookingsMap.has(doc.id)) {
                             allBookingsMap.set(doc.id, {
                                id: doc.id,
                                ...data,
                                bookingDate: data.bookingDate.toDate(),
                                createdAt: data.createdAt.toDate(),
                            } as Booking);
                        }
                    });
                };
                
                processSnapshot(customerSnapshot);
                processSnapshot(workerSnapshot);
                
                const sortedBookings = Array.from(allBookingsMap.values()).sort((a,b) => b.bookingDate.getTime() - a.bookingDate.getTime());
                setBookings(sortedBookings);

            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast({ title: "Error", description: "Failed to fetch bookings.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, toast]);

    const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
        setIsUpdating(bookingId);
        try {
            await updateBookingStatus(bookingId, newStatus);
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
            toast({
                title: "Booking Updated",
                description: `The booking has been ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating booking:", error);
            toast({ title: "Error", description: "Could not update the booking status.", variant: "destructive" });
        } finally {
            setIsUpdating(null);
        }
    };

    const handleReviewSubmitted = (bookingId: string) => {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, hasBeenReviewed: true } : b));
    }
    
    const getBadgeVariant = (status: Booking['status']) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'confirmed': return 'default';
            case 'completed': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    }
    
    const getBadgeClassName = (status: Booking['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            default: return '';
        }
    }


    const upcomingBookings = bookings.filter(b => b.status === 'pending' || (b.status === 'confirmed' && b.bookingDate >= new Date()));
    const pastBookings = bookings.filter(b => b.status !== 'pending' && (b.status !== 'confirmed' || b.bookingDate < new Date()));
    
    const BookingCard = ({ booking }: { booking: Booking }) => {
        const isWorker = user?.uid === booking.workerId;
        const isCustomer = user?.uid === booking.customerId;

        return (
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                           <CardTitle className="text-xl">
                            {isWorker ? `Booking with ${booking.customerName}` : `Booking for ${booking.workerName}`}
                           </CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-2">
                                <Calendar className="w-4 h-4" />
                                {format(booking.bookingDate, 'MMMM d, yyyy')}
                            </CardDescription>
                        </div>
                        <Badge variant={getBadgeVariant(booking.status)} className={`capitalize ${getBadgeClassName(booking.status)}`}>{booking.status}</Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex justify-end gap-2">
                    {isWorker && booking.status === 'pending' && (
                        <>
                            <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(booking.id, 'cancelled')} disabled={isUpdating === booking.id}>
                                {isUpdating === booking.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4" />}
                                Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleStatusUpdate(booking.id, 'confirmed')} disabled={isUpdating === booking.id}>
                                {isUpdating === booking.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                                Confirm
                            </Button>
                        </>
                    )}
                    {isCustomer && booking.status === 'confirmed' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(booking.id, 'completed')} disabled={isUpdating === booking.id}>
                            {isUpdating === booking.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Mark as Completed
                        </Button>
                    )}
                     {isCustomer && booking.status === 'completed' && !booking.hasBeenReviewed && (
                        <ReviewDialog booking={booking} onReviewSubmitted={handleReviewSubmitted} />
                    )}
                </CardFooter>
            </Card>
        )
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

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                 <main className="container mx-auto px-4 py-8 flex-1">
                    <div className="text-center py-20 border-2 border-dashed rounded-lg">
                        <h2 className="text-xl font-semibold">Please Log In</h2>
                        <p className="text-muted-foreground mt-2">
                            <Link href="/login" className="text-primary hover:underline">Log in</Link> to see your bookings.
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-1">
                 <div className="flex items-center gap-3 mb-8">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">
                        My Bookings
                    </h1>
                </div>

                <Tabs defaultValue="upcoming">
                    <TabsList>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past & Cancelled</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming" className="space-y-4 mt-6">
                        {upcomingBookings.length > 0 ? (
                            upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed rounded-lg">
                                <h2 className="text-xl font-semibold">No Upcoming Bookings</h2>
                                <p className="text-muted-foreground mt-2">You don't have any bookings scheduled.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="past" className="space-y-4 mt-6">
                         {pastBookings.length > 0 ? (
                            pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                        ) : (
                           <div className="text-center py-20 border-2 border-dashed rounded-lg">
                                <h2 className="text-xl font-semibold">No Past Bookings</h2>
                                <p className="text-muted-foreground mt-2">Your past and cancelled bookings will appear here.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

            </main>
        </div>
    );
}


'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { WorkerCard } from '@/components/worker-card';
import type { Worker } from '@/lib/types';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

// This function will fetch details of multiple workers based on their IDs
const fetchWorkersByIds = async (ids: string[]): Promise<Worker[]> => {
    if (ids.length === 0) return [];
    
    const workerPromises = ids.map(id => getDoc(doc(db, "users", id)));
    const workerDocs = await Promise.all(workerPromises);

    const workers: Worker[] = workerDocs
        .filter(docSnap => docSnap.exists())
        .map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                name: data.name,
                category: data.category,
                location: data.location,
                pincode: data.pincode,
                description: data.description,
                skills: data.skills,
                rating: data.rating || 0,
                reviewCount: data.reviewCount || 0,
                price: data.price,
                priceType: data.priceType,
                isFavorite: true, // They are favorites on this page
                avatar: data.avatar || "https://placehold.co/100x100.png",
                portfolio: data.portfolio || [{url: "https://placehold.co/600x400.png", hint: "worker professional", fullPath: ''}],
            };
        });
    return workers;
};

export default function FavoritesPage() {
    const { user } = useAuth();
    const [favoriteWorkers, setFavoriteWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const favoriteIds = userData.favorites || [];
                    const workers = await fetchWorkersByIds(favoriteIds);
                    setFavoriteWorkers(workers);
                }
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Heart className="h-8 w-8 text-destructive fill-destructive" />
                        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">
                            Your Favorite Workers
                        </h1>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : !user ? (
                         <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <h2 className="text-xl font-semibold">Please Log In</h2>
                            <p className="text-muted-foreground mt-2">
                                <Link href="/login" className="text-primary hover:underline">Log in</Link> to see your favorite workers.
                            </p>
                        </div>
                    ) : favoriteWorkers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {favoriteWorkers.map((worker) => (
                                <WorkerCard key={worker.id} worker={worker} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <h2 className="text-xl font-semibold">No Favorites Yet</h2>
                            <p className="text-muted-foreground mt-2">Click the heart icon on a worker's profile to save them here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

'use client';

import { Header } from '@/components/header';
import { WorkerCard } from '@/components/worker-card';
import type { Worker } from '@/lib/types';
import { Heart } from 'lucide-react';

const mockFavoriteWorkers: Worker[] = [
    { id: '2', name: 'Sita Sharma', category: 'Plumber', location: 'Delhi', rating: 4.8, reviews: 85, price: 700, priceType: 'job', skills: ['Leak Repair', 'Pipe Fitting', 'Drain Cleaning'], description: 'Certified plumber providing top-notch services for residential and commercial properties.', isFavorite: true, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "plumbing work"}]},
    { id: '5', name: 'Vikram Rathod', category: 'AC Technician', location: 'Chennai', rating: 4.7, reviews: 150, price: 800, priceType: 'job', skills: ['AC Installation', 'Repair & Service', 'Gas Refilling'], description: 'Expert AC technician ensuring your comfort during the hot summers.', isFavorite: true, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "air conditioner"}]},
];


export default function FavoritesPage() {
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
                    {mockFavoriteWorkers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {mockFavoriteWorkers.map((worker) => (
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

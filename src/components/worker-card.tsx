
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Heart } from 'lucide-react';
import type { Worker } from '@/lib/types';
import { Button } from './ui/button';
import { useAuth } from '@/context/auth-context';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WorkerCardProps {
  worker: Worker;
}

const getPriceSuffix = (priceType: Worker['priceType']) => {
    switch (priceType) {
        case 'daily':
            return '/day';
        case 'job':
            return '/job';
        case 'sqft':
            return '/sq.ft.';
        default:
            return '';
    }
}

export function WorkerCard({ worker }: WorkerCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(worker.isFavorite);

  useEffect(() => {
    // This effect ensures the favorite status is updated if the user's favorites list changes elsewhere.
    const checkFavoriteStatus = async () => {
        if (!user) {
            setIsFavorite(false);
            return;
        };
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const favorites = userData.favorites || [];
            setIsFavorite(favorites.includes(worker.id));
        }
    };
    checkFavoriteStatus();
  }, [user, worker.id]);
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to worker page
    e.stopPropagation();

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
                favorites: arrayRemove(worker.id)
            });
            toast({ title: "Removed from favorites." });
        } else {
            await updateDoc(userDocRef, {
                favorites: arrayUnion(worker.id)
            }, { merge: true });
            toast({ title: "Added to favorites!" });
        }
        setIsFavorite(!isFavorite); // Optimistically update UI
    } catch (error) {
        console.error("Error updating favorites:", error);
        toast({ title: "Error", description: "Could not update favorites.", variant: "destructive" });
    }
  };

  return (
    <Link href={`/worker/${worker.id}`} className="block group">
      <Card className="overflow-hidden card-glow h-full flex flex-col">
        <div className="relative">
          <Image
            src={worker.portfolio[0]?.url || "https://placehold.co/400x300.png"}
            alt={worker.name}
            width={400}
            height={300}
            className="object-cover w-full h-48"
            data-ai-hint={worker.portfolio[0]?.hint || "worker professional"}
          />
          <Button
            size="icon"
            variant={isFavorite ? 'destructive' : 'secondary'}
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span className="sr-only">Favorite</span>
          </Button>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg font-headline">{worker.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-foreground">{worker.rating.toFixed(1)}</span>
              <span className="text-xs">({worker.reviewCount})</span>
            </div>
          </div>
          <p className="text-sm text-primary font-medium">{worker.category}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="w-4 h-4" />
            <span>{worker.location}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {worker.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
          <div className="mt-4 text-right flex-1 flex items-end justify-end">
            <p className="text-lg font-bold text-foreground">
              ₹{worker.price}
              <span className="text-sm font-normal text-muted-foreground">{getPriceSuffix(worker.priceType)}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Heart } from 'lucide-react';
import type { Worker } from '@/lib/types';
import { Button } from './ui/button';

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
  return (
    <Link href={`/worker/${worker.id}`} className="block group [perspective:1000px]">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/20 h-full flex flex-col group-hover:-translate-y-2 group-hover:[transform:rotateX(4deg)]">
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
            variant={worker.isFavorite ? 'destructive' : 'secondary'}
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              // Handle favorite toggle logic here
            }}
          >
            <Heart className={`h-4 w-4 ${worker.isFavorite ? 'fill-current' : ''}`} />
            <span className="sr-only">Favorite</span>
          </Button>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg font-headline">{worker.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-foreground">{worker.rating}</span>
              <span className="text-xs">({worker.reviews})</span>
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

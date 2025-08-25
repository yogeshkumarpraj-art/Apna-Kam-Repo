'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { WorkerCard } from '@/components/worker-card';
import type { Worker } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { aiSearch, type AiSearchInput } from '@/ai/flows/ai-search';
import { Skeleton } from '@/components/ui/skeleton';

const mockWorkers: Worker[] = [
    { id: '1', name: 'Ramesh Kumar', category: 'Electrician', location: 'Mumbai', rating: 4.5, reviews: 120, price: 500, priceType: 'daily', skills: ['Wiring', 'Fixture Installation', 'Repairs'], description: 'Experienced electrician with over 10 years in the field. Reliable and efficient.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "electrical work"}] },
    { id: '2', name: 'Sita Sharma', category: 'Plumber', location: 'Delhi', rating: 4.8, reviews: 85, price: 700, priceType: 'job', skills: ['Leak Repair', 'Pipe Fitting', 'Drain Cleaning'], description: 'Certified plumber providing top-notch services for residential and commercial properties.', isFavorite: true, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "plumbing work"}]},
    { id: '3', name: 'Anil Yadav', category: 'Carpenter', location: 'Bangalore', rating: 4.2, reviews: 95, price: 600, priceType: 'daily', skills: ['Furniture Making', 'Polishing', 'Custom Designs'], description: 'Skilled carpenter creating custom furniture and providing repair services.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "woodwork"}] },
    { id: '4', name: 'Priya Singh', category: 'Painter', location: 'Kolkata', rating: 4.9, reviews: 200, price: 450, priceType: 'daily', skills: ['Interior Painting', 'Exterior Painting', 'Wall Texturing'], description: 'Professional painter who brings life to your walls with a perfect finish.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "painting walls"}]},
    { id: '5', name: 'Vikram Rathod', category: 'AC Technician', location: 'Chennai', rating: 4.7, reviews: 150, price: 800, priceType: 'job', skills: ['AC Installation', 'Repair & Service', 'Gas Refilling'], description: 'Expert AC technician ensuring your comfort during the hot summers.', isFavorite: true, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "air conditioner"}]},
    { id: '6', name: 'Deepa Verma', category: 'Home Cleaning', location: 'Pune', rating: 4.6, reviews: 180, price: 1000, priceType: 'job', skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning'], description: 'Thorough and diligent cleaning services for a sparkling clean home.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "clean home"}]},
];

const skillCategories = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Home Cleaning'];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});

  const handleSearch = async () => {
    setIsLoading(true);
    try {
        const input: AiSearchInput = {
            query: searchQuery,
            skillCategories: Object.keys(selectedCategories).filter(k => selectedCategories[k]),
        };
        // In a real app, the AI output would be mapped to the Worker[] type.
        // Here we just return the mock data for demonstration.
        // const response: AiSearchOutput = await aiSearch(input);
        setTimeout(() => { // Simulate network delay
            setSearchResults(mockWorkers);
            setIsLoading(false);
        }, 1000);
    } catch (error) {
        console.error("AI Search failed:", error);
        // For demo, fall back to mock data
        setSearchResults(mockWorkers);
        setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => ({...prev, [category]: !prev[category]}));
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
              Find the Right Skill for the Job
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Apna Kaushal connects you with verified and skilled workers for all your home needs.
            </p>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for 'plumber in Delhi'..."
                  className="pl-10 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSearch} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                <span className="hidden sm:inline ml-2">Search</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="h-12">
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="hidden sm:inline ml-2">Filters</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Skill Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {skillCategories.map(category => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={!!selectedCategories[category]}
                      onCheckedChange={() => toggleCategory(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-12">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[225px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {searchResults.map((worker) => (
                    <WorkerCard key={worker.id} worker={worker} />
                ))}
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { WorkerCard } from '@/components/worker-card';
import type { Worker } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Loader2, MapPin, Phone, Briefcase, Eye, Building, Star, Paintbrush, Wrench, Sprout, Hammer, Zap, AirVent, Sparkles, Car } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { aiSearch, type AiSearchInput, type AiSearchOutput } from '@/ai/flows/ai-search';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/i18n';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const skillCategories = [
    'Mason (Raj Mistri)', 'Labourer (Mazdoor)', 'Plumber (Nalband)', 'Electrician (Bijli Mistri)', 'Carpenter (Barhai)', 'Painter (Rang Saz)', 'Welder', 'Fabricator', 'POP/False Ceiling Expert', 'Tile & Marble Fitter', 'Mobile Repair Technician', 'AC Repair & Service', 'Washing Machine Repair', 'Refrigerator Repair', 'TV & Set-Top Box Technician', 'Computer/Laptop Repair', 'Tailor (Darzi)', 'Cobbler (Mochi)', 'Beautician/Mehendi Artist', 'Barber (Nai)', 'Cook (Rasoiya/Bawarchi)', 'Househelp (Kaamwali/Bai)', 'Driver (Chalak)', 'Pest Control Service', 'Event Staff/Waiters', 'Tent House Operator', 'Caterer', 'Packers & Movers', 'Truck/Loader Driver', 'Bike/Mobile Mechanic', 'Home Deep Cleaning', 'Car/Bike Cleaning', 'Water Tank Cleaner', 'Sewage & Drain Cleaning', 'Gardening & Lawn Maintenance (Mali)', 'CNC Machine Operator', 'Lathe Machine Operator', 'Mechanic (Mistri)', 'Equipment Repair'
];

const HowItWorksStep = ({ num, title, description, className }: { num: number, title: string, description: string, className?: string }) => (
    <div className="[perspective:1000px]">
        <Card className={cn("text-center p-6 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 hover:[transform:rotateX(10deg)] h-full", className)}>
            <CardContent className="p-0">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 text-foreground text-xl font-bold">
                    {num}
                </div>
                <h3 className="text-xl font-bold mb-2 font-headline">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </div>
);

const Footer = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
    <footer className="bg-slate-800 text-slate-300 pt-12 pb-4">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                    <h4 className="font-headline text-xl text-white mb-3">Apna Kam</h4>
                    <p className="text-sm">
                        {t.footerDescription}
                    </p>
                </div>
                <div>
                    <h5 className="font-headline text-lg text-white mb-3">{t.links}</h5>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/" className="hover:text-primary transition-colors">{t.home}</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">{t.aboutUs}</Link></li>
                         <li><Link href="/blog" className="hover:text-primary transition-colors">{t.blog}</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">{t.contact}</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-headline text-lg text-white mb-3">{t.services}</h5>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-primary transition-colors">{t.plumbing}</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">{t.electrician}</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">{t.carpenter}</Link></li>
                    </ul>
                </div>
                 <div>
                    <h5 className="font-headline text-lg text-white mb-3">{t.contactUs}</h5>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><MapPin size={16}/> New Delhi, India</li>
                        <li className="flex items-center gap-2"><Phone size={16}/> +91 98765 43210</li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 border-t border-slate-700 pt-4 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Apna Kam. {t.allRightsReserved}</p>
            </div>
        </div>
    </footer>
)}

const fetchAllWorkers = async (): Promise<Worker[]> => {
    const q = query(collection(db, "users"), where("isWorker", "==", true), where("isApproved", "==", true));
    const querySnapshot = await getDocs(q);
    const workersList: Worker[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        workersList.push({
            id: doc.id,
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
            isFavorite: false,
            avatar: data.avatar || "https://placehold.co/100x100.png",
            portfolio: data.portfolio || [{url: "https://placehold.co/600x400.png", hint: "worker professional", fullPath: ''}],
        });
    });
    return workersList;
};


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pincode, setPincode] = useState('');
  const [searchResults, setSearchResults] = useState<Worker[]>([]);
  const [isSearching, setIsSearching] = useState(true); // Start with true to show initial skeleton
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    // Fetch initial set of all approved workers on page load
    const fetchInitialWorkers = async () => {
        setIsSearching(true);
        try {
            const workersList = await fetchAllWorkers();
            setSearchResults(workersList);
        } catch (error) {
            console.error("Error fetching workers:", error);
            toast({
                title: "Failed to load workers",
                description: "Could not fetch worker data from the database.",
                variant: "destructive"
            });
        } finally {
            setIsSearching(false);
        }
    };
    fetchInitialWorkers();
  }, [toast]);


  const handleSearch = async (searchOptions?: { category: string }) => {
    setIsSearching(true);
    setSearchResults([]);

    try {
        if (pincode && !/^\d{6}$/.test(pincode)) {
            toast({
                title: "Invalid Pincode",
                description: "Please enter a valid 6-digit pincode.",
                variant: "destructive",
            });
            setIsSearching(false);
            return;
        }

        const activeCategories = searchOptions?.category
            ? [searchOptions.category]
            : Object.keys(selectedCategories).filter(k => selectedCategories[k]);
        
        const effectiveQuery = searchOptions?.category ? '' : searchQuery;

        // If all search fields are empty, fetch all workers instead of calling AI
        if (!effectiveQuery && !pincode && activeCategories.length === 0) {
            const allWorkers = await fetchAllWorkers();
            setSearchResults(allWorkers);
            return;
        }

        const input: AiSearchInput = {
            query: effectiveQuery,
            pincode: pincode || undefined,
            skillCategories: activeCategories.length > 0 ? activeCategories : undefined,
        };

        const response = await aiSearch(input);
        setSearchResults(response);

    } catch (error) {
        console.error("Search failed:", error);
        toast({
            title: "Search Failed",
            description: "An error occurred during the search. Please try again.",
            variant: "destructive",
        });
        setSearchResults([]);
    } finally {
        setIsSearching(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    // Reset other filters
    setSearchQuery('');
    setPincode('');
    setSelectedCategories({ [category]: true });
    
    // Pass the category directly to the search function
    handleSearch({ category });

    // Scroll to the results section
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => ({...prev, [category]: !prev[category]}));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }
  
  const popularCategories = [
    { name: t.plumbing, dbCategory: 'Plumber (Nalband)', icon: Wrench, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-300' },
    { name: t.electrician, dbCategory: 'Electrician (Bijli Mistri)', icon: Zap, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-300' },
    { name: t.carpenter, dbCategory: 'Carpenter (Barhai)', icon: Hammer, bgColor: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-300' },
    { name: t.painter, dbCategory: 'Painter (Rang Saz)', icon: Paintbrush, bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-300' },
    { name: t.acService, dbCategory: 'AC Repair & Service', icon: AirVent, bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600 dark:text-cyan-300' },
    { name: t.homeCleaning, dbCategory: 'Home Deep Cleaning', icon: Sparkles, bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-300' },
    { name: t.carWasher, dbCategory: 'Car/Bike Cleaning', icon: Car, bgColor: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-300' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 sm:py-28 text-white">
            <div className="absolute inset-0">
                <Image 
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=400&fit=crop"
                    alt="Hero background"
                    fill
                    className="object-cover"
                    data-ai-hint="construction workers"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                 <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-headline">
                        {t.heroTitle}
                    </h1>
                    <p className="mt-6 text-lg text-gray-200">
                        {t.heroSubtitle}
                    </p>
                </div>

                 <div className="mt-10 max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                            type="search"
                            placeholder={t.searchPlaceholder}
                            className="pl-10 h-12 text-base text-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="relative sm:max-w-40 flex-grow">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                            type="text"
                            placeholder={t.pincodePlaceholder}
                            className="pl-10 h-12 text-base text-foreground"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            onKeyDown={handleKeyDown}
                            maxLength={6}
                            />
                        </div>
                        <div className='flex gap-2'>
                            <Button size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90 flex-1 sm:flex-initial" onClick={() => handleSearch()} disabled={isSearching}>
                                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                                <span className="hidden sm:inline ml-2">{t.search}</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="lg" className="h-12 text-foreground">
                                    <SlidersHorizontal className="h-5 w-5" />
                                    <span className="hidden sm:inline ml-2">{t.filters}</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
                                <DropdownMenuLabel>{t.skillCategories}</DropdownMenuLabel>
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
                </div>
            </div>
        </section>

        <section id="categories" className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl font-headline mb-12">
              {t.popularCategories}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
              {popularCategories.map((cat) => (
                <div key={cat.name} className="group cursor-pointer" onClick={() => handleCategoryClick(cat.dbCategory)}>
                  <Card className={cn("text-center p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 h-full border-0", cat.bgColor)}>
                    <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center mx-auto mb-4 transition-colors">
                        <cat.icon className={cn("h-8 w-8 transition-transform group-hover:scale-110", cat.iconColor)} />
                    </div>
                    <h3 className={cn("font-semibold text-lg transition-colors", cat.iconColor.replace('text', 'text'))}>{cat.name}</h3>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="bg-slate-50 dark:bg-slate-900 py-16">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl font-headline mb-12">
                {t.featuredWorkers}
              </h2>
              {isSearching ? (
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
              ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {searchResults.slice(0, 8).map((worker) => (
                      <WorkerCard key={worker.id} worker={worker} />
                  ))}
                  </div>
              ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                  <h2 className="text-xl font-semibold">{t.noWorkersFound}</h2>
                  <p className="text-muted-foreground mt-2">{t.tryAdjustingSearch}</p>
              </div>
              )}
          </div>
        </section>

        <section className="py-16">
            <div className="container mx-auto px-4">
                 <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
                        {t.howItWorksTitle}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t.howItWorksSubtitle}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                   <HowItWorksStep className="bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200" num={1} title={t.howItWorksStep1Title} description={t.howItWorksStep1Desc} />
                   <HowItWorksStep className="bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-200" num={2} title={t.howItWorksStep2Title} description={t.howItWorksStep2Desc} />
                   <HowItWorksStep className="bg-orange-50 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200" num={3} title={t.howItWorksStep3Title} description={t.howItWorksStep3Desc} />
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

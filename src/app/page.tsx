'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { WorkerCard } from '@/components/worker-card';
import type { Worker } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Loader2, MapPin, Phone, Briefcase, Eye, Building, Star, PaintBrush, Wrench, Sprout } from 'lucide-react';
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

const mockWorkers: Worker[] = [
    { id: '1', name: 'Ramesh Kumar', category: 'Electrician', location: 'Mumbai', pincode: '400001', rating: 4.5, reviews: 120, price: 500, priceType: 'daily', skills: ['Wiring', 'Fixture Installation', 'Repairs'], description: 'Experienced electrician with over 10 years in the field. Reliable and efficient.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "electrical work"}] },
    { id: '2', name: 'Sita Sharma', category: 'Plumber', location: 'Delhi', pincode: '110001', rating: 4.8, reviews: 85, price: 700, priceType: 'job', skills: ['Leak Repair', 'Pipe Fitting', 'Drain Cleaning'], description: 'Certified plumber providing top-notch services for residential and commercial properties.', isFavorite: true, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "plumbing work"}]},
    { id: '3', name: 'Anil Yadav', category: 'Carpenter', location: 'Bangalore', pincode: '560001', rating: 4.2, reviews: 95, price: 600, priceType: 'daily', skills: ['Furniture Making', 'Polishing', 'Custom Designs'], description: 'Skilled carpenter creating custom furniture and providing repair services.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "woodwork"}] },
    { id: '4', name: 'Priya Singh', category: 'Painter', location: 'Kolkata', pincode: '700001', rating: 4.9, reviews: 200, price: 450, priceType: 'daily', skills: ['Interior Painting', 'Exterior Painting', 'Wall Texturing'], description: 'Professional painter who brings life to your walls with a perfect finish.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "painting walls"}]},
    { id: '5', name: 'Vikram Rathod', category: 'AC Technician', location: 'Chennai', pincode: '600001', rating: 4.7, reviews: 150, price: 800, priceType: 'job', skills: ['AC Installation', 'Repair & Service', 'Gas Refilling'], description: 'Expert AC technician ensuring your comfort during the hot summers.', isFavorite: true, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "air conditioner"}]},
    { id: '6', name: 'Deepa Verma', category: 'Home Cleaning', location: 'Pune', pincode: '411001', rating: 4.6, reviews: 180, price: 1000, priceType: 'job', skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning'], description: 'Thorough and diligent cleaning services for a sparkling clean home.', isFavorite: false, avatar: "https://placehold.co/100x100.png", portfolio: [{url: "https://placehold.co/600x400.png", hint: "clean home"}]},
];

const mapAiResultsToWorkers = (results: AiSearchOutput['results']): Worker[] => {
    // This is a mock mapping. In a real app, you'd have a database to fetch full worker details.
    return results.map((res, i) => {
        const mockBase = mockWorkers[i % mockWorkers.length];
        return {
            id: res.workerId,
            name: res.name,
            category: res.category,
            location: res.location,
            pincode: res.pincode,
            description: res.description,
            skills: res.skills,
            rating: mockBase.rating,
            reviews: mockBase.reviews,
            price: mockBase.price,
            priceType: mockBase.priceType,
            isFavorite: mockBase.isFavorite,
            avatar: mockBase.avatar,
            portfolio: mockBase.portfolio,
        };
    });
};

const skillCategories = [
    'Mason (Raj Mistri)', 'Labourer (Mazdoor)', 'Plumber (Nalband)', 'Electrician (Bijli Mistri)', 'Carpenter (Barhai)', 'Painter (Rang Saz)', 'Welder', 'Fabricator', 'POP/False Ceiling Expert', 'Tile & Marble Fitter', 'Mobile Repair Technician', 'AC Repair & Service', 'Washing Machine Repair', 'Refrigerator Repair', 'TV & Set-Top Box Technician', 'Computer/Laptop Repair', 'Tailor (Darzi)', 'Cobbler (Mochi)', 'Beautician/Mehendi Artist', 'Barber (Nai)', 'Cook (Rasoiya/Bawarchi)', 'Househelp (Kaamwali/Bai)', 'Driver (Chalak)', 'Pest Control Service', 'Event Staff/Waiters', 'Tent House Operator', 'Caterer', 'Packers & Movers', 'Truck/Loader Driver', 'Bike/Mobile Mechanic', 'Home Deep Cleaning', 'Car/Bike Cleaning', 'Water Tank Cleaner', 'Sewage & Drain Cleaning', 'Gardening & Lawn Maintenance (Mali)', 'CNC Machine Operator', 'Lathe Machine Operator', 'Mechanic (Mistri)', 'Equipment Repair'
];

const HowItWorksStep = ({ num, title, description }: { num: number, title: string, description: string }) => (
    <Card className="text-center p-6 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 [perspective:1000px] hover:[transform:rotateX(4deg)]">
        <CardContent className="p-0">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                {num}
            </div>
            <h3 className="text-xl font-bold mb-2 font-headline">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
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
                        <li><Link href="#" className="hover:text-primary transition-colors">{t.home}</Link></li>
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


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pincode, setPincode] = useState('');
  const [searchResults, setSearchResults] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      if (pincode && !/^\d{6}$/.test(pincode)) {
          toast({
              title: "Invalid Pincode",
              description: "Please enter a valid 6-digit pincode.",
              variant: "destructive",
          });
          setIsLoading(false);
          return;
      }

      const input: AiSearchInput = {
        query: searchQuery || 'any worker',
        pincode: pincode,
        skillCategories: Object.keys(selectedCategories).filter(k => selectedCategories[k]),
      };

      const response: AiSearchOutput = await aiSearch(input);

      if (response.results.length > 0) {
          const workers = mapAiResultsToWorkers(response.results);
          setSearchResults(workers);
      } else {
          const pincodeFiltered = pincode ? mockWorkers.filter(w => w.pincode === pincode) : mockWorkers;
          setSearchResults(pincodeFiltered);
      }

    } catch (error) {
      console.error("AI Search failed:", error);
      toast({
          title: "Search Failed",
          description: "An error occurred during the search. Please try again.",
          variant: "destructive",
      });
      setSearchResults(mockWorkers);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearchResults(mockWorkers);
    setIsLoading(false);
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => ({...prev, [category]: !prev[category]}));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 sm:py-28 text-white">
            <div className="absolute inset-0">
                <Image 
                    src="https://images.unsplash.com/photo-1618005199693-5b2a305b4a9a?w=1200&q=80"
                    alt="Hero background"
                    fill
                    className="object-cover"
                    data-ai-hint="construction workers"
                />
                <div className="absolute inset-0 bg-black/50"></div>
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
                            <Button size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90 flex-1 sm:flex-initial" onClick={handleSearch} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
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

        <section id="categories" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl font-headline mb-12">
              {t.popularCategories}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: t.plumbing, icon: Wrench, href:"#" },
                { name: t.electrician, icon: Wrench, href:"#" },
                { name: t.carpenter, icon: Wrench, href:"#" },
                { name: t.painter, icon: PaintBrush, href:"#" },
                { name: 'AC Service', icon: Wrench, href:"#" },
                { name: t.homeCleaning, icon: Sprout, href:"#" },
              ].map((cat) => (
                <Link key={cat.name} href={cat.href} className="group">
                  <Card className="text-center p-4 hover:shadow-lg transition-shadow hover:-translate-y-1">
                    <cat.icon className="h-10 w-10 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">{cat.name}</h3>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900 py-16">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl font-headline mb-12">
                {t.featuredWorkers}
              </h2>
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
              ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {searchResults.slice(0, 4).map((worker) => (
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
                   <HowItWorksStep num={1} title={t.howItWorksStep1Title} description={t.howItWorksStep1Desc} />
                   <HowItWorksStep num={2} title={t.howItWorksStep2Title} description={t.howItWorksStep2Desc} />
                   <HowItWorksStep num={3} title={t.howItWorksStep3Title} description={t.howItWorksStep3Desc} />
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

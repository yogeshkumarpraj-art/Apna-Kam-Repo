
'use client'

import { useState, useEffect } from 'react';
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';
import { suggestSkills } from '@/ai/flows/skill-suggestion';
import { Loader2, Plus, Sparkles, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Worker } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';


const skillCategories = [
    'Mason (Raj Mistri)', 'Labourer (Mazdoor)', 'Plumber (Nalband)', 'Electrician (Bijli Mistri)', 'Carpenter (Barhai)', 'Painter (Rang Saz)', 'Welder', 'Fabricator', 'POP/False Ceiling Expert', 'Tile & Marble Fitter', 'Mobile Repair Technician', 'AC Repair & Service', 'Washing Machine Repair', 'Refrigerator Repair', 'TV & Set-Top Box Technician', 'Computer/Laptop Repair', 'Tailor (Darzi)', 'Cobbler (Mochi)', 'Beautician/Mehendi Artist', 'Barber (Nai)', 'Cook (Rasoiya/Bawarchi)', 'Househelp (Kaamwali/Bai)', 'Driver (Chalak)', 'Pest Control Service', 'Event Staff/Waiters', 'Tent House Operator', 'Caterer', 'Packers & Movers', 'Truck/Loader Driver', 'Bike/Mobile Mechanic', 'Home Deep Cleaning', 'Car/Bike Cleaning', 'Water Tank Cleaner', 'Sewage & Drain Cleaning', 'Gardening & Lawn Maintenance (Mali)', 'CNC Machine Operator', 'Lathe Machine Operator', 'Mechanic (Mistri)', 'Equipment Repair'
];

export default function ProfileEditPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [pincode, setPincode] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [priceType, setPriceType] = useState<Worker['priceType']>('job');
    const [workerDetails, setWorkerDetails] = useState('');
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
    const [currentSkills, setCurrentSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (user) {
            setPhone(user.phoneNumber || '');
            
            const fetchProfile = async () => {
                setIsFetching(true);
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || user.displayName || '');
                    setEmail(data.email || user.email || '');
                    setLocation(data.location || '');
                    setPincode(data.pincode || '');
                    setCategory(data.category || '');
                    setPrice(data.price || '');
                    setPriceType(data.priceType || 'job');
                    setCurrentSkills(data.skills || []);
                    setWorkerDetails(data.description || '');
                } else {
                    // Pre-fill from auth if no profile exists
                    setName(user.displayName || '');
                    setEmail(user.email || '');
                }
                setIsFetching(false);
            };

            fetchProfile();
        }
    }, [user]);


    const handleSkillSuggestion = async () => {
        if (!workerDetails) return;
        setIsLoading(true);
        try {
            const result = await suggestSkills({ workerDetails });
            // Prevent duplicates from being suggested
            const newSuggestions = result.suggestedSkills.filter(s => !currentSkills.includes(s));
            setSuggestedSkills(newSuggestions);
        } catch (error) {
            console.error("Skill suggestion failed:", error);
            toast({ title: "AI Error", description: "Could not suggest skills.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const addSkill = (skill: string) => {
        if (skill && !currentSkills.includes(skill)) {
            setCurrentSkills([...currentSkills, skill]);
            setSuggestedSkills(suggestedSkills.filter(s => s !== skill));
        }
    };
    
    const handleAddCustomSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSkill) {
            addSkill(newSkill.trim());
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setCurrentSkills(currentSkills.filter(skill => skill !== skillToRemove));
    };

    const handleSaveChanges = async () => {
        if (!user) {
            toast({ title: "Not logged in", description: "You must be logged in to save.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                name,
                email,
                location,
                pincode,
                category,
                price: Number(price) || 0,
                priceType,
                skills: currentSkills,
                description: workerDetails,
                uid: user.uid,
                phone: user.phoneNumber,
                // Add a flag to identify if user is a worker
                isWorker: !!category 
            }, { merge: true });

            toast({
                title: 'Profile Updated',
                description: 'Your changes have been successfully saved.',
            });
            router.push('/profile');
        } catch (error) {
            console.error("Error saving profile: ", error);
            toast({
                title: 'Save Failed',
                description: 'Could not save your profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isFetching || !user) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
                    {isFetching ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>Please log in to edit your profile.</p>}
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-1">
                <Card className="max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Edit Profile</CardTitle>
                        <CardDescription>Update your personal and professional information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" type="tel" value={phone} disabled />
                                </div>
                                <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Delhi, India"/></div>
                                <div className="space-y-2"><Label htmlFor="pincode">Pincode</Label><Input id="pincode" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 110001"/></div>
                            </div>
                        </div>

                        <Separator/>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Professional Details (for Workers)</h3>
                             <div className="space-y-2">
                                <Label htmlFor="category">Skill Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select your primary skill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">I am a customer (not a worker)</SelectItem>
                                        {skillCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Base Price (₹)</Label>
                                    <Input id="price" type="number" placeholder="e.g., 500" value={price} onChange={e => setPrice(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price Type</Label>
                                    <RadioGroup
                                        value={priceType}
                                        onValueChange={(value: Worker['priceType']) => setPriceType(value)}
                                        className="flex items-center space-x-4 pt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="job" id="r-job" />
                                            <Label htmlFor="r-job">Per Job</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="daily" id="r-daily" />
                                            <Label htmlFor="r-daily">Per Day</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="sqft" id="r-sqft" />
                                            <Label htmlFor="r-sqft">Per Sq.Ft.</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Describe your experience & skills</Label>
                                <Textarea id="description" placeholder="e.g., I am a certified plumber with 5 years of experience in residential and commercial projects..." value={workerDetails} onChange={(e) => setWorkerDetails(e.target.value)} rows={4}/>
                            </div>
                            <Button onClick={handleSkillSuggestion} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Suggest Skills with AI
                            </Button>
                            {suggestedSkills.length > 0 && (
                                <div className='space-y-2 pt-2'>
                                    <h4 className='font-semibold text-sm'>AI Suggestions:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedSkills.map(skill => <Button key={skill} variant="outline" size="sm" onClick={() => addSkill(skill)}><Plus className="mr-1.5 h-4 w-4" />{skill}</Button>)}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <Separator/>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Your Skills</h3>
                            <div className="p-4 border rounded-lg min-h-[80px]">
                                {currentSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {currentSkills.map(skill => (
                                            <Badge key={skill} className="text-base py-1 pl-3 pr-2">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="ml-2 rounded-full hover:bg-black/20 p-0.5">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Add skills using the field below or with AI suggestions.</p>
                                )}
                            </div>
                             <form onSubmit={handleAddCustomSkill} className="flex items-center gap-2">
                                <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a custom skill"/>
                                <Button type="submit">Add Skill</Button>
                            </form>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => router.push('/profile')}>Cancel</Button>
                            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSaveChanges} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

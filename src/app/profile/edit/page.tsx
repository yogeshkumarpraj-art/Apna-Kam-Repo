
'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';
import { suggestSkills } from '@/ai/flows/skill-suggestion';
import { Loader2, Plus, Sparkles, X, Trash2, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Worker } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc, updateDoc, arrayRemove } from "firebase/firestore"; 
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';


const skillCategories = [
    'Mason (Raj Mistri)', 'Labourer (Mazdoor)', 'Plumber (Nalband)', 'Electrician (Bijli Mistri)', 'Carpenter (Barhai)', 'Painter (Rang Saz)', 'Welder', 'Fabricator', 'POP/False Ceiling Expert', 'Tile & Marble Fitter', 'Mobile Repair Technician', 'AC Repair & Service', 'Washing Machine Repair', 'Refrigerator Repair', 'TV & Set-Top Box Technician', 'Computer/Laptop Repair', 'Tailor (Darzi)', 'Cobbler (Mochi)', 'Beautician/Mehendi Artist', 'Barber (Nai)', 'Cook (Rasoiya/Bawarchi)', 'Househelp (Kaamwali/Bai)', 'Driver (Chalak)', 'Pest Control Service', 'Event Staff/Waiters', 'Tent House Operator', 'Caterer', 'Packers & Movers', 'Truck/Loader Driver', 'Bike/Mobile Mechanic', 'Home Deep Cleaning', 'Car/Bike Cleaning', 'Water Tank Cleaner', 'Sewage & Drain Cleaning', 'Gardening & Lawn Maintenance (Mali)', 'CNC Machine Operator', 'Lathe Machine Operator', 'Mechanic (Mistri)', 'Equipment Repair'
];

const MAX_IMAGE_SIZE_MB = 5;

export default function ProfileEditPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
    const [portfolio, setPortfolio] = useState<Worker['portfolio']>([]);

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
                    setCategory(data.category || (data.isWorker ? '' : 'customer'));
                    setPrice(data.price || '');
                    setPriceType(data.priceType || 'job');
                    setCurrentSkills(data.skills || []);
                    setWorkerDetails(data.description || '');
                    setPortfolio(data.portfolio || []);
                } else {
                    // Pre-fill from auth if no profile exists
                    setName(user.displayName || '');
                    setEmail(user.email || '');
                    setCategory('customer');
                }
                setIsFetching(false);
            };

            fetchProfile();
        } else {
            setIsFetching(false);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                toast({
                    title: "Image too large",
                    description: `Please select an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`,
                    variant: "destructive"
                });
                return;
            }
            handleImageUpload(file);
        }
    };

    const handleImageUpload = (file: File) => {
        if (!user) return;
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user.uid}_${new Date().getTime()}.${fileExtension}`;
        const storagePath = `portfolio/${user.uid}/${fileName}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({ title: "Upload Failed", description: "Could not upload image.", variant: "destructive" });
                setUploadProgress(null);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const newImage = { url: downloadURL, hint: "worker project", fullPath: storagePath };
                    setPortfolio(prev => [...prev, newImage]);
                    setUploadProgress(null);
                    toast({ title: "Image Uploaded", description: "Your image is ready. Don't forget to save changes." });
                });
            }
        );
    };

    const handleImageDelete = async (imageToDelete: Worker['portfolio'][0]) => {
        if (!user) return;
        
        // Optimistically update the UI
        setPortfolio(prev => prev.filter(img => img.url !== imageToDelete.url));

        const imageRef = ref(storage, imageToDelete.fullPath);
        
        try {
            // Delete from Storage
            await deleteObject(imageRef);

            // Delete from Firestore by updating the user doc
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                portfolio: arrayRemove(imageToDelete)
            });

            toast({ title: "Image Deleted", description: "Your portfolio has been updated." });
        } catch (error) {
            console.error("Error deleting image:", error);
            // Revert UI if deletion fails
            setPortfolio(prev => [...prev, imageToDelete]);
            toast({ title: "Delete Failed", description: "Could not delete image.", variant: "destructive" });
        }
    };

    const handleSaveChanges = async () => {
        if (!user) {
            toast({ title: "Not logged in", description: "You must be logged in to save.", variant: "destructive" });
            return;
        }
        setIsSaving(true);

        const isWorker = category !== 'customer' && !!category;

        try {
            const userRef = doc(db, "users", user.uid);
            const dataToSave: any = {
                name,
                email,
                location,
                pincode,
                uid: user.uid,
                phone: user.phoneNumber,
                isWorker: isWorker,
                category: isWorker ? category : '',
                price: isWorker ? Number(price) || 0 : 0,
                priceType: isWorker ? priceType : 'job',
                skills: isWorker ? currentSkills : [],
                description: isWorker ? workerDetails : '',
                portfolio: isWorker ? portfolio : [],
            };

            await setDoc(userRef, dataToSave, { merge: true });

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
                            <h3 className="text-lg font-semibold">I am a...</h3>
                             <div className="space-y-2">
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">Customer (Looking for workers)</SelectItem>
                                        {skillCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {category !== 'customer' && !!category && (
                                <div className="space-y-8 pt-4 border-t mt-8">
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

                                    <div className="space-y-4">
                                        <h4 className="text-md font-semibold">Portfolio Images</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {portfolio.map((image) => (
                                                <div key={image.url} className="relative group">
                                                    <Image src={image.url} alt="Portfolio image" width={200} height={200} className="rounded-md object-cover aspect-square" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button variant="destructive" size="icon" onClick={() => handleImageDelete(image)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {uploadProgress !== null ? (
                                                <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4">
                                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                                                    <Progress value={uploadProgress} className="w-full h-2" />
                                                    <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                                                </div>
                                            ) : (
                                                <Label htmlFor="file-upload" className="border-2 border-dashed rounded-md cursor-pointer flex flex-col items-center justify-center hover:bg-accent/50 transition-colors p-4 aspect-square">
                                                    <Upload className="h-8 w-8 text-muted-foreground"/>
                                                    <span className="text-sm text-muted-foreground mt-2 text-center">Upload Image</span>
                                                </Label>
                                            )}
                                            <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={uploadProgress !== null}/>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Max 5MB per image. PNG, JPG, WebP.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Describe your experience & skills</Label>
                                        <Textarea id="description" placeholder="e.g., I am a certified plumber with 5 years of experience in residential and commercial projects..." value={workerDetails} onChange={(e) => setWorkerDetails(e.target.value)} rows={4}/>
                                    </div>
                                    <Button onClick={handleSkillSuggestion} disabled={isLoading || !workerDetails}>
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
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => router.push('/profile')}>Cancel</Button>
                            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSaveChanges} disabled={isSaving || uploadProgress !== null}>
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

    
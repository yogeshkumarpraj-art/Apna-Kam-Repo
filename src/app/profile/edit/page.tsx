'use client'

import { useState } from 'react';
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

const skillCategories = [
    'Mason (Raj Mistri)', 'Labourer (Mazdoor)', 'Plumber (Nalband)', 'Electrician (Bijli Mistri)', 'Carpenter (Barhai)', 'Painter (Rang Saz)', 'Welder', 'Fabricator', 'POP/False Ceiling Expert', 'Tile & Marble Fitter', 'Mobile Repair Technician', 'AC Repair & Service', 'Washing Machine Repair', 'Refrigerator Repair', 'TV & Set-Top Box Technician', 'Computer/Laptop Repair', 'Tailor (Darzi)', 'Cobbler (Mochi)', 'Beautician/Mehendi Artist', 'Barber (Nai)', 'Cook (Rasoiya/Bawarchi)', 'Househelp (Kaamwali/Bai)', 'Driver (Chalak)', 'Pest Control Service', 'Event Staff/Waiters', 'Tent House Operator', 'Caterer', 'Packers & Movers', 'Truck/Loader Driver', 'Bike/Mobile Mechanic', 'Home Deep Cleaning', 'Car/Bike Cleaning', 'Water Tank Cleaner', 'Sewage & Drain Cleaning', 'Gardening & Lawn Maintenance (Mali)', 'CNC Machine Operator', 'Lathe Machine Operator', 'Mechanic (Mistri)', 'Equipment Repair'
];

export default function ProfileEditPage() {
    const [workerDetails, setWorkerDetails] = useState('');
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSkills, setCurrentSkills] = useState(['Leak Repair', 'Pipe Fitting']);
    const [newSkill, setNewSkill] = useState('');
    const [priceType, setPriceType] = useState<Worker['priceType']>('job');


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
            // Mock response on failure for demo
            setSuggestedSkills(['Mock Skill 1', 'Mock Skill 2', 'Mock Skill 3']);
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
                                <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" defaultValue="Test User" /></div>
                                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" defaultValue="user@example.com" /></div>
                                <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" defaultValue="+91 9999988888" /></div>
                                <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" defaultValue="Delhi, India" /></div>
                                <div className="space-y-2"><Label htmlFor="pincode">Pincode</Label><Input id="pincode" defaultValue="110001" /></div>
                            </div>
                        </div>

                        <Separator/>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Professional Details (for Workers)</h3>
                             <div className="space-y-2">
                                <Label htmlFor="category">Skill Category</Label>
                                <Select defaultValue="Plumber (Nalband)">
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select your primary skill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {skillCategories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Base Price (₹)</Label>
                                    <Input id="price" type="number" placeholder="e.g., 500" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price Type</Label>
                                    <RadioGroup
                                        defaultValue={priceType}
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
                            <Button variant="outline">Cancel</Button>
                            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

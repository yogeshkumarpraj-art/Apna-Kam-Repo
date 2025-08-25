import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Pencil, Phone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const user = {
    name: 'Test User',
    email: 'user@example.com',
    phone: '+91 9999988888',
    location: 'Delhi, India',
    avatar: 'https://placehold.co/100x100.png',
    isWorker: true,
    workerProfile: {
        category: 'Plumber',
        skills: ['Leak Repair', 'Pipe Fitting', 'Drain Cleaning'],
        description: 'Certified plumber providing top-notch services for residential and commercial properties.'
    }
}

export default function ProfilePage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-1">
                <Card className="max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person"/>
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
                                    <CardDescription className="text-base mt-1">
                                        {user.isWorker ? user.workerProfile.category : 'Customer'}
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/profile/edit">
                                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-primary" /> <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-primary" /> <span>{user.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 col-span-full">
                                    <MapPin className="w-5 h-5 text-primary" /> <span>{user.location}</span>
                                </div>
                            </div>
                        </div>

                        {user.isWorker && user.workerProfile && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
                                    <p className="text-muted-foreground mb-4">{user.workerProfile.description}</p>
                                    <h4 className="font-semibold mb-3">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.workerProfile.skills.map(skill => (
                                            <Badge key={skill} variant="default">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

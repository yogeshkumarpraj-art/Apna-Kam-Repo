
'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Pencil, Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    category?: string;
    skills?: string[];
    description?: string;
    location?: string;
    pincode?: string;
    isWorker?: boolean;
    rating?: number;
    reviewCount?: number;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                setLoading(true);
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserProfile({
                        name: data.name || user.displayName || "User",
                        email: data.email || user.email || 'No email provided',
                        phone: user.phoneNumber || 'No phone number',
                        avatar: user.photoURL || 'https://placehold.co/100x100.png',
                        category: data.category,
                        skills: data.skills,
                        description: data.description,
                        location: data.location,
                        pincode: data.pincode,
                        isWorker: data.isWorker,
                        rating: data.rating,
                        reviewCount: data.reviewCount,
                    });
                } else {
                     // If no profile in DB, create a basic one from Auth
                    setUserProfile({
                        name: user.displayName || "User",
                        email: user.email || 'No email provided',
                        phone: user.phoneNumber || 'No phone number',
                        avatar: user.photoURL || 'https://placehold.co/100x100.png',
                    });
                }
                setLoading(false);
            };

            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return (
             <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </main>
            </div>
        )
    }

    if (!user || !userProfile) {
        return (
             <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
                    <p>Please <Link href="/login" className="text-primary hover:underline">log in</Link> to view your profile.</p>
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
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} data-ai-hint="person"/>
                                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-3xl font-headline">{userProfile.name}</CardTitle>
                                    <CardDescription className="text-base mt-1">
                                        {userProfile.isWorker ? userProfile.category : 'Customer'}
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
                                    <Mail className="w-5 h-5 text-primary" /> <span>{userProfile.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-primary" /> <span>{userProfile.phone}</span>
                                </div>
                                {userProfile.location && (
                                <div className="flex items-center gap-3 col-span-full">
                                    <MapPin className="w-5 h-5 text-primary" /> <span>{userProfile.location}, {userProfile.pincode}</span>
                                </div>
                                )}
                            </div>
                        </div>

                        {userProfile.isWorker && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
                                    <p className="text-muted-foreground mb-4">{userProfile.description}</p>
                                    <h4 className="font-semibold mb-3">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {userProfile.skills?.map(skill => (
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

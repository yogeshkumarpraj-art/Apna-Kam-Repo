
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Initialize auth only on the client side
const auth = getAuth(app);

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.58l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        <path d="M1 1h22v22H1z" fill="none" />
    </svg>
);


export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        // @ts-ignore
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'sitekey': process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
            'callback': (response: any) => {
                // reCAPTCHA solved, you can proceed with phone sign-in
            }
        });
    }
}, []);


  const handleSendOtp = async () => {
    if (!/^\+91\d{10}$/.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit number with country code +91.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // @ts-ignore
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `An OTP has been sent to ${phoneNumber}.`,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Failed to Send OTP",
        description: "Please check the phone number or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      });
      router.push('/');
    } catch (error) {
      console.error("Error verifying OTP:", error);
       toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore, if not, create a new document
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // New user, create a profile
        await setDoc(userDocRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            avatar: user.photoURL,
            phone: user.phoneNumber,
            isWorker: false,
            isAdmin: false,
            createdAt: new Date(),
        });
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.displayName}!`,
      });
      router.push('/');

    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Google Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center text-primary">
            <Sprout className="h-12 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground font-headline">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Welcome to Apna Kam
          </p>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Login or Register</CardTitle>
            <CardDescription>
              {otpSent 
                ? "Enter the OTP sent to your phone."
                : "Enter your phone number or use a social login."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!otpSent ? (
                <>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                  {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  Sign in with Google
                </Button>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        OR
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+911234567890" 
                    required 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    required 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
              )}
              
              <Button onClick={otpSent ? handleVerifyOtp : handleSendOtp} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {otpSent ? 'Verify OTP' : 'Send OTP'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

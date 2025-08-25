
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Initialize auth only on the client side
const auth = getAuth(app);

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This will run only once on the client
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
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
                : "Enter your phone number to receive a One-Time Password (OTP)."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!otpSent ? (
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
              
              <Button onClick={otpSent ? handleVerifyOtp : handleSendOtp} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
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


"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuardianStore } from '@/hooks/use-guardian-store';
import { GuardianSetupForm } from '@/components/auth/guardian-setup-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function SetupPage() {
  const router = useRouter();
  const { guardianEmail, isGuardianSet, setGuardianEmail, isInitialized: storeIsInitialized } = useGuardianStore();

  useEffect(() => {
    // Only attempt redirect after the store is initialized and if guardian is set
    if (storeIsInitialized && isGuardianSet && guardianEmail) {
      router.replace('/dashboard');
    }
  }, [storeIsInitialized, isGuardianSet, guardianEmail, router]);

  const handleSetupComplete = (email: string) => {
    setGuardianEmail(email);
    // The useEffect above will handle the redirect once state updates and storeIsInitialized is true
  };

  if (!storeIsInitialized) {
    // Primary loading state: store is reading from localStorage or hasn't run its useEffect yet.
    // This state ensures server and client initial renders match.
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full mx-auto" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
    );
  }

  // Store is initialized. Now check if guardian is set.
  if (isGuardianSet && guardianEmail) {
    // Guardian is set, useEffect should be redirecting. Show a brief message.
    // This state should be very transient.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Cargando panel de control...</p>
      </div>
    );
  }

  // Store is initialized, and guardian is NOT set (isGuardianSet is false or guardianEmail is null).
  // Render the setup form.
  return <GuardianSetupForm onSetupComplete={handleSetupComplete} />;
}

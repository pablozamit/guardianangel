"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuardianStore } from '@/hooks/use-guardian-store';
import { useAppSettingsStore } from '@/hooks/use-app-settings-store';
import { monitoringService } from '@/services/monitoring-service';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { guardianEmail, isGuardianSet, isInitialized: guardianInitialized } = useGuardianStore();
  const { monitoringEnabled, strictModeEnabled, isInitialized: settingsInitialized } = useAppSettingsStore();

  useEffect(() => {
    // Wait for both stores to initialize
    if (!guardianInitialized || !settingsInitialized) return;

    // Redirect to auth if no guardian is set
    if (!isGuardianSet) {
      router.push('/');
      return;
    }

    // Initialize monitoring service
    if (guardianEmail && monitoringEnabled) {
      const config = {
        screenAnalysisInterval: 60000, // 1 minute
        keyboardMonitoringEnabled: true,
        strictMode: strictModeEnabled,
        guardianEmail: guardianEmail
      };

      monitoringService.initialize(config).catch(error => {
        console.error('Failed to initialize monitoring service:', error);
      });

      // Enable stealth mode
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.enableStealthMode().catch(error => {
          console.error('Failed to enable stealth mode:', error);
        });
      }
    }

    // Cleanup on unmount
    return () => {
      monitoringService.stop();
    };
  }, [guardianInitialized, settingsInitialized, isGuardianSet, guardianEmail, monitoringEnabled, strictModeEnabled, router]);

  // Show loading state while stores initialize
  if (!guardianInitialized || !settingsInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Inicializando Ángel Guardián...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
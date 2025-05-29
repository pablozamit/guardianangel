
"use client";

import { useState, useEffect, useCallback } from 'react';

const GUARDIAN_EMAIL_KEY = 'guardian_angel_guardian_email';
const BLOCKED_ATTEMPTS_KEY = 'guardian_angel_blocked_attempts';

type GuardianStore = {
  guardianEmail: string | null;
  isGuardianSet: boolean;
  blockedAttempts: number;
  isInitialized: boolean; // Exposed initialization status
  setGuardianEmail: (email: string) => void;
  incrementBlockedAttempts: () => void;
  clearGuardianData: () => void;
};

export function useGuardianStore(): GuardianStore {
  const [_guardianEmailInternal, setGuardianEmailInternal] = useState<string | null>(null);
  const [_blockedAttemptsInternal, setBlockedAttemptsInternal] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem(GUARDIAN_EMAIL_KEY);
      const storedAttempts = localStorage.getItem(BLOCKED_ATTEMPTS_KEY);
      
      if (storedEmail) {
        setGuardianEmailInternal(storedEmail);
      }
      if (storedAttempts) {
        setBlockedAttemptsInternal(parseInt(storedAttempts, 10));
      }
      setInitialized(true);
    }
  }, []);

  const setGuardianEmail = useCallback((email: string) => {
    localStorage.setItem(GUARDIAN_EMAIL_KEY, email);
    setGuardianEmailInternal(email);
  }, []);

  const incrementBlockedAttempts = useCallback(() => {
    setBlockedAttemptsInternal(prevAttempts => {
      const newAttempts = prevAttempts + 1;
      localStorage.setItem(BLOCKED_ATTEMPTS_KEY, newAttempts.toString());
      return newAttempts;
    });
  }, []);

  const clearGuardianData = useCallback(() => {
    localStorage.removeItem(GUARDIAN_EMAIL_KEY);
    localStorage.removeItem(BLOCKED_ATTEMPTS_KEY);
    setGuardianEmailInternal(null);
    setBlockedAttemptsInternal(0);
    // Consider if setInitialized(false) is needed on reset for some scenarios,
    // but typically, once initialized, it stays that way for the session.
  }, []);

  const currentGuardianEmail = initialized ? _guardianEmailInternal : null;
  const currentBlockedAttempts = initialized ? _blockedAttemptsInternal : 0;
  const currentIsGuardianSet = initialized && !!_guardianEmailInternal;

  return {
    guardianEmail: currentGuardianEmail,
    isGuardianSet: currentIsGuardianSet,
    blockedAttempts: currentBlockedAttempts,
    isInitialized: initialized,
    setGuardianEmail,
    incrementBlockedAttempts,
    clearGuardianData,
  };
}

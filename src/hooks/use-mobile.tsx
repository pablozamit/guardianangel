import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to detect if the current viewport width is considered mobile.
 * Returns `false` on the server and during the initial client render phase,
 * then updates to the correct value after client-side mount.
 * This approach helps prevent hydration mismatches for responsive components.
 */
export function useIsMobile(): boolean {
  // Assume desktop by default (false) to ensure server and initial client render are consistent.
  // This value will be updated on the client after the component mounts and the effect runs.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkIsMobile(); // Check immediately on mount to set the correct state.
    
    window.addEventListener('resize', checkIsMobile);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount.

  return isMobile;
}

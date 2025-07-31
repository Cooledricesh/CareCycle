'use client';

import { useEffect, useState } from 'react';

export function useMobile() {
  // Initialize with undefined to avoid hydration mismatches
  // The actual values will be set after mounting on the client
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const [isTablet, setIsTablet] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        setIsMobile(width < 640); // sm breakpoint
        setIsTablet(width >= 640 && width < 1024); // sm to lg
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { 
    isMobile: isMobile ?? false, 
    isTablet: isTablet ?? false, 
    isDesktop: (isMobile !== undefined && isTablet !== undefined) ? (!isMobile && !isTablet) : true 
  };
}
"use client";

import { usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return <>{children}</>;
}

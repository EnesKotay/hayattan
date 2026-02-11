"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ProgressBar() {
    return (
        <Suspense fallback={null}>
            <ProgressBarContent />
        </Suspense>
    );
}

function ProgressBarContent() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Reset progress on route change complete
        setProgress(100);
        const timeout = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setProgress(0), 100);
        }, 500);

        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    useEffect(() => {
        // Add click listener to all anchor tags
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");

            if (
                anchor &&
                anchor.href &&
                anchor.href.startsWith(window.location.origin) &&
                anchor.target !== "_blank" &&
                !anchor.href.includes("#") &&
                anchor.href !== window.location.href
            ) {
                setIsVisible(true);
                setProgress(30);

                // Simulate progress increment
                const interval = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 90) {
                            clearInterval(interval);
                            return 90;
                        }
                        return prev + 10;
                    });
                }, 500);

                // Cleanup interval on unmount or completion is handled by route change effect
            }
        };

        document.addEventListener("click", handleAnchorClick);
        return () => document.removeEventListener("click", handleAnchorClick);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed left-0 right-0 top-0 z-[100] h-1 bg-transparent">
            <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

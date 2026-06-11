"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function ReadingProgressBar() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Show only after scrolling a bit (e.g., 5%)
            setIsVisible(latest > 0.01);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed left-0 right-0 top-0 z-[100] h-1.5 origin-left bg-gradient-to-r from-primary to-primary-light"
            style={{ scaleX }}
        />
    );
}

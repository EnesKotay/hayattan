"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
    const [isMobile, setIsMobile] = useState(false);
    const [isPointer, setIsPointer] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 200 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);

            const target = e.target as HTMLElement;
            setIsPointer(
                window.getComputedStyle(target).cursor === "pointer" ||
                target.tagName === "A" ||
                target.tagName === "BUTTON"
            );
        };

        window.addEventListener("mousemove", moveCursor);

        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("mousemove", moveCursor);
        };
    }, [cursorX, cursorY]);

    if (isMobile) return null;

    return (
        <>
            {/* Ana İmleç Noktası */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />

            {/* Dış Halka - Yay Efektli */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 border border-primary/30 rounded-full pointer-events-none z-[9998]"
                animate={{
                    scale: isPointer ? 1.5 : 1,
                    backgroundColor: isPointer ? "rgba(var(--primary-rgb), 0.1)" : "transparent",
                    borderColor: isPointer ? "rgba(var(--primary-rgb), 0.5)" : "rgba(var(--primary-rgb), 0.3)",
                }}
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
        </>
    );
}

"use client";

import { motion } from "framer-motion";

const transition = {
    duration: 0.22,
    ease: [0.25, 0.1, 0.25, 1] as const,
};

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transition}
            className="min-h-full bg-background transition-colors duration-[180ms] ease-out"
            style={{ background: "var(--background)" }}
        >
            {children}
        </motion.div>
    );
}

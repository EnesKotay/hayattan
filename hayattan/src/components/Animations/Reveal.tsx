"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    duration?: number;
    direction?: "up" | "down" | "left" | "right";
    className?: string;
    viewportMargin?: string;
}

export function Reveal({
    children,
    width = "fit-content",
    delay = 0,
    duration = 0.5,
    direction = "up",
    className = "",
    viewportMargin = "-50px", // Biraz daha erken tetiklensin
}: RevealProps) {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
            scale: 0.98,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                duration,
                delay,
                ease: [0.23, 1, 0.32, 1] as const, // Fixed with as const
            },
        },
    };

    return (
        <div style={{ width }} className={className}>
            <motion.div
                variants={variants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: viewportMargin }}
            >
                {children}
            </motion.div>
        </div>
    );
}

// Stagger Container for lists
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    delayChildren?: number;
    staggerChildren?: number;
}

export function StaggerContainer({
    children,
    className = "",
    delayChildren = 0,
    staggerChildren = 0.1,
    ...props
}: StaggerContainerProps) {
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren,
                staggerChildren,
            },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Stagger Item (child of StaggerContainer)
export function StaggerItem({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const item = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut" as const,
            },
        },
    };

    return (
        <motion.div variants={item} className={className}>
            {children}
        </motion.div>
    );
}

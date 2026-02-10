"use client";

import { motion } from "framer-motion";

type LoadingSpinnerProps = {
    size?: "sm" | "md" | "lg";
    className?: string;
};

const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div
                className={`${sizes[size]} rounded-full border-2 border-gray-200 border-t-primary`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
}

type LoadingDotsProps = {
    className?: string;
};

export function LoadingDots({ className = "" }: LoadingDotsProps) {
    return (
        <div className={`flex items-center justify-center space-x-1 ${className}`}>
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: index * 0.15,
                    }}
                />
            ))}
        </div>
    );
}

type LoadingBarProps = {
    progress?: number;
    className?: string;
};

export function LoadingBar({ progress, className = "" }: LoadingBarProps) {
    return (
        <div className={`h-1 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
            <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: progress ? `${progress}%` : "100%" }}
                transition={{
                    duration: progress ? 0.3 : 1.5,
                    repeat: progress ? 0 : Infinity,
                    ease: progress ? "easeOut" : "linear",
                }}
            />
        </div>
    );
}

type LoadingOverlayProps = {
    message?: string;
};

export function LoadingOverlay({ message = "Yükleniyor..." }: LoadingOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl bg-white p-8 shadow-2xl"
            >
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-center text-sm font-medium text-gray-700">{message}</p>
            </motion.div>
        </motion.div>
    );
}

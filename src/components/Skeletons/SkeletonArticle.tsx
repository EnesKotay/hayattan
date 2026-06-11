"use client";

import { motion } from "framer-motion";

export function SkeletonArticle() {
    return (
        <div className="card overflow-hidden h-full flex flex-col">
            <div className="skeleton aspect-[16/10] w-full" />
            <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="space-y-2">
                    <div className="skeleton h-6 w-3/4 rounded" />
                    <div className="skeleton h-6 w-1/2 rounded" />
                </div>
                <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                </div>
                <div className="pt-4 mt-auto border-t border-border flex justify-between items-center">
                    <div className="skeleton h-5 w-24 rounded-full" />
                    <div className="skeleton h-5 w-16 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonArticle key={i} />
            ))}
        </div>
    );
}

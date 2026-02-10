"use client";

import Link from "next/link";
import { Icons } from "@/components/admin/Icons";

export type Card = {
    href: string;
    title: string;
    count: number | null;
    description: string;
    icon: keyof typeof Icons;
    color: "blue" | "orange" | "green" | "purple" | "pink" | "cyan";
};

const colorClasses = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
    orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600",
    green: "bg-green-50 text-green-600 group-hover:bg-green-600",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600",
    pink: "bg-pink-50 text-pink-600 group-hover:bg-pink-600",
    cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600",
};

export function DashboardCard({ href, title, count, description, icon, color }: Card) {
    const Icon = Icons[icon];
    return (
        <Link
            href={href}
            className="group relative flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-lg overflow-hidden"
        >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex items-start gap-4 w-full">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${colorClasses[color]} group-hover:text-white`}
                >
                    <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{description}</p>
                </div>
                {count !== null && (
                    <span className="text-lg font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
                        {count}
                    </span>
                )}
            </div>

            {/* Arrow indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-300 z-10">
                <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Icons } from "@/components/admin/Icons";

export type QuickAction = {
    href: string;
    label: string;
    icon: keyof typeof Icons;
    gradient: string;
    description: string;
};

type DashboardQuickActionsProps = {
    actions: QuickAction[];
};

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action, index) => {
                const Icon = Icons[action.icon];
                return (
                    <motion.div
                        key={action.href}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                    >
                        <Link
                            href={action.href}
                            className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                        >
                            {/* Gradient Background */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}
                            />

                            {/* Content */}
                            <div className="relative z-10 flex items-start gap-4 p-6 text-white">
                                <div className="flex-shrink-0">
                                    <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg mb-1">{action.label}</h3>
                                    <p className="text-sm text-white/90">{action.description}</p>
                                </div>
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-300">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}

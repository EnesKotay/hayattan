"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/admin/Icons";

export type StatItem = {
    label: string;
    value: number;
    icon: keyof typeof Icons;
    color: string;
    bg: string;
    trend: string | null;
    trendUp: boolean;
};

type DashboardStatsProps = {
    stats: StatItem[];
};

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = Icons[stat.icon];
                return (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        {/* Gradient background on hover */}
                        <div
                            className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${stat.bg}`}
                        />

                        <div className="relative flex items-center gap-4">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                            >
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {stat.label}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    {stat.trend && (
                                        <span
                                            className={`text-xs font-medium ${stat.trendUp ? "text-green-600" : "text-orange-600"
                                                }`}
                                        >
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

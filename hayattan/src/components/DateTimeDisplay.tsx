"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar } from "lucide-react";

export function DateTimeDisplay({ minimal = false }: { minimal?: boolean }) {
    const [date, setDate] = useState<Date | null>(null);

    useEffect(() => {
        setDate(new Date());
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!date) return null;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const day = date.toLocaleDateString("tr-TR", { weekday: "short" });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("tr-TR", { month: "short" });

    if (minimal) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 py-1 px-3 rounded-full bg-primary/5 border border-primary/10"
            >
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/60 uppercase tracking-widest">
                    <span>{dayNum} {month}</span>
                    <span className="opacity-40">{day}</span>
                </div>
                <div className="h-2.5 w-[1px] bg-primary/20" />
                <div className="font-mono text-[12px] font-bold text-primary flex items-center">
                    <span>{hours}</span>
                    <span className="mx-0.5 animate-pulse">:</span>
                    <span>{minutes}</span>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full glass border border-primary/10 shadow-premium-sm overflow-hidden"
        >
            {/* Tarih Kısımı */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/80 tracking-tight">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="uppercase whitespace-nowrap">
                    {dayNum} {date.toLocaleDateString("tr-TR", { month: "long" })}, {date.toLocaleDateString("tr-TR", { weekday: "long" })}
                </span>
            </div>

            <div className="h-3 w-[1px] bg-border/60" />

            {/* Saat Kısımı */}
            <div className="flex items-center gap-1.5 min-w-[75px]">
                <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                <div className="flex items-center font-mono text-[13px] font-bold text-primary tracking-wider">
                    <span>{hours}</span>
                    <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="mx-0.5"
                    >
                        :
                    </motion.span>
                    <span>{minutes}</span>
                    <span className="ml-1 text-[10px] opacity-60 font-medium self-end mb-0.5">{seconds}</span>
                </div>
            </div>
        </motion.div>
    );
}

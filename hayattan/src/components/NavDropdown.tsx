"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";

type NavItem = { href: string; label: string; icon?: React.ElementType };

type NavDropdownProps = {
    label: React.ReactNode;
    items: NavItem[];
    active?: boolean;
};

export function NavDropdown({ label, items, active = false }: NavDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`group flex items-center justify-center gap-1 w-10 h-10 rounded-full transition-all duration-300 z-10 ${isOpen || active
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-muted-bg text-foreground/70 hover:bg-primary/10 hover:text-primary hover:scale-110"
                    }`}
                aria-label="Daha fazla seçenek"
            >
                <div className="relative">
                    {label}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute right-0 mt-3 w-64 origin-top-right rounded-[24px] border border-primary/5 bg-background/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-2xl z-50"
                    >
                        <div className="flex flex-col gap-1.5">
                            <div className="px-3 py-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">KEŞFET</span>
                            </div>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 + 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-foreground/80 transition-all hover:bg-primary hover:text-white active:scale-[0.97]"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted-bg group-hover:bg-white/20 transition-colors">
                                            {item.icon ? <item.icon className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                        </span>
                                        <span className="flex-1 tracking-tight">{item.label}</span>
                                        <ChevronDown className="w-4 h-4 -rotate-90 opacity-0 -translate-x-2 transition-all group-hover:opacity-50 group-hover:translate-x-0" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnPresence>
        </div>
    );
}

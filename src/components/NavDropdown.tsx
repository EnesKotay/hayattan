"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

type NavItem = { href: string; label: string; icon?: React.ElementType };

type NavDropdownProps = {
    label: React.ReactNode;
    items: NavItem[];
    active?: boolean;
};

export function NavDropdown({ label, items, active = false }: NavDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", closeOnOutsideClick);
        return () => document.removeEventListener("mousedown", closeOnOutsideClick);
    }, []);

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
            ref={containerRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") setIsOpen(false);
                }}
                className={`group z-10 flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors ${isOpen || active
                    ? "bg-primary-light text-primary"
                    : "text-foreground/70 hover:bg-muted-bg hover:text-primary"
                    }`}
                aria-label="Diğer sayfaları göster"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span>{label}</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-0 z-50 mt-3 w-64 origin-top-right rounded-[16px] border border-border bg-background/96 p-2 shadow-premium-xl backdrop-blur-xl"
                        role="menu"
                    >
                        <div className="flex flex-col gap-1.5">
                            <div className="px-3 py-2">
                                <span className="text-xs font-semibold text-muted">Keşfet</span>
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
                                        role="menuitem"
                                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-primary hover:text-white"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted-bg transition-colors group-hover:bg-white/20">
                                            {item.icon ? <item.icon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
                                        </span>
                                        <span className="flex-1 tracking-tight">{item.label}</span>
                                        <ChevronDownIcon className="w-4 h-4 -rotate-90 opacity-0 -translate-x-2 transition-all group-hover:opacity-50 group-hover:translate-x-0" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

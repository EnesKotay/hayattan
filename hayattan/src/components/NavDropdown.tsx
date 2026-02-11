"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

type NavItem = { href: string; label: string };

type NavDropdownProps = {
    label: string;
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
                className={`group flex items-center gap-1.5 px-3 py-2 text-xs xl:text-sm font-bold uppercase tracking-[0.1em] transition-colors z-10 ${isOpen || active ? "text-primary" : "text-foreground/80 hover:text-primary"
                    }`}
            >
                <span className="relative z-10">{label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-0 mt-1 w-56 origin-top-left rounded-2xl border border-primary/10 bg-background/95 p-2 shadow-2xl backdrop-blur-xl z-50"
                    >
                        <div className="flex flex-col gap-1">
                            {items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/80 transition-all hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

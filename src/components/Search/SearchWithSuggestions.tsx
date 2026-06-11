"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
    id: string;
    title: string;
    slug: string;
    type: "yazi" | "kategori" | "yazar";
}

interface SearchWithSuggestionsProps {
    placeholder?: string;
    className?: string;
}

export function SearchWithSuggestions({
    placeholder = "Ara...",
    className = "",
}: SearchWithSuggestionsProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data.results || []);
                    setIsOpen(data.results?.length > 0);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    const selected = results[selectedIndex];
                    navigateToResult(selected);
                } else {
                    // Search all
                    router.push(`/arama?q=${encodeURIComponent(query)}`);
                }
                break;
            case "Escape":
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const navigateToResult = (result: SearchResult) => {
        setIsOpen(false);
        setQuery("");

        switch (result.type) {
            case "yazi":
                router.push(`/yazilar/${result.slug}`);
                break;
            case "kategori":
                router.push(`/kategoriler/${result.slug}`);
                break;
            case "yazar":
                router.push(`/yazarlar/${result.slug}`);
                break;
        }
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;

        const regex = new RegExp(`(${query})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <strong key={i} className="text-primary font-semibold">
                    {part}
                </strong>
            ) : (
                part
            )
        );
    };

    const typeLabels = {
        yazi: "Yazı",
        kategori: "Kategori",
        yazar: "Yazar",
    };

    const typeIcons = {
        yazi: "📄",
        kategori: "📁",
        yazar: "✍️",
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 pl-10 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Arama"
                    aria-autocomplete="list"
                    aria-controls="search-results"
                    aria-expanded={isOpen}
                />
                <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                    </div>
                )}
            </div>

            {/* Results dropdown */}
            {isOpen && results.length > 0 && (
                <div
                    id="search-results"
                    className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg"
                    role="listbox"
                >
                    <div className="max-h-96 overflow-y-auto">
                        {results.map((result, index) => (
                            <button
                                key={result.id}
                                onClick={() => navigateToResult(result)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${index === selectedIndex
                                        ? "bg-primary-light text-primary"
                                        : "hover:bg-muted-bg"
                                    }`}
                                role="option"
                                aria-selected={index === selectedIndex}
                            >
                                <span className="text-xl">{typeIcons[result.type]}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium">
                                        {highlightMatch(result.title, query)}
                                    </div>
                                    <div className="text-xs text-muted">{typeLabels[result.type]}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-border bg-muted-bg/50 px-4 py-2 text-xs text-muted">
                        <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">↑↓</kbd> Gezin ·{" "}
                        <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Enter</kbd> Seç ·{" "}
                        <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Esc</kbd> Kapat
                    </div>
                </div>
            )}
        </div>
    );
}

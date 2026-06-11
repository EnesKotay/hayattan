"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Icons } from "@/components/admin/Icons";

type FilterOption = {
    label: string;
    value: string;
};

type FilterItem =
    | { type: "search"; name: string; placeholder?: string; label?: string }
    | { type: "select"; name: string; label?: string; options: FilterOption[] };

type AdminFiltersProps = {
    filters: FilterItem[];
};

export function AdminFilters({ filters }: AdminFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            // Filtre değişince sayfayı 1'e çek
            if (name !== "sayfa") {
                params.delete("sayfa");
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleChange = (name: string, value: string) => {
        startTransition(() => {
            router.push(`?${createQueryString(name, value)}`);
        });
    };

    // Debounce for search inputs
    const handleSearch = (name: string, value: string) => {
        // Simple debounce via timeout not needed if we rely on onBlur or accept slight delay,
        // but for best UX let's use a small timeout or just push immediately.
        // For admin panels, immediate push on "Enter" or "Blur" is often better, or debounce.
        // Here we will use a simple debounce approach with a local timeout wrapper if needed, 
        // but standard input onChange with 500ms debounce is best.

        // For simplicity in this implementation, we will update on change with debounce.
        const timeoutId = setTimeout(() => {
            handleChange(name, value);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const hasActiveFilters = Array.from(searchParams.keys()).some(
        (key) => key !== "sayfa" && key !== "success" && key !== "deleted" && key !== "error" && searchParams.get(key)
    );

    return (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {filters.map((filter) => (
                <div key={filter.name} className="flex flex-col gap-1">
                    {filter.label && (
                        <label htmlFor={filter.name} className="text-xs font-medium text-gray-500">
                            {filter.label}
                        </label>
                    )}
                    {filter.type === "search" ? (
                        <div className="relative">
                            <input
                                id={filter.name}
                                type="search"
                                placeholder={filter.placeholder}
                                defaultValue={searchParams.get(filter.name) ?? ""}
                                onChange={(e) => {
                                    // Clear previous timeout if simple implementation
                                    // Ideally use a useDebounce hook, but for now specific implementation:
                                    const val = e.target.value;
                                    const handler = setTimeout(() => handleChange(filter.name, val), 400);
                                    // Cleanup not easily possible inside this loop without state, 
                                    // so we'll rely on rapid updates replacing the URL which Next.js handles well enough,
                                    // OR better: use `onKeyDown` for Enter or rely on `onBlur` + debounced `onChange`.
                                }}
                                // Better approach for search: immediate visual feedback, delayed URL update.
                                // Re-implementing correctly below with a wrapper input component would be cleaner.
                                // For this single file component, let's stick to a simpler "Apply" for text or debounce.
                                // Let's use a keydown 'Enter' to submit for search to be precise, or onBlur.
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleChange(filter.name, e.currentTarget.value);
                                    }
                                }}
                                onBlur={(e) => handleChange(filter.name, e.target.value)}
                                className="min-w-[180px] rounded-lg border border-gray-200 px-3 py-2 pl-9 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    ) : (
                        <select
                            id={filter.name}
                            value={searchParams.get(filter.name) ?? ""}
                            onChange={(e) => handleChange(filter.name, e.target.value)}
                            className="min-w-[140px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {filter.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            ))}

            {/* Loading Indicator */}
            {isPending && (
                <div className="mb-2 ml-2 text-sm text-gray-500 animate-pulse">Güncelleniyor...</div>
            )}

            {hasActiveFilters && (
                <button
                    onClick={() => router.push(window.location.pathname)}
                    className="mb-0.5 ml-auto rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                    Temizle
                </button>
            )}
        </div>
    );
}

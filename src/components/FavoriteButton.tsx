"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/components/Toast/ToastProvider";

interface FavoriteButtonProps {
    id: string;
    className?: string;
}

export function FavoriteButton({ id, className = "" }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
    const { addToast } = useToast();
    const favorited = isFavorite(id);

    // Don't render until favorites are loaded from localStorage
    if (!isLoaded) {
        return null;
    }

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(id);
                if (!favorited) {
                    addToast("Yazı favorilere eklendi ❤️", "success");
                } else {
                    addToast("Yazı favorilerden çıkarıldı", "info");
                }
            }}
            aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
            className={`group relative transition-all ${className}`}
        >
            {/* Heart icon */}
            <svg
                className={`h-6 w-6 transition-all group-hover:scale-110 ${favorited
                        ? "fill-red-500 text-red-500"
                        : "fill-none text-muted hover:text-red-400"
                    }`}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>

            {/* Pulse animation on favorite */}
            {favorited && (
                <span className="absolute inset-0 animate-ping opacity-75">
                    <svg
                        className="h-6 w-6 fill-red-500"
                        viewBox="0 0 24 24"
                    >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </span>
            )}
        </button>
    );
}

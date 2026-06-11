"use client";

import { useState, useEffect } from "react";

const FAVORITES_KEY = "hayattan_favorites";

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch (error) {
                console.error("Failed to load favorites:", error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever favorites change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    }, [favorites, isLoaded]);

    const addFavorite = (id: string) => {
        setFavorites((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    const removeFavorite = (id: string) => {
        setFavorites((prev) => prev.filter((fav) => fav !== id));
    };

    const toggleFavorite = (id: string) => {
        if (favorites.includes(id)) {
            removeFavorite(id);
        } else {
            addFavorite(id);
        }
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return {
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        isLoaded,
    };
}

"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, "id">) => void;
    hideToast: (id: string) => void;
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    warning: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 5000,
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto-hide after duration
        if (newToast.duration) {
            setTimeout(() => {
                hideToast(id);
            }, newToast.duration);
        }
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback(
        (message: string, description?: string) => {
            showToast({ type: "success", message, description });
        },
        [showToast]
    );

    const error = useCallback(
        (message: string, description?: string) => {
            showToast({ type: "error", message, description });
        },
        [showToast]
    );

    const warning = useCallback(
        (message: string, description?: string) => {
            showToast({ type: "warning", message, description });
        },
        [showToast]
    );

    const info = useCallback(
        (message: string, description?: string) => {
            showToast({ type: "info", message, description });
        },
        [showToast]
    );

    return (
        <ToastContext.Provider
            value={{ toasts, showToast, hideToast, success, error, warning, info }}
        >
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

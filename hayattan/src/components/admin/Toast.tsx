"use client";

import { motion } from "framer-motion";
import { useToast, type Toast } from "./ToastProvider";
import { Icons } from "./Icons";

const toastIcons = {
    success: Icons.CheckCircle,
    error: Icons.XCircle,
    warning: Icons.AlertTriangle,
    info: Icons.Info,
};

const toastColors = {
    success: {
        bg: "bg-green-50",
        border: "border-green-500",
        icon: "text-green-600",
        text: "text-green-900",
    },
    error: {
        bg: "bg-red-50",
        border: "border-red-500",
        icon: "text-red-600",
        text: "text-red-900",
    },
    warning: {
        bg: "bg-orange-50",
        border: "border-orange-500",
        icon: "text-orange-600",
        text: "text-orange-900",
    },
    info: {
        bg: "bg-blue-50",
        border: "border-blue-500",
        icon: "text-blue-600",
        text: "text-blue-900",
    },
};

function ToastItem({ toast }: { toast: Toast }) {
    const { hideToast } = useToast();
    const Icon = toastIcons[toast.type];
    const colors = toastColors[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex items-start gap-3 rounded-xl border-l-4 ${colors.border} ${colors.bg} p-4 shadow-lg backdrop-blur-sm`}
        >
            <div className={`flex-shrink-0 ${colors.icon}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${colors.text}`}>{toast.message}</p>
                {toast.description && (
                    <p className="mt-0.5 text-xs text-gray-600">{toast.description}</p>
                )}
            </div>
            <button
                onClick={() => hideToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
            >
                <Icons.X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

export function ToastContainer() {
    const { toasts } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <motion.div
                className="flex flex-col gap-2 pointer-events-auto"
                layout
            >
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </motion.div>
        </div>
    );
}

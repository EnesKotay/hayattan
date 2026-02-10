"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "./Icons";
import { ReactNode } from "react";

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
};

const variants = {
    danger: {
        icon: Icons.AlertTriangle,
        iconColor: "text-red-600",
        buttonColor: "bg-red-600 hover:bg-red-700",
    },
    warning: {
        icon: Icons.AlertTriangle,
        iconColor: "text-orange-600",
        buttonColor: "bg-orange-600 hover:bg-orange-700",
    },
    info: {
        icon: Icons.Info,
        iconColor: "text-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
};

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Onayla",
    cancelText = "İptal",
    variant = "danger",
    isLoading = false,
}: ConfirmModalProps) {
    const config = variants[variant];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-md w-full rounded-2xl bg-white shadow-2xl"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 ${config.iconColor}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                                        {description && (
                                            <p className="mt-2 text-sm text-gray-600">{description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${config.buttonColor}`}
                                >
                                    {isLoading ? "İşleniyor..." : confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
};

const modalSizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export function Modal({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal - tıklamalar forma gitmesin diye stopPropagation */}
                    <div
                      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className={`${modalSizes[size]} w-full rounded-2xl bg-white shadow-2xl my-8`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Kapat"
                                >
                                    <Icons.X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

                            {/* Footer */}
                            {footer && (
                                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">{footer}</div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

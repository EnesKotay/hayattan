"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type EmptyStateProps = {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    secondaryAction?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
};

export function EmptyState({
    icon,
    title,
    description,
    action,
    secondaryAction,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center"
        >
            {icon && (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    {icon}
                </div>
            )}
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mb-6 max-w-md text-sm text-gray-600">{description}</p>
            {(action || secondaryAction) && (
                <div className="flex gap-3">
                    {action && (
                        <>
                            {action.href ? (
                                <Link
                                    href={action.href}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors"
                                >
                                    {action.label}
                                </Link>
                            ) : (
                                <button
                                    onClick={action.onClick}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors"
                                >
                                    {action.label}
                                </button>
                            )}
                        </>
                    )}
                    {secondaryAction && (
                        <>
                            {secondaryAction.href ? (
                                <Link
                                    href={secondaryAction.href}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {secondaryAction.label}
                                </Link>
                            ) : (
                                <button
                                    onClick={secondaryAction.onClick}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {secondaryAction.label}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </motion.div>
    );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Yazi = {
    id: string;
    title: string;
    publishedAt: Date | null;
    createdAt: Date;
    author: { name: string };
};

type Haber = {
    id: string;
    title: string;
    createdAt: Date;
};

type RecentActivityProps = {
    yazilar: Yazi[];
    haberler: Haber[];
};

export function RecentActivity({ yazilar, haberler }: RecentActivityProps) {
    return (
        <div className="space-y-6">
            {/* Son Yazılar */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">Son Yazılar</h2>
                <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-50">
                        {yazilar.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">
                                Henüz yazı yok
                            </div>
                        ) : (
                            yazilar.map((yazi) => (
                                <Link
                                    key={yazi.id}
                                    href={`/admin/yazilar/${yazi.id}`}
                                    className="group flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div
                                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${yazi.publishedAt ? "bg-green-500" : "bg-amber-500"
                                            }`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                            {yazi.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {yazi.author.name} •{" "}
                                            {yazi.publishedAt
                                                ? new Date(yazi.publishedAt).toLocaleDateString("tr-TR")
                                                : "Taslak"}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                    <Link
                        href="/admin/yazilar"
                        className="block bg-gray-50 p-3 text-center text-xs font-semibold text-primary hover:bg-gray-100 transition-colors"
                    >
                        Tümünü Görüntüle →
                    </Link>
                </div>
            </motion.div>

            {/* Son Haberler */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
            >
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">Son Haberler</h2>
                <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-50">
                        {haberler.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">
                                Henüz haber yok
                            </div>
                        ) : (
                            haberler.map((haber) => (
                                <Link
                                    key={haber.id}
                                    href={`/admin/haberler/${haber.id}`}
                                    className="group flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                            {haber.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {new Date(haber.createdAt).toLocaleDateString("tr-TR")}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                    <Link
                        href="/admin/haberler"
                        className="block bg-gray-50 p-3 text-center text-xs font-semibold text-primary hover:bg-gray-100 transition-colors"
                    >
                        Tümünü Görüntüle →
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

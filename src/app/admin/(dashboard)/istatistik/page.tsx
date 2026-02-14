"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { getDashboardStats } from "@/app/admin/actions";
import { Icons } from "@/components/admin/Icons";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

export default function IstatistikPage() {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const data = await getDashboardStats();
                setStatsData(data);
            } catch (error) {
                console.error("Dashboard stats fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (!mounted) {
        return <div className="p-8 text-center text-gray-500">Hazırlanıyor...</div>;
    }

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
                <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
                </div>
                <div className="h-[400px] bg-gray-100 rounded-xl" />
            </div>
        );
    }

    const stats = statsData ? [
        {
            label: "Toplam Yazı",
            value: statsData.totalPosts,
            icon: "Article" as keyof typeof Icons,
            color: "text-blue-600",
            bg: "bg-blue-50",
            trend: null,
            trendUp: true,
        },
        {
            label: "Toplam Haber",
            value: statsData.totalNews,
            icon: "News" as keyof typeof Icons,
            color: "text-orange-600",
            bg: "bg-orange-50",
            trend: null,
            trendUp: true,
        },
        {
            label: "Toplam Yazar",
            value: statsData.totalAuthors,
            icon: "User" as keyof typeof Icons,
            color: "text-green-600",
            bg: "bg-green-50",
            trend: null,
            trendUp: true,
        },
        {
            label: "Kategoriler",
            value: statsData.totalCategories,
            icon: "Tag" as keyof typeof Icons,
            color: "text-purple-600",
            bg: "bg-purple-50",
            trend: null,
            trendUp: true,
        },
    ] : [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <AdminBreadcrumbs />
                <h1 className="font-serif text-3xl font-bold text-gray-900 mt-2">İstatistikler ve Analizler</h1>
                <p className="text-gray-500">Sitenizdeki içerik performansı ve dağılımını buradan takip edebilirsiniz.</p>
            </div>

            {statsData && (
                <>
                    <DashboardStats stats={stats} />
                    <div className="animate-fade-in-up">
                        <DashboardCharts stats={statsData} />
                    </div>
                </>
            )}

            {!statsData && (
                <div className="p-12 text-center rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">İstatistik verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
                </div>
            )}
        </div>
    );
}

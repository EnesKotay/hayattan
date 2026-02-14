export default function Loading() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="skeleton skeleton-title w-32"></div>
                    <div className="skeleton skeleton-text w-64"></div>
                </div>
                <div className="skeleton h-10 w-40 rounded-lg"></div>
            </div>

            {/* İstatistik Kartları Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="skeleton h-10 w-10 rounded-lg"></div>
                            <div className="flex-1 space-y-1.5">
                                <div className="skeleton h-3 w-16 rounded"></div>
                                <div className="skeleton h-7 w-12 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtre Skeleton */}
            <div className="flex flex-wrap gap-3">
                <div className="skeleton h-10 w-32 rounded-lg"></div>
                <div className="skeleton h-10 w-36 rounded-lg"></div>
                <div className="skeleton h-10 w-48 rounded-lg"></div>
            </div>

            {/* Tablo Skeleton */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* Thead */}
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex gap-4">
                    <div className="skeleton h-4 w-24 rounded"></div>
                    <div className="skeleton h-4 w-16 rounded"></div>
                    <div className="skeleton h-4 w-16 rounded hidden sm:block"></div>
                    <div className="skeleton h-4 w-14 rounded hidden sm:block"></div>
                    <div className="skeleton h-4 w-16 rounded hidden sm:block"></div>
                    <div className="skeleton h-4 w-20 rounded ml-auto"></div>
                </div>
                {/* Rows */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-0"
                    >
                        <div className="flex-1 space-y-1.5">
                            <div className="skeleton h-4 rounded" style={{ width: `${60 + (i % 3) * 10}%` }}></div>
                            <div className="skeleton h-3 w-20 rounded sm:hidden"></div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="skeleton h-8 w-8 rounded-full"></div>
                            <div className="skeleton h-3 w-16 rounded"></div>
                        </div>
                        <div className="hidden sm:block skeleton h-3 w-24 rounded"></div>
                        <div className="skeleton h-6 w-16 rounded-full"></div>
                        <div className="hidden sm:block skeleton h-3 w-10 rounded"></div>
                        <div className="flex gap-2">
                            <div className="skeleton h-7 w-16 rounded-md"></div>
                            <div className="hidden sm:block skeleton h-7 w-16 rounded-md"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

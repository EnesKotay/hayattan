export default function Loading() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Skeleton */}
            <div>
                <div className="skeleton skeleton-title w-48"></div>
                <div className="skeleton skeleton-text w-72"></div>
            </div>

            {/* İstatistik Kartları Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="skeleton h-12 w-12 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                                <div className="skeleton skeleton-text w-20"></div>
                                <div className="skeleton h-7 w-16 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hızlı Erişim Kartları Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="skeleton h-10 w-10 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="skeleton skeleton-text w-24"></div>
                                <div className="skeleton skeleton-text w-36"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

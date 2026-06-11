export default function Loading() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="skeleton skeleton-title w-36"></div>
                    <div className="skeleton skeleton-text w-80"></div>
                </div>
                <div className="skeleton h-10 w-44 rounded-lg"></div>
            </div>

            {/* Arama Skeleton */}
            <div className="skeleton h-10 w-56 rounded-lg"></div>

            {/* Tablo Skeleton */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* Thead */}
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex gap-4">
                    <div className="skeleton h-4 w-20 rounded"></div>
                    <div className="skeleton h-4 w-16 rounded hidden sm:block"></div>
                    <div className="skeleton h-4 w-10 rounded hidden sm:block"></div>
                    <div className="skeleton h-4 w-20 rounded hidden sm:block"></div>
                    <div className="skeleton h-4 w-14 rounded ml-auto"></div>
                </div>
                {/* Rows */}
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-0"
                    >
                        <div className="skeleton h-4 rounded" style={{ width: `${20 + (i % 3) * 7}%` }}></div>
                        <div className="hidden sm:block skeleton h-3 w-36 rounded"></div>
                        <div className="hidden sm:block skeleton h-5 w-20 rounded-full"></div>
                        <div className="hidden sm:block skeleton h-3 w-14 rounded"></div>
                        <div className="flex gap-2 ml-auto">
                            <div className="skeleton h-4 w-16 rounded"></div>
                            <div className="skeleton h-4 w-14 rounded"></div>
                            <div className="hidden sm:block skeleton h-4 w-8 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

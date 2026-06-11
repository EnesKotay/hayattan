"use client";

export function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-center gap-4">
                <div className="skeleton-circle" />
                <div className="flex-1">
                    <div className="skeleton-title" />
                    <div className="skeleton-text" style={{ width: "70%" }} />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 bg-gray-50 p-4">
                <div className="skeleton-text" style={{ width: "30%" }} />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b border-gray-50 p-4">
                    <div className="flex items-center gap-4">
                        <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "8px" }} />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton-text" style={{ width: "60%" }} />
                            <div className="skeleton-text" style={{ width: "40%" }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonForm() {
    return (
        <div className="animate-pulse space-y-6 rounded-xl border border-gray-100 bg-white p-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="skeleton-text" style={{ width: "20%" }} />
                    <div className="skeleton" style={{ height: "40px", borderRadius: "8px" }} />
                </div>
            ))}
            <div className="skeleton" style={{ height: "120px", borderRadius: "12px" }} />
            <div className="flex justify-end gap-2">
                <div className="skeleton" style={{ width: "100px", height: "40px", borderRadius: "8px" }} />
                <div className="skeleton" style={{ width: "100px", height: "40px", borderRadius: "8px" }} />
            </div>
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
                    <div className="flex items-center gap-4">
                        <div className="skeleton-circle" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton-text" style={{ width: "60%" }} />
                            <div className="skeleton" style={{ width: "40px", height: "24px" }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonList() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="animate-pulse flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3"
                >
                    <div className="skeleton" style={{ width: "12px", height: "12px", borderRadius: "50%" }} />
                    <div className="flex-1">
                        <div className="skeleton-text" style={{ width: `${Math.random() * 40 + 40}%` }} />
                    </div>
                    <div className="skeleton" style={{ width: "60px", height: "24px", borderRadius: "12px" }} />
                </div>
            ))}
        </div>
    );
}

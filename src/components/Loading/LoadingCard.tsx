import { Skeleton } from "./Skeleton";

export function LoadingCard() {
    return (
        <div className="rounded-lg border border-border bg-background p-4">
            {/* Image skeleton */}
            <Skeleton height="200px" className="mb-4" variant="rectangular" />

            {/* Title skeleton */}
            <Skeleton height="24px" width="80%" className="mb-2" />

            {/* Subtitle skeleton */}
            <Skeleton height="16px" width="60%" className="mb-4" />

            {/* Content lines */}
            <div className="space-y-2">
                <Skeleton height="14px" width="100%" />
                <Skeleton height="14px" width="95%" />
                <Skeleton height="14px" width="85%" />
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center gap-2">
                <Skeleton height="32px" width="32px" variant="circular" />
                <Skeleton height="14px" width="120px" />
            </div>
        </div>
    );
}

export function LoadingList({ count = 3 }: { count?: number }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <LoadingCard key={i} />
            ))}
        </div>
    );
}

import { SkeletonGrid } from "@/components/Skeletons/SkeletonArticle";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-12 space-y-12">
            <div className="max-w-2xl space-y-4">
                <div className="skeleton h-12 w-3/4 rounded-lg" />
                <div className="skeleton h-6 w-full rounded-md" />
            </div>

            <div className="flex gap-4 mb-8">
                <div className="skeleton h-10 w-24 rounded-full" />
                <div className="skeleton h-10 w-32 rounded-full" />
                <div className="skeleton h-10 w-28 rounded-full" />
            </div>

            <SkeletonGrid count={6} />
        </div>
    );
}

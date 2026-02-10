interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
    variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({
    className = "",
    width = "100%",
    height = "20px",
    variant = "rectangular",
}: SkeletonProps) {
    const baseClasses = "skeleton bg-muted-bg/50";

    const variantClasses = {
        text: "rounded",
        circular: "rounded-full",
        rectangular: "rounded-md",
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
            aria-label="Yükleniyor..."
        />
    );
}

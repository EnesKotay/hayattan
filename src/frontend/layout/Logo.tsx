import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  centered?: boolean;
  iconScale?: number;
};

const sizeClasses = {
  sm: "text-lg md:text-xl",
  md: "text-xl md:text-2xl",
  lg: "text-3xl md:text-4xl lg:text-5xl",
};

export function Logo({ size = "lg", showTagline = true, centered = true, iconScale = 1 }: LogoProps) {
  // Size multiplier for the icon
  const iconSize = Math.round((size === "lg" ? 68 : size === "md" ? 48 : 38) * iconScale);

  return (
    <div
      className={`flex flex-col items-center gap-1 ${centered ? "mx-auto text-center" : ""
        }`}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
      >
        <div className="relative overflow-hidden rounded-full border border-border bg-background">
          <Image
            src="/amblem.jpg"
            alt="Hayattan.Net Amblem"
            width={iconSize}
            height={iconSize}
            className="object-cover"
            priority
          />
        </div>
        <span
          className={`font-serif font-bold text-primary hover:text-primary-hover transition-colors tracking-tight ${sizeClasses[size]}`}
        >
          Hayattan.Net
        </span>
      </Link>
      {showTagline && (
        <p className="text-sm text-muted">Hayatın Engelsiz Tarafı</p>
      )}
    </div>
  );
}

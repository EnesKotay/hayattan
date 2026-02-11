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
  md: "text-2xl md:text-3xl",
  lg: "text-4xl md:text-5xl lg:text-6xl",
};

export function Logo({ size = "lg", showTagline = true, centered = true, iconScale = 1 }: LogoProps) {
  // Size multiplier for the icon
  const iconSize = Math.round((size === "lg" ? 80 : size === "md" ? 56 : 42) * iconScale);

  return (
    <div
      className={`flex flex-col items-center gap-1 ${centered ? "mx-auto text-center" : ""
        }`}
    >
      <Link
        href="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-90"
      >
        <div className="relative overflow-hidden rounded-full shadow-sm">
          <Image
            src="/amblem.jpg"
            alt="Hayattan.Net Amblem"
            width={iconSize}
            height={iconSize}
            className="object-cover"
          />
        </div>
        <span
          className={`font-serif font-bold text-primary hover:text-primary-hover transition-colors tracking-tight ${sizeClasses[size]}`}
        >
          Hayattan.Net
        </span>
      </Link>
      {showTagline && (
        <p className="text-xs text-muted opacity-80">Hayatın Engelsiz Tarafı</p>
      )}
    </div>
  );
}

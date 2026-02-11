import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  centered?: boolean;
};

const sizeClasses = {
  sm: "text-xl",
  md: "text-3xl md:text-4xl",
  lg: "text-4xl md:text-5xl lg:text-6xl",
};

export function Logo({ size = "lg", showTagline = true, centered = true }: LogoProps) {
  // Size multiplier for the icon (Daha da büyütüldü)
  const iconSize = size === "lg" ? 80 : size === "md" ? 56 : 42;

  return (
    <div
      className={`flex flex-col items-center gap-2 ${centered ? "mx-auto text-center" : ""
        }`}
    >
      <Link
        href="/"
        className="flex items-center gap-3 transition-opacity hover:opacity-90"
      >
        <div className="relative overflow-hidden rounded-full shadow-md">
          <Image
            src="/amblem.jpg"
            alt="Hayattan.Net Amblem"
            width={iconSize}
            height={iconSize}
            className="object-cover"
          />
        </div>
        <span
          className={`font-serif font-bold text-primary hover:text-primary-hover transition-colors ${sizeClasses[size]}`}
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

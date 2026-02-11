import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  centered?: boolean;
};

const sizeClasses = {
  sm: "text-lg md:text-xl",
  md: "text-xl md:text-3xl lg:text-4xl", // Mobile: text-xl, Desktop: text-3xl+
  lg: "text-2xl md:text-5xl lg:text-6xl",
};

const imageSizeClasses = {
  sm: "h-8 w-8 md:h-10 md:w-10",
  md: "h-10 w-10 md:h-14 md:w-14", // Mobile: 40px, Desktop: 56px
  lg: "h-12 w-12 md:h-20 md:w-20",
};

export function Logo({ size = "lg", showTagline = true, centered = true }: LogoProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${centered ? "mx-auto text-center" : ""
        }`}
    >
      <Link
        href="/"
        className="flex items-center gap-2 md:gap-3 transition-opacity hover:opacity-90"
      >
        <div className={`relative overflow-hidden rounded-full shadow-md ${imageSizeClasses[size]}`}>
          <Image
            src="/amblem.jpg"
            alt="Hayattan.Net Amblem"
            fill
            sizes="(max-width: 768px) 48px, 80px"
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
        <p className="text-xs md:text-sm text-muted">Hayatın Engelsiz Tarafı</p>
      )}
    </div>
  );
}

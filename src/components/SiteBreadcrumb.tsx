import Link from "next/link";

export type BreadcrumbItem = { href: string; label: string };

type SiteBreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function SiteBreadcrumb({ items }: SiteBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-border" aria-hidden>
                /
              </span>
            )}
            {i === items.length - 1 ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

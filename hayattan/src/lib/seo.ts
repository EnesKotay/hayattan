import { Metadata } from "next";

type YaziSEOData = {
    title: string;
    excerpt?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    featuredImage?: string | null;
    ogImage?: string | null;
    imageAlt?: string | null;
    slug: string;
    author: { name: string };
    publishedAt?: Date | null;
    updatedAt: Date;
};

const SITE_NAME = "Hayattan.Net";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hayattan.net";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`; // Varsayılan OG görseli

/**
 * Generate Next.js Metadata for a Yazi (article)
 * Includes: meta description, Open Graph, Twitter Card, keywords
 */
export function generateYaziMetadata(yazi: YaziSEOData): Metadata {
    const {
        title,
        excerpt,
        metaDescription,
        metaKeywords,
        featuredImage,
        ogImage,
        imageAlt,
        slug,
        author,
        publishedAt,
        updatedAt,
    } = yazi;

    // Meta description fallback chain
    const description =
        metaDescription ||
        excerpt ||
        `${title} - ${author.name} tarafından yazıldı.`;

    // Trim to recommended length (150-160 chars)
    const finalDescription =
        description.length > 160
            ? description.substring(0, 157) + "..."
            : description;

    // Image for Open Graph (priority: ogImage > featuredImage > default)
    const socialImage = ogImage || featuredImage || DEFAULT_OG_IMAGE;
    const absoluteImageUrl = socialImage.startsWith("http")
        ? socialImage
        : `${SITE_URL}${socialImage}`;

    // Full article URL
    const articleUrl = `${SITE_URL}/yazilar/${slug}`;

    // Keywords array
    const keywords = metaKeywords
        ? metaKeywords.split(",").map((k) => k.trim())
        : [title, author.name, "Hayattan.Net"];

    return {
        title: `${title} | ${SITE_NAME}`,
        description: finalDescription,
        keywords,
        authors: [{ name: author.name }],
        creator: author.name,
        publisher: SITE_NAME,
        alternates: {
            canonical: articleUrl,
        },
        openGraph: {
            type: "article",
            url: articleUrl,
            title,
            description: finalDescription,
            siteName: SITE_NAME,
            images: [
                {
                    url: absoluteImageUrl,
                    width: 1200,
                    height: 630,
                    alt: imageAlt || title,
                },
            ],
            publishedTime: publishedAt?.toISOString(),
            modifiedTime: updatedAt.toISOString(),
            authors: [author.name],
            locale: "tr_TR",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: finalDescription,
            images: [absoluteImageUrl],
            creator: `@${SITE_NAME}`, // Twitter handle varsa buraya ekleyin
        },
        robots: {
            index: !!publishedAt, // Sadece yayınlanmış yazılar index edilsin
            follow: true,
            googleBot: {
                index: !!publishedAt,
                follow: true,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

/**
 * Generate JSON-LD structured data for Article
 * Schema.org markup for rich results in Google
 */
export function generateArticleSchema(yazi: YaziSEOData) {
    const {
        title,
        excerpt,
        metaDescription,
        featuredImage,
        slug,
        author,
        publishedAt,
        updatedAt,
    } = yazi;

    const description = metaDescription || excerpt || title;
    const articleUrl = `${SITE_URL}/yazilar/${slug}`;
    const imageUrl = featuredImage
        ? featuredImage.startsWith("http")
            ? featuredImage
            : `${SITE_URL}${featuredImage}`
        : DEFAULT_OG_IMAGE;

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image: imageUrl,
        author: {
            "@type": "Person",
            name: author.name,
        },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/logo.png`, // Logo eklerseniz buraya path verin
            },
        },
        datePublished: publishedAt?.toISOString(),
        dateModified: updatedAt.toISOString(),
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
        },
    };
}

/**
 * Generate default site metadata (for home, category pages, etc.)
 */
export function generateDefaultMetadata(
    title?: string,
    description?: string
): Metadata {
    return {
        title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
        description:
            description ||
            "Hayattan.Net - Güncel haberler, köşe yazıları ve analizler",
        keywords: ["haber", "güncel", "yazarlar", "analiz", "Türkiye"],
        openGraph: {
            type: "website",
            siteName: SITE_NAME,
            locale: "tr_TR",
            images: [DEFAULT_OG_IMAGE],
        },
        twitter: {
            card: "summary_large_image",
            creator: `@${SITE_NAME}`,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

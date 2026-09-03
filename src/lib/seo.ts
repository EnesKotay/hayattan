import { Metadata } from "next";
import { createExcerptFromHtml } from "@/lib/article-utils";

type YaziSEOData = {
    title: string;
    excerpt?: string | null;
    content?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    featuredImage?: string | null;
    ogImage?: string | null;
    imageAlt?: string | null;
    slug: string;
    author: { name: string; slug?: string };
    kategoriler?: { name: string }[];
    etiketler?: { name: string }[];
    publishedAt?: Date | null;
    updatedAt: Date;
};

const SITE_NAME = "Hayattan.Net";
const FALLBACK_SITE_URL = "https://hayattan.net";

function normalizeSiteUrl(value: string | undefined) {
    const candidate = value?.trim() || FALLBACK_SITE_URL;
    const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

    try {
        return new URL(withProtocol).origin;
    } catch {
        return FALLBACK_SITE_URL;
    }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`; // Varsayılan OG görseli
const SITE_LOGO = `${SITE_URL}/logo.png`;
const TWITTER_HANDLE = "@HayattanNet";

/** Footer'daki sosyal hesaplarla aynı liste — schema.org sameAs için */
const SOCIAL_PROFILES = [
    "https://www.facebook.com/Hayattan.Net2020",
    "https://twitter.com/HayattanNet",
    "https://www.instagram.com/hayattannet/",
    "https://www.youtube.com/channel/UCO44ksBz7R6TYV7fCA6u0Gw",
];

/** Relative site paths become canonical absolute URLs; external URLs stay intact. */
export function toAbsoluteUrl(value: string) {
    if (/^https?:\/\//i.test(value)) return value;
    return new URL(value.startsWith("/") ? value : `/${value}`, `${SITE_URL}/`).toString();
}

/** Next.js'in JSON-LD rehberindeki XSS korumasını bütün şemalara uygular. */
export function serializeJsonLd(value: unknown) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Meta description üretir: elle girilen metaDescription → excerpt → içerikten
 * otomatik özet. Son çare olarak başlık kullanılır.
 */
function buildDescription(yazi: Pick<YaziSEOData, "title" | "excerpt" | "content" | "metaDescription">) {
    const source =
        yazi.metaDescription?.trim() ||
        yazi.excerpt?.trim() ||
        createExcerptFromHtml(yazi.content, 160).trim() ||
        yazi.title;

    return source.length > 160 ? `${source.slice(0, 157).trimEnd()}...` : source;
}

/**
 * Generate Next.js Metadata for a Yazi (article)
 * Includes: meta description, Open Graph, Twitter Card, keywords
 */
export function generateYaziMetadata(yazi: YaziSEOData): Metadata {
    const {
        title,
        metaKeywords,
        featuredImage,
        ogImage,
        imageAlt,
        slug,
        author,
        publishedAt,
        updatedAt,
    } = yazi;

    const finalDescription = buildDescription(yazi);

    // Image for Open Graph (priority: ogImage > featuredImage > dynamic OG)
    const dynamicOgUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author.name)}`;
    const socialImage = ogImage || featuredImage || dynamicOgUrl;
    const absoluteImageUrl = toAbsoluteUrl(socialImage);

    // Boyutu yalnızca ölçüsünü bildiğimiz görsel için beyan ediyoruz. Yazının kendi
    // görseli herhangi bir oranda olabiliyor; yanlış 1200x630 beyanı paylaşımlarda
    // kırpık/bozuk önizlemeye yol açıyordu.
    const isGeneratedOg = socialImage === dynamicOgUrl;
    const ogImageEntry = {
        url: absoluteImageUrl,
        alt: imageAlt || title,
        ...(isGeneratedOg ? { width: 1200, height: 630 } : {}),
    };

    // Full article URL
    const articleUrl = toAbsoluteUrl(`/yazilar/${slug}`);

    // Keywords array
    const keywords = metaKeywords
        ? metaKeywords.split(",").map((k) => k.trim())
        : [title, author.name, "Hayattan.Net"];

    return {
        // Not: root layout'taki `template: "%s | Hayattan.Net"` soneki kendisi ekliyor.
        title,
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
            images: [ogImageEntry],
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
            site: TWITTER_HANDLE,
            creator: TWITTER_HANDLE,
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
        content,
        featuredImage,
        ogImage,
        imageAlt,
        slug,
        author,
        kategoriler,
        etiketler,
        publishedAt,
        updatedAt,
    } = yazi;

    const articleUrl = toAbsoluteUrl(`/yazilar/${slug}`);
    const rawImage = ogImage || featuredImage;
    const imageUrl = rawImage ? toAbsoluteUrl(rawImage) : DEFAULT_OG_IMAGE;

    // Google, gövde metnini kelime sayısı ve okuma süresi sinyali olarak kullanıyor
    const plainText = content ? createExcerptFromHtml(content, Number.MAX_SAFE_INTEGER) : "";
    const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : undefined;

    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title.length > 110 ? `${title.slice(0, 107)}...` : title,
        description: buildDescription(yazi),
        image: {
            "@type": "ImageObject",
            url: imageUrl,
            caption: imageAlt || title,
        },
        author: {
            "@type": "Person",
            name: author.name,
            ...(author.slug ? { url: toAbsoluteUrl(`/yazarlar/${author.slug}`) } : {}),
        },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
                "@type": "ImageObject",
                url: SITE_LOGO,
                width: 600,
                height: 600,
            },
        },
        datePublished: publishedAt?.toISOString(),
        dateModified: updatedAt.toISOString(),
        inLanguage: "tr-TR",
        isAccessibleForFree: true,
        ...(wordCount ? { wordCount } : {}),
        ...(kategoriler?.length ? { articleSection: kategoriler.map((k) => k.name) } : {}),
        ...(etiketler?.length ? { keywords: etiketler.map((e) => e.name).join(", ") } : {}),
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
        },
    };
}

/**
 * Yazar sayfaları için ProfilePage + Person yapılandırılmış verisi.
 * Google'ın E-E-A-T sinyalleri için yazar kimliğini netleştirir.
 */
export function generateAuthorSchema(yazar: {
    name: string;
    slug: string;
    bio?: string | null;
    photo?: string | null;
    yaziSayisi?: number;
}) {
    const profileUrl = toAbsoluteUrl(`/yazarlar/${yazar.slug}`);
    const photo = yazar.photo ? toAbsoluteUrl(yazar.photo) : undefined;

    return {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": profileUrl,
        url: profileUrl,
        inLanguage: "tr-TR",
        mainEntity: {
            "@type": "Person",
            name: yazar.name,
            url: profileUrl,
            ...(yazar.bio ? { description: createExcerptFromHtml(yazar.bio, 300) } : {}),
            ...(photo ? { image: photo } : {}),
            worksFor: {
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
            },
        },
    };
}

export function generateBreadcrumbSchema(items: { label: string; href: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: item.href,
        })),
    };
}

export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: "Hayattan",
        url: SITE_URL,
        description: "Hayatın Engelsiz Tarafı — kültür, sanat, edebiyat ve engelsiz yaşam yazıları.",
        logo: {
            "@type": "ImageObject",
            url: SITE_LOGO,
            width: 600,
            height: 600,
        },
        sameAs: SOCIAL_PROFILES,
    };
}

/**
 * Ana sayfa için WebSite şeması — Google'ın sitelinks arama kutusu için.
 */
export function generateWebSiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "tr-TR",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/arama?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
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
        // Sonek root layout'taki title template'inden geliyor
        title: title ?? SITE_NAME,
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
            site: TWITTER_HANDLE,
            creator: TWITTER_HANDLE,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

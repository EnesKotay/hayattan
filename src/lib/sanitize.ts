/**
 * Input Sanitization & Validation Utility
 * Protects against XSS, HTML injection, and other input-based attacks
 */

import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            "p",
            "br",
            "strong",
            "em",
            "b",
            "i",
            "u",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "ul",
            "ol",
            "li",
            "a",
            "img",
            "audio",
            "video",
            "source",
            "blockquote",
            "code",
            "pre",
            "span",
            "div",
            "iframe",
        ],
        ALLOWED_ATTR: [
            "href", "src", "alt", "title", "class", "id", "target", "controls", "preload",
            "width", "height", "frameborder", "allow", "allowfullscreen", "style"
        ],
        ALLOW_DATA_ATTR: false,
    });
}

/**
 * Sanitize HTML for ad slots (more permissive for scripts)
 */
export function sanitizeAdHtml(dirty: string): string {
    // For ad slots, we need to allow scripts (AdSense, etc.)
    // But we still sanitize to prevent obvious XSS
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ["script", "ins", "div", "iframe", "img", "a"],
        ALLOWED_ATTR: [
            "src",
            "async",
            "data-ad-client",
            "data-ad-slot",
            "data-ad-format",
            "data-full-width-responsive",
            "class",
            "id",
            "style",
            "width",
            "height",
            "frameborder",
            "href",
            "target",
        ],
        ALLOW_DATA_ATTR: true,
    });
}

/**
 * Sanitize plain text (strip all HTML)
 */
export function sanitizeText(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        // Only allow http and https
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }
        return parsed.toString();
    } catch {
        // If not a full URL, check if it's a relative path
        if (url.startsWith("/")) {
            return url;
        }
        return null;
    }
}

/**
 * Zod schemas for common validations
 */
export const schemas = {
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    slug: z
        .string()
        .min(1, "Slug boş olamaz")
        .max(200, "Slug çok uzun")
        .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
    url: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
    title: z.string().min(1, "Başlık boş olamaz").max(500, "Başlık çok uzun"),
    content: z.string().min(1, "İçerik boş olamaz"),
    excerpt: z.string().max(1000, "Özet çok uzun").optional(),
    name: z.string().min(1, "Ad boş olamaz").max(200, "Ad çok uzun"),
    password: z
        .string()
        .min(8, "Şifre en az 8 karakter olmalıdır")
        .max(100, "Şifre çok uzun"),
};

/**
 * Validate form data with Zod schema
 */
export function validateFormData<T extends z.ZodType>(
    schema: T,
    data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
    try {
        const parsed = schema.parse(data);
        return { success: true, data: parsed };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`),
            };
        }
        return { success: false, errors: ["Validation failed"] };
    }
}

/**
 * Safe slug generation from Turkish text
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Sanitize filename for uploads
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/\.+/g, ".")
        .substring(0, 255);
}

/**
 * Check if string contains SQL injection patterns
 * Note: Prisma already protects against SQL injection, this is extra validation
 */
export function hasSqlInjectionPattern(input: string): boolean {
    const sqlPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL meta-characters
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i, // Modified SQL
        /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // union, or
        /((\%27)|(\'))union/i, // UNION
        /exec(\s|\+)+(s|x)p\w+/i, // Stored procedure
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check if string contains XSS patterns
 */
export function hasXssPattern(input: string): boolean {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // event handlers like onclick=
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
}

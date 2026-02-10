/**
 * Shared Type Definitions
 * 
 * This file contains all shared types used across the application.
 * Import these instead of creating duplicate types in different files.
 */

// ============================================
// USER & AUTHENTICATION
// ============================================

export type User = {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

export type AuthUser = {
    id: string;
    email: string;
    name: string;
};

// ============================================
// CONTENT TYPES
// ============================================

export type Yazar = {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    photo: string | null;
    biyografi: string | null;
    misafir: boolean;
    ayrilmis: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type Kategori = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type Yazi = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featuredImage: string | null;
    imageAlt: string | null;
    publishedAt: Date | null;
    showInSlider: boolean;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    // SEO fields
    metaDescription: string | null;
    metaKeywords: string | null;
    ogImage: string | null;
};

export type YaziWithRelations = Yazi & {
    author: Pick<Yazar, "id" | "name" | "slug" | "photo">;
    kategoriler: Pick<Kategori, "id" | "name" | "slug">[];
};

// SEO-specific type for metadata generation
export type YaziSEOData = {
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    imageAlt: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
    metaDescription: string | null;
    metaKeywords: string | null;
    ogImage: string | null;
    author: {
        name: string;
    };
};

export type Haber = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    image: string | null;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
};

// ============================================
// FORM TYPES
// ============================================

export type YaziFormData = {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    imageAlt?: string;
    showInSlider: boolean;
    authorId: string;
    kategoriIds: string[];
    publishedAt?: Date | null;
    // SEO
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
};

export type KategoriFormData = {
    name: string;
    slug: string;
    description?: string;
};

export type YazarFormData = {
    name: string;
    slug: string;
    email?: string;
    photo?: string;
    biyografi?: string;
    misafir: boolean;
};

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

// ============================================
// SECURITY TYPES
// ============================================

export type SecurityEvent = {
    id: string;
    type: "LOGIN_ATTEMPT" | "RATE_LIMIT" | "INVALID_INPUT" | "UNAUTHORIZED_ACCESS";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    userId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    details: string | null;
    createdAt: Date;
};

export type RateLimitResult = {
    success: boolean;
    remaining?: number;
    resetAt?: Date;
};

// ============================================
// SEO TYPES
// ============================================

export type MetadataConfig = {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
    canonical?: string;
};

export type ArticleSchema = {
    "@context": string;
    "@type": string;
    headline: string;
    description: string;
    image: string | string[];
    datePublished: string;
    dateModified: string;
    author: {
        "@type": string;
        name: string;
    };
    publisher: {
        "@type": string;
        name: string;
        logo: {
            "@type": string;
            url: string;
        };
    };
};

// ============================================
// UTILITY TYPES
// ============================================

// Make all properties optional recursively
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Make specific keys required
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Omit specific keys
export type OmitKeys<T, K extends keyof T> = Omit<T, K>;

// Pick specific keys and make them required
export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

// ============================================
// CONSTANTS
// ============================================

export const SITE_CONFIG = {
    NAME: "Hayattan.Net",
    URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    DESCRIPTION: "Güncel haberler, yazılar ve analizler",
    DEFAULT_OG_IMAGE: "/og-image.jpg",
} as const;

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

export const FILE_UPLOAD = {
    MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;

export const RATE_LIMITS = {
    LOGIN: {
        MAX_ATTEMPTS: 5,
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
    API: {
        MAX_REQUESTS: 100,
        WINDOW_MS: 60 * 1000, // 1 minute
    },
    ADMIN: {
        MAX_REQUESTS: 200,
        WINDOW_MS: 60 * 1000, // 1 minute
    },
} as const;

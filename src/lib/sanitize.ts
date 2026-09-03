/**
 * Central input sanitization and validation helpers.
 * Rich text is parsed with an explicit allowlist; regex is not a safe HTML parser.
 */

import sanitize from "sanitize-html";
import { z } from "zod";

const RICH_TEXT_TAGS = [
  "p", "br", "strong", "em", "b", "i", "u", "s",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "a", "img", "audio", "video", "source",
  "blockquote", "code", "pre", "span", "div", "iframe",
];

const RICH_TEXT_ATTRIBUTES: sanitize.IOptions["allowedAttributes"] = {
  "*": ["class", "id"],
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  audio: ["src", "controls", "preload"],
  video: ["src", "controls", "preload", "width", "height", "poster"],
  source: ["src", "type"],
  iframe: ["src", "title", "width", "height", "frameborder", "allow", "allowfullscreen", "loading"],
};

/** Sanitize editor HTML before it is stored or rendered. */
export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty ?? "", {
    allowedTags: RICH_TEXT_TAGS,
    allowedAttributes: RICH_TEXT_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
      source: ["http", "https"],
    },
    allowedIframeHostnames: [
      "youtube.com",
      "www.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
    ],
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
        },
      }),
      iframe: (_tagName, attribs) => ({
        tagName: "iframe",
        attribs: {
          ...attribs,
          loading: "lazy",
          title: attribs.title || "Gömülü video",
        },
      }),
    },
  });
}

/**
 * Advertising snippets are trusted administrator content and may require scripts.
 * This still removes event-handler attributes and unsafe URL schemes.
 */
export function sanitizeAdHtml(dirty: string): string {
  return sanitize(dirty ?? "", {
    allowedTags: [
      ...sanitize.defaults.allowedTags,
      "img", "iframe", "script", "style", "ins",
    ],
    allowedAttributes: {
      "*": ["class", "id", "style", "title", "aria-label", "data-*"],
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      iframe: ["src", "title", "width", "height", "frameborder", "allow", "allowfullscreen", "loading"],
      script: ["src", "type", "async", "defer", "crossorigin"],
      ins: ["class", "style", "data-*"],
    },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
    allowVulnerableTags: true,
    exclusiveFilter: (frame) =>
      Object.keys(frame.attribs).some((attribute) => /^on/i.test(attribute)),
  });
}

/** Strip all markup and return text only. */
export function sanitizeText(dirty: string): string {
  return sanitize(dirty ?? "", { allowedTags: [], allowedAttributes: {} });
}

/** Accept only absolute http(s) URLs or site-relative paths. */
export function sanitizeUrl(url: string): string | null {
  const value = url.trim();
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

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
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır").max(100, "Şifre çok uzun"),
};

export function validateFormData<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
}

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

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".")
    .substring(0, 255);
}

/** Compatibility helpers for callers that also reject suspicious raw input. */
export function hasSqlInjectionPattern(input: string): boolean {
  return [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
  ].some((pattern) => pattern.test(input));
}

export function hasXssPattern(input: string): boolean {
  return /<script\b|javascript:|on\w+\s*=|<iframe|<object|<embed/i.test(input);
}

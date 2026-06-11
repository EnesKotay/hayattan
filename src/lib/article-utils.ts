export type ArticleHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function decodeBasicEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function stripHtml(html: string | null | undefined) {
  if (!html) return "";
  return decodeBasicEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function estimateReadingMinutes(html: string | null | undefined) {
  const wordCount = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 180));
}

export function createHeadingId(text: string, fallback: string) {
  const normalized = text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || fallback;
}

export function extractHeadings(html: string | null | undefined): ArticleHeading[] {
  if (!html) return [];
  const headings: ArticleHeading[] = [];
  const usedIds = new Map<string, number>();
  const headingRegex = /<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    const text = stripHtml(match[2]);
    if (!text) continue;

    const baseId = createHeadingId(text, `baslik-${headings.length + 1}`);
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);

    headings.push({
      id: count > 0 ? `${baseId}-${count + 1}` : baseId,
      text,
      level: Number(match[1]) as 2 | 3,
    });
  }

  return headings;
}

export function addHeadingIds(html: string, headings: ArticleHeading[]) {
  let index = 0;
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, body) => {
    const heading = headings[index];
    index += 1;
    if (!heading) return full;

    const cleanAttrs = String(attrs).replace(/\s+id=(["']).*?\1/g, "");
    return `<h${level}${cleanAttrs} id="${heading.id}">${body}</h${level}>`;
  });
}

export function createExcerptFromHtml(html: string | null | undefined, maxLength = 180) {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

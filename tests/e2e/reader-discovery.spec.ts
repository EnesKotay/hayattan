import { expect, test } from "@playwright/test";
import { parseSearchFilters, searchWhere, searchHref } from "../../src/backend/modules/search/filters";
import { parseReaderCounts } from "../../src/shared/engagement/reader-metrics";

test.use({ actionTimeout: 15000 });
test.setTimeout(90000);
const expectLoaded = expect.configure({ timeout: 30000 });

test("arama parametreleri doğrulanır ve sayfalama filtreleri korur", () => {
  const filters = parseSearchFilters({ q: " hayat ", kategori: "yasam", yazar: "yazar", donem: "30", sirala: "oldest", sayfa: "2" });
  const where = searchWhere(filters, new Date("2026-09-01T00:00:00Z"));
  expect(where.publishedAt).toEqual({ lte: new Date("2026-09-01T00:00:00Z"), gte: new Date("2026-08-02T00:00:00Z") });
  expect(where.author).toEqual({ ayrilmis: false, slug: "yazar" });
  const url = new URL(searchHref(filters, 3), "https://example.com");
  expect(url.searchParams.get("kategori")).toBe("yasam");
  expect(url.searchParams.get("sayfa")).toBe("3");
  expect(parseSearchFilters({ q: ["a", "b"], sayfa: "-4", donem: "bogus", sirala: "wrong" })).toMatchObject({ q: "", page: 1, period: "", sort: "newest" });
  expect(parseReaderCounts('{"start":-1,"complete":2}')).toMatchObject({ start: 0, complete: 2 });
});

test("arama filtreleri kelimesiz kullanılabilir ve boş sonuçtan çıkış sunar", async ({ page }) => {
  await page.goto("/arama", { waitUntil: "domcontentloaded" });
  const category = page.getByRole("combobox", { name: "Konu", exact: true });
  const options = await category.locator("option").evaluateAll(elements => elements.map(element => (element as HTMLOptionElement).value).filter(Boolean));
  expect(options.length).toBeGreaterThan(0);
  await category.selectOption(options[0]);
  await page.getByRole("combobox", { name: "Sıralama", exact: true }).selectOption("oldest");
  await page.getByRole("button", { name: "Ara", exact: true }).click();
  await expect(page).toHaveURL(/kategori=/);
  await expectLoaded(category).toHaveValue(options[0]);
  await expect(page.getByRole("combobox", { name: "Sıralama", exact: true })).toHaveValue("oldest");
  await page.getByRole("searchbox", { name: "Aranacak kelime" }).fill("zzzxxyybulunamaz998877");
  await page.getByRole("button", { name: "Ara", exact: true }).click();
  await expectLoaded(page.getByRole("heading", { name: "Yazı bulunamadı" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Filtreleri kaldır, kelimeyle ara" })).toBeVisible();
});

test("öneriler tekrar etmez; okuma ve tıklama olayları tek kez gönderilir", async ({ page }) => {
  test.setTimeout(90000);
  const events: string[] = [];
  await page.route("**/api/engagement/reader", async route => {
    const body = route.request().postDataJSON();
    events.push(...body.events);
    await route.fulfill({ status: 204 });
  });
  await page.goto("/arama", { waitUntil: "domcontentloaded" });
  await page.locator('article a[href^="/yazilar/"]').first().click();
  const body = page.locator("#article-body");
  await expectLoaded(body).toBeVisible();
  await expectLoaded.poll(() => events.filter(event => event === "start").length).toBe(1);
  // A visible short reading region keeps this test independent of article length.
  await body.evaluate(element => { element.setAttribute("style", "height: 200px; overflow: hidden;"); element.scrollIntoView({ block: "center" }); });
  await expect.poll(() => events.includes("depth75"), { timeout: 10000 }).toBe(true);
  const links = page.locator("a[data-recommendation]");
  const hrefs = await links.evaluateAll(elements => elements.map(element => element.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  expect(new Set(hrefs).size).toBe(hrefs.length);
  const link = links.first();
  const group = await link.getAttribute("data-recommendation");
  await link.scrollIntoViewIfNeeded();
  await expect.poll(() => events.includes(`${group}_view`)).toBe(true);
  // Prevent navigation only in the test while exercising the delegated click handler.
  await link.evaluate(element => element.addEventListener("click", event => event.preventDefault()));
  await link.click();
  await expect.poll(() => events.filter(event => event === `${group}_click`).length).toBe(1);
  await link.click();
  await page.waitForTimeout(1500);
  expect(events.filter(event => event === `${group}_click`)).toHaveLength(1);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  expect(events.filter(event => event === "start")).toHaveLength(1);
});

test("ölçüm API geçersiz olayları reddeder", async ({ request }) => {
  const response = await request.post("/api/engagement/reader", { data: { articleId: "missing", events: ["unknown"] } });
  expect(response.status()).toBe(400);
  const crossSite = await request.post("/api/engagement/reader", { headers: { origin: "https://example.com" }, data: { articleId: "missing", events: ["start"] } });
  expect(crossSite.status()).toBe(403);
});


test("arama önerisi bulunmasa da Enter sonuç sayfasını açar", async ({ page }) => {
  await page.route("**/api/search?**", route => route.fulfill({ json: { results: [] } }));
  await page.goto("/arama", { waitUntil: "domcontentloaded" });
  const input = page.getByRole("combobox", { name: "Arama", exact: true });
  await input.fill("bulunamayankelime");
  await input.press("Enter");
  await expect(page).toHaveURL(/arama\?q=bulunamayankelime/);
});

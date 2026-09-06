import { expect, test } from "@playwright/test";

test.describe("Kamu sayfaları", () => {
  test("ana sayfa temel gezinme bölgelerini sunar", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Hayattan\.Net/);
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.getByRole("link", { name: "İçeriğe atla" })).toBeAttached();
    await expect(page.getByRole("navigation", { name: "Ana navigasyon" })).toBeVisible();
  });

  test("erişilebilirlik bildirimi ve geri bildirim kanalı görünür", async ({ page }) => {
    await page.goto("/erisilebilirlik");

    await expect(page.getByRole("heading", { level: 1, name: "Erişilebilirlik" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Erişilebilirlik geri bildirimi gönder/ })).toHaveAttribute(
      "href",
      /^mailto:/,
    );
  });

  test("hareket azaltma tercihi cihazda saklanır", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Tema seçimi" }).click();
    await page.getByRole("switch", { name: "Hareket efektlerini azalt" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  });

  test("arama sayfası çalışır", async ({ page }) => {
    await page.goto("/arama?q=hayat");
    await expect(page.getByRole("heading", { level: 1, name: "Site içinde ara" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Aranacak kelime" })).toHaveValue("hayat");
  });
});

test("manşet klavye odağından sonra kendiliğinden başlamaz", async ({ page }) => {
  await page.goto("/");
  const slider = page.getByRole("region", { name: "Öne çıkan içerikler" });
  const next = slider.getByRole("button", { name: "Sonraki manşet", exact: true });
  test.skip(await next.count() === 0, "En az iki yayınlanmış manşet gerektirir.");
  await next.focus();
  await expect(slider.getByRole("button", { name: "Otomatik manşet geçişini başlat" })).toBeVisible();
  await page.getByRole("link", { name: "İçeriğe atla" }).focus();
  await page.mouse.move(0, 0);
  const title = await slider.locator("h3").first().textContent();
  await page.waitForTimeout(5500);
  await expect(slider.locator("h3").first()).toHaveText(title!);
  await expect(slider.locator("a button")).toHaveCount(0);
});

test("mobil yazı büyütüldüğünde sayfa yatay taşmaz", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/yazilar");
  const article = page.locator('a[href^="/yazilar/"]').first();
  test.skip(await article.count() === 0, "Yayınlanmış yazı gerektirir.");
  await article.click();
  await page.getByText("Okuma ayarları: yazı boyutu ve kontrast", { exact: true }).click();
  await page.getByRole("button", { name: "En büyük yazı boyutu", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-font-size", "xl");
  await expect(page.getByRole("switch", { name: "Yüksek kontrast", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

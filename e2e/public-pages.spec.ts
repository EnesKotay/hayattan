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

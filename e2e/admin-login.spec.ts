import { expect, test } from "@playwright/test";

test("yönetim giriş formu erişilebilir etiketlere sahiptir", async ({ page }) => {
  await page.goto("/admin/giris");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Yönetim paneline giriş/i);
  await expect(page.getByLabel(/E-posta/i)).toBeVisible();
  await expect(page.getByLabel(/Şifre/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Giriş/i })).toBeVisible();
});

import { test, expect } from '@playwright/test';

test.describe('Admin Giriş', () => {
    test('giriş sayfası yüklenmeli', async ({ page }) => {
        await page.goto('/admin/giris');

        // Sayfada "Yönetim paneline giriş" başlığı olmalı
        await expect(page.locator('h1')).toContainText(/Yönetim paneline giriş/i);

        // Form elemanları olmalı
        await expect(page.getByLabel(/E-posta adresiniz/i)).toBeVisible();
        await expect(page.getByLabel(/Şifreniz/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /Giriş yap/i })).toBeVisible();
    });

    test('hatalı giriş ile uyarı vermeli', async ({ page }) => {
        await page.goto('/admin/giris');
        await page.getByLabel(/E-posta adresiniz/i).fill('hatali@email.com');
        await page.getByLabel(/Şifreniz/i).fill('yanlis-sifre');
        await page.getByRole('button', { name: /Giriş yap/i }).click();

        // Hata mesajı kontrolü
        await expect(page.locator('div')).toContainText(/E-posta veya şifre hatalı/i);
    });
});

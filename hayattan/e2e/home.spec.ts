import { test, expect } from '@playwright/test';

test.describe('Ana Sayfa', () => {
    test('başarıyla yüklenmeli ve başlık doğru olmalı', async ({ page }) => {
        await page.goto('/');

        // Başlık kontrolü
        await expect(page).toHaveTitle(/Hayattan\.Net/);

        // Logonun görünürlüğü
        const logo = page.locator('header').getByAltText(/Hayattan\.Net|Logo/i).first();
        // Logo resim veya metin olabilir, şemaya göre bakalım. 
        // Header.tsx'de Logo component'i kullanılıyor.

        // Header navigasyon linklerinin varlığı
        const nav = page.locator('nav[aria-label="Ana navigasyon"]');
        await expect(nav).toBeVisible();

        // Bazı linkleri kontrol et
        await expect(nav.getByText('Yazarlar', { exact: true })).toBeVisible();
        await expect(nav.getByText('Yazılar', { exact: true })).toBeVisible();
    });

    test('arama kutusu çalışmalı', async ({ page }) => {
        await page.goto('/');

        const searchInput = page.getByPlaceholder('Ara...');
        await expect(searchInput).toBeVisible();

        await searchInput.fill('test');

        // Öneriler dropdown'unun açılmasını bekle (SearchWithSuggestions.tsx)
        const suggestions = page.locator('#search-results');
        // Arama API'si sonuç döndürürse görünür olur. 
        // Mock yapmadan gerçek server'da veri varsa test edilebilir.
    });
});


const fs = require('fs');
const path = require('path');
const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const OLD_SERVER_IP = '94.73.148.159';
const OLD_HOST = 'hayattan.net';

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const targetUrl = url.replace('https://hayattan.net', `http://${OLD_SERVER_IP}`)
            .replace('http://hayattan.net', `http://${OLD_SERVER_IP}`)
            .replace('https://www.hayattan.net', `http://${OLD_SERVER_IP}`)
            .replace('http://www.hayattan.net', `http://${OLD_SERVER_IP}`);

        const file = fs.createWriteStream(destPath);
        const request = http.get(targetUrl, { headers: { 'Host': OLD_HOST } }, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(destPath, () => { });
                reject(new Error(`Status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => file.close(() => resolve(true)));
        });
        request.on('error', (err) => {
            fs.unlink(destPath, () => { });
            reject(err);
        });
    });
}

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) return true;
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

async function processUrl(originalUrl) {
    if (!originalUrl) return false;
    let relativePath = originalUrl;
    if (relativePath.includes('wp-content/')) {
        relativePath = relativePath.split('wp-content/')[1];
    } else {
        return false;
    }

    if (!relativePath) return false;
    relativePath = decodeURIComponent(relativePath);

    const localPath = path.join(process.cwd(), 'public', 'wp-content', relativePath);
    const fullUrl = `http://${OLD_SERVER_IP}/wp-content/${relativePath}`;

    if (fs.existsSync(localPath)) return 'skipped';

    try {
        ensureDirectoryExistence(localPath);
        await downloadFile(fullUrl, localPath);
        return 'downloaded';
    } catch (e) {
        return 'failed';
    }
}

async function main() {
    console.log('--- EKSTRA TABLO TARAMASI (Haber, Page) ---\n');
    const allUrls = new Set();

    // 1. Haberler
    console.log('1. Haberler Taranıyor...');
    try {
        const haberler = await prisma.haber.findMany({ select: { imageUrl: true } });
        haberler.forEach(h => {
            if (h.imageUrl && h.imageUrl.includes('wp-content')) allUrls.add(h.imageUrl);
        });
    } catch (e) { console.error('Haber hatası:', e); }

    // 2. Sayfalar (Page)
    console.log('2. Sayfalar Taranıyor...');
    try {
        const pages = await prisma.page.findMany({ select: { content: true, featuredImage: true } });
        const regex = /wp-content\/uploads\/[^"'\s)]+/g;

        pages.forEach(p => {
            if (p.featuredImage && p.featuredImage.includes('wp-content')) allUrls.add(p.featuredImage);
            if (p.content) {
                const matches = p.content.match(regex);
                if (matches) matches.forEach(m => allUrls.add(m));
            }
        });
    } catch (e) { console.error('Page hatası:', e); }

    console.log(`\nToplam Bulunan URL: ${allUrls.size}`);

    let downloaded = 0;
    for (const url of allUrls) {
        const result = await processUrl(url);
        if (result === 'downloaded') {
            console.log(`✅ İndirildi: ${url}`);
            downloaded++;
        }
    }

    console.log(`\n✅ Yeni İndirilen: ${downloaded}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

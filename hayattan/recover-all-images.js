
const fs = require('fs');
const path = require('path');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();
const OLD_SERVER_IP = '94.73.148.159';
const OLD_HOST = 'hayattan.net';

// Helper to download file
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const targetUrl = url.replace('https://hayattan.net', `http://${OLD_SERVER_IP}`)
            .replace('http://hayattan.net', `http://${OLD_SERVER_IP}`)
            .replace('https://www.hayattan.net', `http://${OLD_SERVER_IP}`)
            .replace('http://www.hayattan.net', `http://${OLD_SERVER_IP}`);

        const file = fs.createWriteStream(destPath);

        const request = http.get(targetUrl, {
            headers: { 'Host': OLD_HOST }
        }, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(destPath, () => { });
                reject(new Error(`Status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(true));
            });
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

    // Normalize URL to be relative path starting with uploads/
    let relativePath = originalUrl;
    if (relativePath.includes('wp-content/')) {
        relativePath = relativePath.split('wp-content/')[1];
    }

    if (!relativePath) return false;
    relativePath = decodeURIComponent(relativePath);

    const localPath = path.join(process.cwd(), 'public', 'wp-content', relativePath);
    const fullUrl = `http://${OLD_SERVER_IP}/wp-content/${relativePath}`;

    if (fs.existsSync(localPath)) {
        return 'skipped';
    }

    try {
        ensureDirectoryExistence(localPath);
        await downloadFile(fullUrl, localPath);
        return 'downloaded';
    } catch (e) {
        // console.log(`Failed: ${relativePath} (${e.message})`);
        return 'failed';
    }
}


async function main() {
    console.log('--- KAPSAMLI RESİM KURTARMA BAŞLIYOR ---\n');

    const allUrls = new Set();

    // 1. missing-images.txt dosyasını oku
    console.log('1. Kullanıcı Logları Taranıyor...');
    if (fs.existsSync('missing-images.txt')) {
        const fileStream = fs.createReadStream('missing-images.txt');
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            if (line.trim()) allUrls.add(line.trim());
        }
    }

    // 2. Veritabanı İçerik Taraması (Yazi)...
    console.log('2. Veritabanı İçerik Taraması (Yazi)...');
    try {
        const yazilar = await prisma.yazi.findMany({
            where: { content: { contains: 'wp-content' } },
            select: { content: true }
        });

        // Regex genişletildi: Yıl/Ay zorunluluğu kaldırıldı, tüm uploads klasörü hedeflendi
        const regex = /wp-content\/uploads\/[^"'\s)]+/g;

        yazilar.forEach(y => {
            if (!y.content) return;
            const matches = y.content.match(regex);
            if (matches) matches.forEach(m => allUrls.add(m));
        });
    } catch (err) {
        console.error('Yazi tarama hatası:', err);
    }

    // 3. Yazar biyografisi ve fotoğrafı
    console.log('3. Yazar Taraması...');
    try {
        const yazarlar = await prisma.yazar.findMany({ select: { photo: true, biyografi: true } });
        const regex = /wp-content\/uploads\/[^"'\s)]+/g;

        yazarlar.forEach(y => {
            if (y.photo && y.photo.includes('wp-content')) allUrls.add(y.photo);
            if (y.biyografi) {
                const matches = y.biyografi.match(regex);
                if (matches) matches.forEach(m => allUrls.add(m));
            }
        });
    } catch (err) {
        console.error('Yazar tarama hatası:', err);
    }

    console.log(`\nTOPLAM BULUNAN BENZERSİZ URL SAYISI: ${allUrls.size}`);
    console.log('İndirme işlemi başlıyor (Bu işlem biraz sürebilir)...\n');

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    let processed = 0;
    // Convert Set to Array for iteration to avoid issues
    const urlArray = Array.from(allUrls);
    const total = urlArray.length;

    for (const url of urlArray) {
        processed++;
        if (processed % 10 === 0) process.stdout.write(`Progress: ${processed}/${total} | DL: ${downloaded} | Skip: ${skipped} | Fail: ${failed}\r`);

        const result = await processUrl(url);
        if (result === 'downloaded') {
            // console.log(`✅ İndirildi: ${url}`);
            downloaded++;
        } else if (result === 'skipped') {
            skipped++;
        } else {
            failed++;
        }
    }

    console.log('\n--- SONUÇ ---');
    console.log(`✅ İndirilen: ${downloaded}`);
    console.log(`⏭️  Atlanan (Zaten Var): ${skipped}`);
    console.log(`❌ Hata/Bulunamayan: ${failed}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

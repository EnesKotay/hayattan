
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { promisify } from 'util';
import { pipeline } from 'stream';

const prisma = new PrismaClient();
const streamPipeline = promisify(pipeline);

const OLD_SERVER_IP = '94.73.148.159'; // Old server IP
const BASE_URL_PATTERN = /^https?:\/\/(?:www\.)?(?:hayattan\.net|localhost:\d+)/i;

async function downloadFile(url: string, destPath: string): Promise<boolean> {
    // Construct the direct URL to the old server
    // Original: https://hayattan.net/wp-content/uploads/2020/06/image.jpg
    // Target: http://94.73.148.159/wp-content/uploads/2020/06/image.jpg

    let relativePath = url;
    if (BASE_URL_PATTERN.test(url)) {
        relativePath = url.replace(BASE_URL_PATTERN, '');
    } else if (url.startsWith('/')) {
        relativePath = url;
    } else {
        // External URL or invalid
        return false;
    }

    // Only handle wp-content/uploads
    if (!relativePath.includes('/wp-content/uploads/')) {
        return false;
    }

    const downloadUrl = `http://${OLD_SERVER_IP}${relativePath}`;

    try {
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // console.log(`Downloading: ${downloadUrl} -> ${destPath}`);

        return new Promise((resolve) => {
            const options = {
                hostname: OLD_SERVER_IP,
                path: relativePath,
                headers: {
                    'Host': 'hayattan.net'
                }
            };

            const request = http.get(options, (response) => {
                if (response.statusCode !== 200) {
                    // console.warn(`Failed to download (Status ${response.statusCode}): ${downloadUrl}`);
                    resolve(false);
                    return;
                }

                const fileStream = fs.createWriteStream(destPath);
                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(true);
                });

                fileStream.on('error', (err) => {
                    console.error(`Error writing file: ${err.message}`);
                    fs.unlink(destPath, () => { }); // Delete imperfect file
                    resolve(false);
                });
            });

            request.on('error', (err) => {
                // console.error(`Request error: ${err.message}`);
                resolve(false);
            });
        });

    } catch (error) {
        console.error(`Unexpected error for ${url}:`, error);
        return false;
    }
}

function getLocalPath(url: string): string | null {
    let relativePath = url;
    if (BASE_URL_PATTERN.test(url)) {
        relativePath = url.replace(BASE_URL_PATTERN, '');
    } else if (url.startsWith('/')) {
        relativePath = url;
    } else {
        return null;
    }

    // Remove query params if any
    relativePath = relativePath.split('?')[0];

    // Decode URI component (e.g. %20 -> space)
    try {
        relativePath = decodeURIComponent(relativePath);
    } catch (e) {
        // ignore error
    }

    if (relativePath.startsWith('/wp-content/uploads/')) {
        return path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''));
    }
    return null;
}

function extractImageUrls(content: string): string[] {
    if (!content) return [];
    const urls: string[] = [];
    // Match src="..."
    const imgRegex = /src=["']([^"']+)["']/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
        urls.push(match[1]);
    }
    return urls;
}

async function main() {
    console.log('Starting image sync from old server...');

    const allUrls = new Set<string>();

    // 1. Yazilar
    console.log('Fetching Yazilar...');
    const yazilar = await prisma.yazi.findMany({
        select: { featuredImage: true, content: true },
    });
    yazilar.forEach(y => {
        if (y.featuredImage) allUrls.add(y.featuredImage);
        extractImageUrls(y.content).forEach(u => allUrls.add(u));
    });

    // 2. Haberler
    console.log('Fetching Haberler...');
    const haberler = await prisma.haber.findMany({
        select: { imageUrl: true },
    });
    haberler.forEach(h => {
        if (h.imageUrl) allUrls.add(h.imageUrl);
    });

    // 3. Yazarlar
    console.log('Fetching Yazarlar...');
    const yazarlar = await prisma.yazar.findMany({
        select: { photo: true },
    });
    yazarlar.forEach(y => {
        if (y.photo) allUrls.add(y.photo);
    });

    // 4. Pages
    console.log('Fetching Pages...');
    const pages = await prisma.page.findMany({
        select: { featuredImage: true, content: true },
    });
    pages.forEach(p => {
        if (p.featuredImage) allUrls.add(p.featuredImage);
        extractImageUrls(p.content).forEach(u => allUrls.add(u));
    });

    console.log(`Total unique image URLs found in DB: ${allUrls.size}`);

    let missingCount = 0;
    let downloadedCount = 0;
    let failedCount = 0;
    let existingCount = 0;

    const queue = Array.from(allUrls);

    // Process in chunks to avoid overwhelming connections
    const CHUNK_SIZE = 20;

    for (let i = 0; i < queue.length; i += CHUNK_SIZE) {
        const chunk = queue.slice(i, i + CHUNK_SIZE);

        await Promise.all(chunk.map(async (url) => {
            const localPath = getLocalPath(url);

            if (!localPath) {
                // Not a local wp-content image
                return;
            }

            if (fs.existsSync(localPath)) {
                existingCount++;
                return;
            }

            missingCount++;
            // console.log(`Missing: ${localPath}`);

            const success = await downloadFile(url, localPath);
            if (success) {
                console.log(`✓ Recovered: ${path.basename(localPath)}`);
                downloadedCount++;
            } else {
                console.log(`✗ Failed to recover: ${url}`);
                failedCount++;
            }
        }));

        // progress
        process.stdout.write(`Processed ${Math.min(i + CHUNK_SIZE, queue.length)}/${queue.length}\r`);
    }

    console.log('\nSync Complete.');
    console.log(`Existing: ${existingCount}`);
    console.log(`Newly Downloaded: ${downloadedCount}`);
    console.log(`Failed: ${failedCount}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

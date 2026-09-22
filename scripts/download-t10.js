const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://playorna.com';

function toSnakeCase(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(destPath)) {
            resolve();
            return;
        }
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', (err) => {
                fs.unlink(destPath, () => reject(err));
            });
        }).on('error', reject);
    });
}

function fetchPageJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch page ${url}: ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/<script id="codex-bootstrap" type="application\/json">([\s\S]*?)<\/script>/);
                if (match && match[1]) {
                    try {
                        const json = JSON.parse(match[1]);
                        resolve(json);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error('JSON not found in HTML'));
                }
            });
        }).on('error', reject);
    });
}

async function scrapeCategory(categoryUrl, outputDir) {
    let page = 1;
    let totalPages = 1;
    let itemsDownloaded = 0;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    while (page <= totalPages) {
        const url = `${categoryUrl}&p=${page}`;
        console.log(`Fetching ${url}...`);
        
        try {
            const data = await fetchPageJSON(url);
            totalPages = data.pages || 1;
            
            for (const item of data.results) {
                const fileName = toSnakeCase(item.name) + '.png';
                const destPath = path.join(outputDir, fileName);
                
                let spriteUrl = item.sprite;
                if (!spriteUrl.startsWith('http')) {
                    spriteUrl = BASE_URL + spriteUrl;
                }
                
                try {
                    await downloadImage(spriteUrl, destPath);
                    itemsDownloaded++;
                } catch (err) {
                    console.error(`Failed to download sprite for ${item.name}: ${err.message}`);
                }
            }
            
            page++;
            // Small delay to be polite
            await new Promise(r => setTimeout(r, 500));
        } catch (err) {
            console.error(`Error processing page ${page}:`, err);
            break;
        }
    }
    
    return itemsDownloaded;
}

async function main() {
    console.log("Starting T10 items download...");
    
    const armorsDir = path.join(__dirname, '..', 'resources', 'items', '★ 10', 'armors');
    const weaponsDir = path.join(__dirname, '..', 'resources', 'items', '★ 10', 'weapons');
    
    const armorsUrl = 'https://playorna.com/codex/items/?lang=en&t=10&c=armor';
    const weaponsUrl = 'https://playorna.com/codex/items/?lang=en&t=10&c=weapon';
    
    const armorsCount = await scrapeCategory(armorsUrl, armorsDir);
    console.log(`Downloaded ${armorsCount} armors.`);
    
    const weaponsCount = await scrapeCategory(weaponsUrl, weaponsDir);
    console.log(`Downloaded ${weaponsCount} weapons.`);
}

main().catch(console.error);

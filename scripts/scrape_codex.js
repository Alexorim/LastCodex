import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  'items',
  'monsters',
  'bosses',
  'raids',
  'followers',
  'spells',
  'buildings',
  'dungeons',
  'classes'
];

const BASE_URL = 'https://playorna.com';
const CONCURRENCY = 5;

// Delay helper to avoid hammering server
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPage(category, page, lang) {
  const url = `${BASE_URL}/codex/${category}/?p=${page}&lang=${lang}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': lang === 'es' ? 'es-ES,es;q=0.9,en;q=0.8' : 'en-US,en;q=0.9'
        }
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} for ${url}`);
      }
      const html = await resp.text();
      const startTag = '<script id="codex-bootstrap" type="application/json">';
      const idx = html.indexOf(startTag);
      if (idx === -1) {
        throw new Error(`No bootstrap script found on ${url}`);
      }
      const jsonEnd = html.indexOf('</script>', idx);
      const jsonStr = html.slice(idx + startTag.length, jsonEnd);
      return JSON.parse(jsonStr);
    } catch (err) {
      console.warn(`[Attempt ${attempt}/3] Error fetching ${category} p=${page} (${lang}): ${err.message}`);
      if (attempt === 3) return null;
      await sleep(1000 * attempt);
    }
  }
  return null;
}

// Simple worker pool
async function mapConcurrent(items, limit, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      try {
        const res = await fn(current);
        results.push(res);
      } catch (e) {
        console.error(`Error processing item`, e);
      }
      await sleep(100); // small throttle
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function scrapeAll() {
  console.log('🚀 Starting PlayOrna Codex Scraping...');
  const startTime = Date.now();

  const esEntriesMap = new Map(); // key: url or id -> entry
  const enEntriesMap = new Map(); // key: url or id -> entry

  for (const category of CATEGORIES) {
    console.log(`\n📦 Category: [${category.toUpperCase()}]`);
    // 1. Get first page to know page count
    const firstEs = await fetchPage(category, 1, 'es');
    if (!firstEs) {
      console.error(`❌ Failed to fetch first page for ${category}`);
      continue;
    }

    const totalPages = firstEs.pages || 1;
    const totalCount = firstEs.count || (firstEs.results ? firstEs.results.length : 0);
    console.log(`   Count: ${totalCount} entries | Pages: ${totalPages}`);

    // Collect all pages
    const pageTasks = [];
    for (let p = 1; p <= totalPages; p++) {
      pageTasks.push({ category, page: p });
    }

    // Fetch Spanish pages
    console.log(`   Fetching ${totalPages} pages in Spanish (es)...`);
    const esPages = await mapConcurrent(pageTasks, CONCURRENCY, async ({ category, page }) => {
      if (page === 1) return firstEs;
      return await fetchPage(category, page, 'es');
    });

    for (const pageData of esPages) {
      if (pageData && pageData.results) {
        for (const item of pageData.results) {
          const key = item.url || `${category}-${item.id}`;
          esEntriesMap.set(key, item);
        }
      }
    }

    // Fetch English pages
    console.log(`   Fetching ${totalPages} pages in English (en)...`);
    const enPages = await mapConcurrent(pageTasks, CONCURRENCY, async ({ category, page }) => {
      return await fetchPage(category, page, 'en');
    });

    for (const pageData of enPages) {
      if (pageData && pageData.results) {
        for (const item of pageData.results) {
          const key = item.url || `${category}-${item.id}`;
          enEntriesMap.set(key, item);
        }
      }
    }

    console.log(`   ✅ Finished [${category}]: Cached ${esEntriesMap.size} total entries so far.`);
  }

  console.log(`\n🔄 Merging Spanish and English datasets...`);
  const finalEntries = [];
  const allKeys = new Set([...esEntriesMap.keys(), ...enEntriesMap.keys()]);

  for (const key of allKeys) {
    const es = esEntriesMap.get(key);
    const en = enEntriesMap.get(key);
    const base = es || en;

    const tier = typeof base.tier === 'number' ? base.tier : 0;
    const icon = base.sprite && base.sprite.startsWith('http')
      ? base.sprite
      : base.sprite ? `${BASE_URL}${base.sprite}` : '';

    const nameEs = (es && es.name) ? es.name.trim() : '';
    const nameEn = (en && en.name) ? en.name.trim() : '';
    const name = nameEs || nameEn || 'Desconocido';

    const descEs = (es && es.description) ? es.description.trim() : '';
    const descEn = (en && en.description) ? en.description.trim() : '';

    // Category display type
    const categoryName = base.category || 'items';
    const typeLabel = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

    finalEntries.push({
      id: base.id || key.replace(/[^a-zA-Z0-9_-]/g, '_'),
      name: name,
      nameEs: nameEs,
      nameEn: nameEn,
      category: categoryName,
      subcategory: '',
      tier: tier,
      icon: icon,
      type: typeLabel,
      rarity: base.rarity || '',
      exotic: !!base.exotic,
      arisen: !!base.arisen,
      description: descEs || descEn || '',
      descriptionEs: descEs,
      descriptionEn: descEn,
      officialUrl: base.url ? `${BASE_URL}${base.url}` : `${BASE_URL}/codex/`
    });
  }

  // Sort entries: by category, then tier, then name
  finalEntries.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name);
  });

  const outputPath = path.resolve(__dirname, '../src/app/data/codex-items.json');
  console.log(`\n💾 Writing ${finalEntries.length} entries to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(finalEntries, null, 2), 'utf-8');

  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`✨ DONE in ${elapsed}s! Total items: ${finalEntries.length}. File size: ${sizeMB} MB`);
}

scrapeAll().catch((err) => {
  console.error('Fatal scrape error:', err);
  process.exit(1);
});

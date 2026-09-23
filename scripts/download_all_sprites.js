import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODEX_PATH = path.resolve(__dirname, '../src/app/data/codex-items.json');
const ASSETS_PATH = path.resolve(__dirname, '../src/assets/data/codex-items.json');
const TARGET_ASSETS_DIR = path.resolve(__dirname, '../src/assets/codex');

const CONCURRENCY = 24;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath)) {
    const stat = fs.statSync(destPath);
    if (stat.size > 0) return true; // Already downloaded
  }

  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      clearTimeout(timeout);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuf = await resp.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      fs.writeFileSync(destPath, buffer);
      return true;
    } catch (e) {
      clearTimeout(timeout);
      if (attempt === 3) {
        console.warn(`Failed downloading ${url}:`, e.message);
        return false;
      }
      await sleep(200 * attempt);
    }
  }
  return false;
}

function getLocalPathFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  // Format: https://playorna.com/static/img/weapons/kunai.png -> weapons/kunai.png
  // Or /static/img/weapons/kunai.png
  const match = url.match(/static\/img\/(.+)$/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

async function run() {
  console.log('🚀 Loading codex entries...');
  const entries = JSON.parse(fs.readFileSync(CODEX_PATH, 'utf-8'));
  console.log(`Total entries: ${entries.length}`);

  const urlMap = new Map(); // url -> localRelativePath

  function registerUrl(url) {
    if (!url || typeof url !== 'string') return;
    let fullUrl = url;
    if (fullUrl.startsWith('/static/')) {
      fullUrl = `https://playorna.com${fullUrl}`;
    }
    if (!fullUrl.startsWith('https://playorna.com/static/img/')) return;

    const rel = getLocalPathFromUrl(fullUrl);
    if (rel) {
      urlMap.set(fullUrl, rel);
    }
  }

  for (const entry of entries) {
    registerUrl(entry.icon);
    if (entry.upgradeMaterials) entry.upgradeMaterials.forEach((m) => registerUrl(m.sprite));
    if (entry.droppedBy) entry.droppedBy.forEach((m) => registerUrl(m.sprite));
    if (entry.causes) entry.causes.forEach((m) => registerUrl(m.sprite));
    if (entry.gives) entry.gives.forEach((m) => registerUrl(m.sprite));
    if (entry.drops) entry.drops.forEach((m) => registerUrl(m.sprite));
    if (entry.skills) entry.skills.forEach((m) => registerUrl(m.sprite));
  }

  console.log(`Found ${urlMap.size} unique sprites to download.`);

  const list = Array.from(urlMap.entries());
  let completed = 0;
  let downloadedCount = 0;
  const startTime = Date.now();
  let idx = 0;

  async function worker() {
    while (idx < list.length) {
      const [remoteUrl, relPath] = list[idx++];
      const destPath = path.join(TARGET_ASSETS_DIR, relPath);
      const ok = await downloadFile(remoteUrl, destPath);
      if (ok) downloadedCount++;
      completed++;
      if (completed % 150 === 0 || completed === list.length) {
        const pct = ((completed / list.length) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log(`[${pct}%] Processed ${completed}/${list.length} sprites (${elapsed}s elapsed)...`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(`✅ Sprites download completed! Downloaded: ${downloadedCount}/${list.length}`);

  // Now rewrite sprite URLs in entries to local assets/codex/...
  console.log('🔄 Rewriting sprite references in codex dataset to local paths...');

  function rewriteUrl(url) {
    if (!url || typeof url !== 'string') return url;
    let fullUrl = url;
    if (fullUrl.startsWith('/static/')) {
      fullUrl = `https://playorna.com${fullUrl}`;
    }
    const rel = urlMap.get(fullUrl);
    if (rel) {
      const localFile = path.join(TARGET_ASSETS_DIR, rel);
      if (fs.existsSync(localFile)) {
        return `assets/codex/${rel.replace(/\\/g, '/')}`;
      }
    }
    return url;
  }

  for (const entry of entries) {
    if (entry.icon) entry.icon = rewriteUrl(entry.icon);
    if (entry.upgradeMaterials) entry.upgradeMaterials.forEach((m) => { if (m.sprite) m.sprite = rewriteUrl(m.sprite); });
    if (entry.droppedBy) entry.droppedBy.forEach((m) => { if (m.sprite) m.sprite = rewriteUrl(m.sprite); });
    if (entry.causes) entry.causes.forEach((m) => { if (m.sprite) m.sprite = rewriteUrl(m.sprite); });
    if (entry.gives) entry.gives.forEach((m) => { if (m.sprite) m.sprite = rewriteUrl(m.sprite); });
    if (entry.drops) entry.drops.forEach((m) => { if (m.sprite) m.sprite = rewriteUrl(m.sprite); });
    if (entry.skills) entry.skills.forEach((m) => { if (m.sprite) m.sprite = rewriteUrl(m.sprite); });

    // Also populate entry.stats string for cards if itemStats exists!
    if (entry.itemStats && !entry.stats) {
      const parts = [];
      const keys = Object.keys(entry.itemStats);
      for (const k of keys) {
        if (parts.length >= 2) break;
        const val = entry.itemStats[k];
        parts.push(`${k}: ${val}`);
      }
      if (parts.length > 0) {
        entry.stats = parts.join(' · ');
      }
    }
  }

  fs.writeFileSync(CODEX_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  fs.writeFileSync(ASSETS_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  console.log('💾 Successfully updated codex-items.json with local assets and stats summaries!');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

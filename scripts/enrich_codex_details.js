import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODEX_PATH = path.resolve(__dirname, '../src/app/data/codex-items.json');
const ASSETS_PATH = path.resolve(__dirname, '../src/assets/data/codex-items.json');
const META_PATH = path.resolve(__dirname, '../src/assets/data/codex-metadata.json');

const CONCURRENCY = 16;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchItemDetail(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const resp = await fetch(`${url}?lang=es`, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      clearTimeout(timeout);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      const startTag = '<script id="codex-bootstrap" type="application/json">';
      const sIdx = html.indexOf(startTag);
      if (sIdx === -1) throw new Error('No bootstrap');
      const end = html.indexOf('</script>', sIdx);
      const data = JSON.parse(html.slice(sIdx + startTag.length, end));
      return data.detail || null;
    } catch (e) {
      clearTimeout(timeout);
      if (attempt === 3) return null;
      await sleep(200 * attempt);
    }
  }
  return null;
}

function parseDetail(entry, detail) {
  if (!detail) return;

  const facts = detail.facts || [];
  const effects = detail.effects || [];
  const sections = detail.sections || [];

  entry.facts = facts;
  if (effects.length > 0) {
    entry.effects = effects;
  }

  // Parse facts
  const itemStats = {};
  for (const f of facts) {
    const l = f.label.toLowerCase();
    const v = f.value;

    if (l === 'useable by' || l === 'usable por' || l === 'equipable por') {
      entry.useableBy = v;
    } else if (l === 'place' || l === 'lugar' || l === 'ranura') {
      entry.place = v;
    } else if (l === 'tipo' || l === 'type') {
      entry.itemType = v;
    } else if (l === 'family' || l === 'familia') {
      entry.family = v;
    } else if (l === 'element' || l === 'elemento') {
      entry.element = v;
    } else if (l === 'target' || l === 'objetivo') {
      entry.target = v;
    } else if (l === 'coste de maná' || l === 'mana cost') {
      entry.manaCost = v;
    } else if (
      ['ataque', 'attack', 'magia', 'magic', 'defensa', 'defense', 'resistencia', 'resistance',
       'destreza', 'dexterity', 'salud', 'hp', 'maná', 'mana', 'guarda', 'ward', 'crítico', 'crit'].some(k => l.includes(k))
    ) {
      itemStats[f.label] = v;
    }
  }

  if (Object.keys(itemStats).length > 0) {
    entry.itemStats = itemStats;
  }

  // Parse sections
  const upgradeMaterials = [];
  const droppedBy = [];
  const causes = [];
  const gives = [];
  const skills = [];
  const drops = [];
  const learnedBy = [];

  for (const sec of sections) {
    const t = (sec.title || '').toLowerCase();
    const secEntries = sec.entries || [];

    if (t.includes('upgrade') || t.includes('mejorar')) {
      for (const e of secEntries) {
        upgradeMaterials.push({ name: e.name, sprite: e.sprite });
      }
    } else if (t.includes('dropped by') || t.includes('soltado por') || t.includes('obtenido de')) {
      for (const e of secEntries) {
        droppedBy.push({ name: e.name, sprite: e.sprite, tier: e.tier, url: e.url });
      }
    } else if (t.includes('causes') || t.includes('causa') || t.includes('provoca')) {
      for (const e of secEntries) {
        causes.push({ name: e.name, sprite: e.sprite, meta: e.meta });
      }
    } else if (t.includes('gives') || t.includes('otorga') || t.includes('inmuni')) {
      for (const e of secEntries) {
        gives.push({ name: e.name, sprite: e.sprite, meta: e.meta });
      }
    } else if (t.includes('skills') || t.includes('habilidades') || t.includes('hechizos')) {
      for (const e of secEntries) {
        skills.push({ name: e.name, sprite: e.sprite, tier: e.tier, url: e.url });
      }
    } else if (t.includes('drops') || t.includes('botín') || t.includes('objetos')) {
      for (const e of secEntries) {
        drops.push({ name: e.name, sprite: e.sprite, tier: e.tier, rarity: e.rarity, url: e.url });
      }
    } else if (t.includes('learned by') || t.includes('aprendido por')) {
      for (const e of secEntries) {
        learnedBy.push({ name: e.name, sprite: e.sprite, url: e.url });
      }
    }
  }

  if (upgradeMaterials.length > 0) entry.upgradeMaterials = upgradeMaterials;
  if (droppedBy.length > 0) entry.droppedBy = droppedBy;
  if (causes.length > 0) entry.causes = causes;
  if (gives.length > 0) entry.gives = gives;
  if (skills.length > 0) entry.skills = skills;
  if (drops.length > 0) entry.drops = drops;
  if (learnedBy.length > 0) entry.learnedBy = learnedBy;
}

async function runEnrichment() {
  console.log('🚀 Loading codex entries...');
  const entries = JSON.parse(fs.readFileSync(CODEX_PATH, 'utf-8'));
  console.log(`Total entries: ${entries.length}`);

  const startTime = Date.now();
  let completed = 0;
  let enrichedCount = 0;
  let idx = 0;

  async function worker(workerId) {
    while (idx < entries.length) {
      const entry = entries[idx++];
      if (entry && entry.officialUrl) {
        const detail = await fetchItemDetail(entry.officialUrl);
        if (detail) {
          parseDetail(entry, detail);
          enrichedCount++;
        }
      }
      completed++;
      if (completed % 100 === 0 || completed === entries.length) {
        const pct = ((completed / entries.length) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log(`[${pct}%] Enriched ${completed}/${entries.length} items (${elapsed}s elapsed)...`);
      }
    }
  }

  console.log(`⚡ Running ${CONCURRENCY} parallel workers to enrich all details...`);
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  console.log(`💾 Saving enriched database to ${CODEX_PATH}...`);
  fs.writeFileSync(CODEX_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  fs.writeFileSync(ASSETS_PATH, JSON.stringify(entries, null, 2), 'utf-8');

  fs.writeFileSync(META_PATH, JSON.stringify({
    version: '1.4.0',
    totalEntries: entries.length,
    enriched: true,
    updatedAt: new Date().toISOString()
  }, null, 2), 'utf-8');

  const stats = fs.statSync(CODEX_PATH);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`✨ Successfully enriched ${enrichedCount} entries in ${totalSec}s! Final size: ${sizeMB} MB`);
}

runEnrichment().catch(err => {
  console.error('Fatal error during enrichment:', err);
  process.exit(1);
});

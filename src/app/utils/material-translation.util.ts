import translateData from '../../../resources/material/translate.json';

export interface MaterialTranslation {
  en: string;
  es: string;
  aliases?: string[];
}

const translationsMap = new Map<string, MaterialTranslation>();
const aliasToKeyMap = new Map<string, string>();

function normalizeKey(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/:.*$/g, '')
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9áéíóúñü]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
}

// Initialize lookup tables from translate.json
(function initTranslations() {
  const transObj = (translateData as any).translations || {};
  for (const [key, data] of Object.entries(transObj)) {
    const item = data as MaterialTranslation;
    const normKey = normalizeKey(key);
    translationsMap.set(normKey, item);

    if (item.en) {
      aliasToKeyMap.set(normalizeKey(item.en), normKey);
    }
    if (item.es) {
      aliasToKeyMap.set(normalizeKey(item.es), normKey);
    }
    if (Array.isArray(item.aliases)) {
      for (const alias of item.aliases) {
        aliasToKeyMap.set(normalizeKey(alias), normKey);
      }
    }
  }
})();

/**
 * Translates a material name into the requested language ('es' or 'en').
 * Falls back to the raw name if no translation is found.
 */
export function translateMaterialName(rawName: string, lang: 'es' | 'en' = 'es'): string {
  if (!rawName) return '';

  const cleanName = rawName.replace(/\(.*?\)/g, '').replace(/:.*$/g, '').trim();
  const norm = normalizeKey(cleanName);

  let targetKey = aliasToKeyMap.get(norm) || norm;
  let entry = translationsMap.get(targetKey);

  if (!entry) {
    // Attempt relaxed check (without underscores)
    const stripped = norm.replace(/_/g, '');
    for (const [k, v] of translationsMap.entries()) {
      if (k.replace(/_/g, '') === stripped) {
        entry = v;
        break;
      }
    }
  }

  if (entry) {
    if (lang === 'es' && entry.es) {
      return entry.es;
    }
    if (lang === 'en' && entry.en) {
      return entry.en;
    }
  }

  return cleanName || rawName;
}

/**
 * Checks if a search query matches a material (checking EN name, ES name, and aliases)
 */
export function matchesMaterialQuery(rawName: string, query: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  const norm = normalizeKey(rawName);

  const targetKey = aliasToKeyMap.get(norm) || norm;
  const entry = translationsMap.get(targetKey);

  if (rawName.toLowerCase().includes(q)) return true;

  if (entry) {
    if (entry.en && entry.en.toLowerCase().includes(q)) return true;
    if (entry.es && entry.es.toLowerCase().includes(q)) return true;
    if (Array.isArray(entry.aliases)) {
      for (const a of entry.aliases) {
        if (a.toLowerCase().includes(q)) return true;
      }
    }
  }

  return false;
}

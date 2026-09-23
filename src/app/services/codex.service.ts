import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import defaultCodexData from '../data/codex-items.json';

export interface CodexEntry {
  id: string;
  name: string;
  nameEs?: string;
  nameEn?: string;
  category: string;
  subcategory?: string;
  tier: number;
  icon: string;
  type: string;
  rarity?: string;
  exotic?: boolean;
  arisen?: boolean;
  description?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  stats?: string;
  officialUrl?: string;
}

export interface SyncProgress {
  running: boolean;
  percent: number;
  currentCategory: string;
  statusText: string;
  error?: string;
}

const DB_NAME = 'lastcodex_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'codex_store';
const KEY_ENTRIES = 'entries';
const KEY_METADATA = 'metadata';

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

@Injectable({
  providedIn: 'root'
})
export class CodexService {
  private entriesSubject = new BehaviorSubject<CodexEntry[]>([]);
  public entries$: Observable<CodexEntry[]> = this.entriesSubject.asObservable();

  private lastSyncSubject = new BehaviorSubject<string | null>(null);
  public lastSync$: Observable<string | null> = this.lastSyncSubject.asObservable();

  private isCustomDataSubject = new BehaviorSubject<boolean>(false);
  public isCustomData$: Observable<boolean> = this.isCustomDataSubject.asObservable();

  private syncProgressSubject = new BehaviorSubject<SyncProgress>({
    running: false,
    percent: 0,
    currentCategory: '',
    statusText: ''
  });
  public syncProgress$: Observable<SyncProgress> = this.syncProgressSubject.asObservable();

  constructor() {
    this.initDatabase();
  }

  get currentEntries(): CodexEntry[] {
    return this.entriesSubject.value;
  }

  get currentLastSync(): string | null {
    return this.lastSyncSubject.value;
  }

  get isCustomData(): boolean {
    return this.isCustomDataSubject.value;
  }

  /**
   * Initializes data: Loads from IndexedDB if synced, otherwise loads bundled codex-items.json
   */
  private async initDatabase(): Promise<void> {
    try {
      const cached = await this.getFromIndexedDB();
      if (cached && cached.entries && cached.entries.length > 0) {
        this.entriesSubject.next(cached.entries);
        this.lastSyncSubject.next(cached.lastSync || null);
        this.isCustomDataSubject.next(true);
        return;
      }
    } catch (e) {
      console.warn('Could not read from IndexedDB, falling back to bundled JSON:', e);
    }

    // Default bundled data
    this.loadBundledData();
  }

  private loadBundledData(): void {
    const bundled = (defaultCodexData as unknown as CodexEntry[]) || [];
    this.entriesSubject.next(bundled);
    this.isCustomDataSubject.next(false);
    this.lastSyncSubject.next(null);
  }

  /**
   * Performs live synchronization with PlayOrna Codex.
   * Can be triggered by the user in Settings.
   */
  async syncFromPlayOrna(): Promise<{ success: boolean; count: number; error?: string }> {
    if (this.syncProgressSubject.value.running) {
      return { success: false, count: 0, error: 'Sincronización en curso' };
    }

    this.syncProgressSubject.next({
      running: true,
      percent: 5,
      currentCategory: 'Iniciando',
      statusText: 'Conectando con PlayOrna Codex...'
    });

    try {
      const esEntriesMap = new Map<string, any>();
      const enEntriesMap = new Map<string, any>();

      const totalCats = CATEGORIES.length;

      for (let i = 0; i < totalCats; i++) {
        const cat = CATEGORIES[i];
        const basePercent = Math.round(5 + (i / totalCats) * 85);

        this.syncProgressSubject.next({
          running: true,
          percent: basePercent,
          currentCategory: cat,
          statusText: `Descargando categoría ${cat}...`
        });

        // 1. Fetch first page to get count & pages
        const firstEs = await this.fetchCodexPage(cat, 1, 'es');
        if (!firstEs || !firstEs.results) {
          throw new Error(`No se pudo obtener datos para la categoría ${cat}`);
        }

        const totalPages = firstEs.pages || 1;
        this.collectResults(esEntriesMap, cat, firstEs.results);

        // Fetch remaining ES pages
        for (let p = 2; p <= totalPages; p++) {
          const pageData = await this.fetchCodexPage(cat, p, 'es');
          if (pageData && pageData.results) {
            this.collectResults(esEntriesMap, cat, pageData.results);
          }
        }

        // Fetch EN pages
        for (let p = 1; p <= totalPages; p++) {
          const pageData = await this.fetchCodexPage(cat, p, 'en');
          if (pageData && pageData.results) {
            this.collectResults(enEntriesMap, cat, pageData.results);
          }
        }
      }

      this.syncProgressSubject.next({
        running: true,
        percent: 92,
        currentCategory: 'Procesando',
        statusText: 'Compilando y optimizando base de datos...'
      });

      // Merge ES and EN
      const finalEntries: CodexEntry[] = [];
      const allKeys = new Set([...esEntriesMap.keys(), ...enEntriesMap.keys()]);

      for (const key of allKeys) {
        const es = esEntriesMap.get(key);
        const en = enEntriesMap.get(key);
        const base = es || en;

        const tier = typeof base.tier === 'number' ? base.tier : 0;
        let icon = base.sprite || '';
        if (icon && !icon.startsWith('http')) {
          icon = `https://playorna.com${icon}`;
        }

        const nameEs = (es && es.name) ? es.name.trim() : '';
        const nameEn = (en && en.name) ? en.name.trim() : '';
        const name = nameEs || nameEn || 'Desconocido';

        const descEs = (es && es.description) ? es.description.trim() : '';
        const descEn = (en && en.description) ? en.description.trim() : '';

        const categoryName = base.category || 'items';
        const typeLabel = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        finalEntries.push({
          id: base.id || key.replace(/[^a-zA-Z0-9_-]/g, '_'),
          name,
          nameEs,
          nameEn,
          category: categoryName,
          subcategory: '',
          tier,
          icon,
          type: typeLabel,
          rarity: base.rarity || '',
          exotic: !!base.exotic,
          arisen: !!base.arisen,
          description: descEs || descEn || '',
          descriptionEs: descEs,
          descriptionEn: descEn,
          officialUrl: base.url ? `https://playorna.com${base.url}` : 'https://playorna.com/codex/'
        });
      }

      finalEntries.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.name.localeCompare(b.name);
      });

      const now = new Date().toISOString();
      await this.saveToIndexedDB(finalEntries, now);

      this.entriesSubject.next(finalEntries);
      this.lastSyncSubject.next(now);
      this.isCustomDataSubject.next(true);

      this.syncProgressSubject.next({
        running: false,
        percent: 100,
        currentCategory: '',
        statusText: `¡Sincronización completada! ${finalEntries.length} entradas actualizadas.`
      });

      return { success: true, count: finalEntries.length };
    } catch (err: any) {
      console.error('Error during codex synchronization:', err);
      this.syncProgressSubject.next({
        running: false,
        percent: 0,
        currentCategory: '',
        statusText: 'Error en la sincronización',
        error: err.message || 'Error desconocido'
      });
      return { success: false, count: 0, error: err.message };
    }
  }

  /**
   * Resets local storage cache to the bundled version.
   */
  async resetToDefault(): Promise<void> {
    try {
      await this.clearIndexedDB();
    } catch (e) {
      console.warn('Error clearing IndexedDB:', e);
    }
    this.loadBundledData();
  }

  private collectResults(map: Map<string, any>, category: string, results: any[]): void {
    for (const item of results) {
      const key = item.url || `${category}-${item.id}`;
      map.set(key, item);
    }
  }

  private async fetchCodexPage(category: string, page: number, lang: string): Promise<any> {
    const url = `https://playorna.com/codex/${category}/?p=${page}&lang=${lang}`;
    const resp = await fetch(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} al consultar ${category}`);
    }
    const html = await resp.text();
    const startTag = '<script id="codex-bootstrap" type="application/json">';
    const idx = html.indexOf(startTag);
    if (idx === -1) {
      throw new Error(`Respuesta no válida para ${category}`);
    }
    const jsonEnd = html.indexOf('</script>', idx);
    const jsonStr = html.slice(idx + startTag.length, jsonEnd);
    return JSON.parse(jsonStr);
  }

  // --- IndexedDB Storage Helper ---

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB not supported in this environment'));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromIndexedDB(): Promise<{ entries: CodexEntry[]; lastSync: string } | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const reqEntries = store.get(KEY_ENTRIES);
      const reqMeta = store.get(KEY_METADATA);

      tx.oncomplete = () => {
        if (reqEntries.result) {
          resolve({
            entries: reqEntries.result,
            lastSync: reqMeta.result?.lastSync || ''
          });
        } else {
          resolve(null);
        }
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  private async saveToIndexedDB(entries: CodexEntry[], lastSync: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(entries, KEY_ENTRIES);
      store.put({ lastSync, totalCount: entries.length }, KEY_METADATA);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(KEY_ENTRIES);
      store.delete(KEY_METADATA);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import defaultCodexData from '../data/codex-items.json';

export interface CodexSubItem {
  name: string;
  sprite?: string;
  tier?: number;
  rarity?: string;
  url?: string;
  meta?: string;
}

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
  facts?: Array<{ label: string; value: string }>;
  itemStats?: { [key: string]: string };
  useableBy?: string;
  place?: string;
  itemType?: string;
  element?: string;
  family?: string;
  event?: string;
  effects?: string[];
  upgradeMaterials?: CodexSubItem[];
  droppedBy?: CodexSubItem[];
  causes?: CodexSubItem[];
  gives?: CodexSubItem[];
  skills?: CodexSubItem[];
  drops?: CodexSubItem[];
  learnedBy?: CodexSubItem[];
}

export interface SyncProgress {
  running: boolean;
  percent: number;
  currentCategory: string;
  statusText: string;
  completedTasks?: number;
  totalTasks?: number;
  error?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  liveCount: number;
  currentCount: number;
  newCount: number;
  lastChecked: string;
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
  private entriesSubject = new BehaviorSubject<CodexEntry[]>((defaultCodexData as unknown as CodexEntry[]) || []);
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

  private updateStatusSubject = new BehaviorSubject<UpdateCheckResult | null>(null);
  public updateStatus$: Observable<UpdateCheckResult | null> = this.updateStatusSubject.asObservable();

  constructor() {
    this.initDatabase().then(() => {
      // Check for live updates in background after startup
      setTimeout(() => {
        this.checkForUpdates().catch(() => {});
      }, 2500);
    });
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

  get currentUpdateStatus(): UpdateCheckResult | null {
    return this.updateStatusSubject.value;
  }

  /**
   * Initializes data: Loads from IndexedDB if synced, otherwise loads bundled codex-items.json
   */
  private async initDatabase(): Promise<void> {
    try {
      const timeoutPromise = new Promise<{ entries: CodexEntry[]; lastSync: string } | null>((resolve) =>
        setTimeout(() => resolve(null), 1000)
      );
      const cached = await Promise.race([this.getFromIndexedDB(), timeoutPromise]);
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
   * Checks if PlayOrna has additional/new entries compared to the local database.
   * Runs in ~1 second by querying page 1 of each category.
   */
  async checkForUpdates(): Promise<UpdateCheckResult> {
    const currentCount = this.entriesSubject.value.length;
    const nowIso = new Date().toISOString();

    try {
      const promises = CATEGORIES.map(async (cat) => {
        const page1 = await this.fetchCodexPage(cat, 1, 'es', 4000);
        return page1 && typeof page1.count === 'number' ? page1.count : 0;
      });

      const counts = await Promise.all(promises);
      const liveTotal = counts.reduce((acc, c) => acc + c, 0);

      if (liveTotal === 0) {
        // Network unavailable or empty response
        const fallbackResult: UpdateCheckResult = {
          hasUpdate: false,
          liveCount: currentCount,
          currentCount,
          newCount: 0,
          lastChecked: nowIso,
          error: 'No se pudo contactar con PlayOrna Codex (posiblemente offline)'
        };
        this.updateStatusSubject.next(fallbackResult);
        return fallbackResult;
      }

      const hasUpdate = liveTotal > currentCount;
      const newCount = hasUpdate ? liveTotal - currentCount : 0;

      const result: UpdateCheckResult = {
        hasUpdate,
        liveCount: liveTotal,
        currentCount,
        newCount,
        lastChecked: nowIso
      };

      this.updateStatusSubject.next(result);
      return result;
    } catch (err: any) {
      const errorResult: UpdateCheckResult = {
        hasUpdate: false,
        liveCount: currentCount,
        currentCount,
        newCount: 0,
        lastChecked: nowIso,
        error: err.message
      };
      this.updateStatusSubject.next(errorResult);
      return errorResult;
    }
  }

  /**
   * Performs live synchronization with PlayOrna Codex.
   * Concurrently processes pages and provides smooth, per-page progress updates.
   */
  async syncFromPlayOrna(): Promise<{ success: boolean; count: number; error?: string }> {
    if (this.syncProgressSubject.value.running) {
      return { success: false, count: 0, error: 'Sincronización en curso' };
    }

    this.syncProgressSubject.next({
      running: true,
      percent: 2,
      currentCategory: 'Iniciando',
      statusText: 'Conectando con PlayOrna Codex...'
    });

    try {
      // 1. Fetch category metadata (page 1) to determine exact page counts
      const categoryMetadata: { [cat: string]: number } = {};
      const page1Tasks = CATEGORIES.map(async (cat) => {
        const p1 = await this.fetchCodexPage(cat, 1, 'es', 6000);
        return { cat, pages: p1 && p1.pages ? p1.pages : 1, p1Data: p1 };
      });

      const page1Results = await Promise.all(page1Tasks);

      const esEntriesMap = new Map<string, any>();
      const enEntriesMap = new Map<string, any>();

      // Build task queue for all remaining pages in ES and EN
      interface PageTask {
        cat: string;
        page: number;
        lang: 'es' | 'en';
        totalPages: number;
      }

      const taskQueue: PageTask[] = [];

      for (const res of page1Results) {
        categoryMetadata[res.cat] = res.pages;
        if (res.p1Data && res.p1Data.results) {
          this.collectResults(esEntriesMap, res.cat, res.p1Data.results);
        }

        // ES pages 2..pages
        for (let p = 2; p <= res.pages; p++) {
          taskQueue.push({ cat: res.cat, page: p, lang: 'es', totalPages: res.pages });
        }

        // EN pages 1..pages
        for (let p = 1; p <= res.pages; p++) {
          taskQueue.push({ cat: res.cat, page: p, lang: 'en', totalPages: res.pages });
        }
      }

      const totalTasks = taskQueue.length;
      let completedTasks = 0;

      // 2. Worker pool with 4 concurrent connections
      const CONCURRENCY = 4;
      let taskIndex = 0;

      const worker = async () => {
        while (taskIndex < taskQueue.length) {
          const currentTask = taskQueue[taskIndex++];
          try {
            const pageData = await this.fetchCodexPage(currentTask.cat, currentTask.page, currentTask.lang, 8000);
            if (pageData && pageData.results) {
              if (currentTask.lang === 'es') {
                this.collectResults(esEntriesMap, currentTask.cat, pageData.results);
              } else {
                this.collectResults(enEntriesMap, currentTask.cat, pageData.results);
              }
            }
          } catch (e) {
            console.warn(`Error on page ${currentTask.cat} p=${currentTask.page} (${currentTask.lang}):`, e);
          }

          completedTasks++;
          const progressPercent = Math.min(94, Math.round(5 + (completedTasks / totalTasks) * 89));

          this.syncProgressSubject.next({
            running: true,
            percent: progressPercent,
            currentCategory: currentTask.cat,
            completedTasks,
            totalTasks,
            statusText: `Descargando ${currentTask.cat} (${currentTask.lang.toUpperCase()}) — pág. ${currentTask.page}/${currentTask.totalPages} [${completedTasks}/${totalTasks}]`
          });
        }
      };

      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

      // 3. Compile and merge ES and EN datasets
      this.syncProgressSubject.next({
        running: true,
        percent: 96,
        currentCategory: 'Procesando',
        statusText: 'Compilando y optimizando base de datos enriquecida...'
      });

      const existingMap = new Map<string, CodexEntry>();
      for (const e of this.entriesSubject.value) {
        if (e.id) existingMap.set(e.id, e);
        if (e.officialUrl) existingMap.set(e.officialUrl, e);
        if (e.nameEn) existingMap.set(e.nameEn.toLowerCase(), e);
        if (e.name) existingMap.set(e.name.toLowerCase(), e);
      }

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
        const officialUrl = base.url ? `https://playorna.com${base.url}` : 'https://playorna.com/codex/';

        const existing = existingMap.get(base.id) ||
                         existingMap.get(officialUrl) ||
                         existingMap.get(nameEn.toLowerCase()) ||
                         existingMap.get(name.toLowerCase());

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
          rarity: base.rarity || existing?.rarity || '',
          exotic: !!base.exotic,
          arisen: !!base.arisen,
          description: descEs || descEn || existing?.description || '',
          descriptionEs: descEs || existing?.descriptionEs,
          descriptionEn: descEn || existing?.descriptionEn,
          officialUrl,
          facts: existing?.facts,
          itemStats: existing?.itemStats,
          useableBy: existing?.useableBy,
          place: existing?.place,
          itemType: existing?.itemType,
          element: existing?.element,
          family: existing?.family,
          event: existing?.event,
          effects: existing?.effects,
          upgradeMaterials: existing?.upgradeMaterials,
          droppedBy: existing?.droppedBy,
          causes: existing?.causes,
          gives: existing?.gives,
          skills: existing?.skills,
          drops: existing?.drops,
          learnedBy: existing?.learnedBy
        });
      }

      if (finalEntries.length === 0) {
        throw new Error('No se pudieron compilar las entradas del Códice.');
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

      this.updateStatusSubject.next({
        hasUpdate: false,
        liveCount: finalEntries.length,
        currentCount: finalEntries.length,
        newCount: 0,
        lastChecked: now
      });

      this.syncProgressSubject.next({
        running: false,
        percent: 100,
        currentCategory: '',
        statusText: `¡Sincronización completada! ${finalEntries.length.toLocaleString()} entradas actualizadas.`
      });

      return { success: true, count: finalEntries.length };
    } catch (err: any) {
      console.error('Error during codex synchronization:', err);

      // Graceful fallback: Try to load from /assets/data/codex-items.json if available
      try {
        const fallbackResp = await fetch('assets/data/codex-items.json');
        if (fallbackResp.ok) {
          const fallbackData = await fallbackResp.json();
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            const now = new Date().toISOString();
            await this.saveToIndexedDB(fallbackData, now);
            this.entriesSubject.next(fallbackData);
            this.lastSyncSubject.next(now);
            this.isCustomDataSubject.next(true);

            this.syncProgressSubject.next({
              running: false,
              percent: 100,
              currentCategory: '',
              statusText: `¡Códice actualizado desde paquete local! ${fallbackData.length.toLocaleString()} entradas cargadas.`
            });
            return { success: true, count: fallbackData.length };
          }
        }
      } catch {
        // Fallback failed
      }

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

  private async fetchCodexPage(category: string, page: number, lang: string, timeoutMs = 8000): Promise<any> {
    const url = `https://playorna.com/codex/${category}/?p=${page}&lang=${lang}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      clearTimeout(timeoutId);

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
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
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

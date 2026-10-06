import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import { searchOutline, addOutline, closeOutline, chevronBackOutline, alertCircleOutline, closeCircleOutline, trashOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { CodexService, CodexEntry } from '../../services/codex.service';

/** A stat of the selected item that can be assessed (base value > 0). */
export interface AssessStat {
  key: string;      // original key in itemStats (e.g. 'Ataque')
  canon: string;    // canonical id (e.g. 'attack')
  label: string;    // display label (Spanish)
  base: number;     // base value at level 1 / 100% quality
  percent: boolean; // true for Guardia-like stats ('12%')
}

/** One dropped copy of the item to evaluate. */
export interface AssessRow {
  level: number;
  values: { [statKey: string]: number | null };
}

export interface AssessableItem {
  entry: CodexEntry;
  stats: AssessStat[];
  search: string; // normalized searchable text
}

export interface EvaluatedItemState {
  item: AssessableItem;
  rows: AssessRow[];
}

interface QualityTier {
  label: string;
  cls: string;
}

const STORAGE_KEY = 'assess_state_v1';

/**
 * Canonical stat ids keyed by normalized (accent-less, letters only) stat names.
 * Includes Spanish/English names and common mojibake variants (e.g. 'ManÃ¡', 'PrevisiÃ³n').
 */
const STAT_ALIASES: { [normalized: string]: { canon: string; label: string } } = {
  ataque: { canon: 'attack', label: 'Ataque' },
  attack: { canon: 'attack', label: 'Ataque' },
  magia: { canon: 'magic', label: 'Magia' },
  magic: { canon: 'magic', label: 'Magia' },
  defensa: { canon: 'defense', label: 'Defensa' },
  defense: { canon: 'defense', label: 'Defensa' },
  resistencia: { canon: 'resistance', label: 'Resistencia' },
  resistance: { canon: 'resistance', label: 'Resistencia' },
  destreza: { canon: 'dexterity', label: 'Destreza' },
  dexterity: { canon: 'dexterity', label: 'Destreza' },
  ps: { canon: 'hp', label: 'PS' },
  hp: { canon: 'hp', label: 'PS' },
  mana: { canon: 'mana', label: 'Maná' },
  guardia: { canon: 'ward', label: 'Guardia' },
  ward: { canon: 'ward', label: 'Guardia' },
  prevision: { canon: 'foresight', label: 'Previsión' },
  previsian: { canon: 'foresight', label: 'Previsión' }, // mojibake 'PrevisiÃ³n'
  foresight: { canon: 'foresight', label: 'Previsión' }
};

@Component({
  selector: 'app-assess',
  templateUrl: './assess.page.html',
  styleUrls: ['./assess.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AssessPage implements OnInit, OnDestroy {
  private codexService = inject(CodexService);
  private router = inject(Router);
  private subs = new Subscription();

  private assessable: AssessableItem[] = [];

  query = '';
  results: AssessableItem[] = [];
  evaluatedItems: EvaluatedItemState[] = [];

  constructor() {
    addIcons({ searchOutline, addOutline, closeOutline, chevronBackOutline, alertCircleOutline, closeCircleOutline, trashOutline });
  }

  ngOnInit(): void {
    // Reuse the already-loaded codex database from CodexService (no second JSON import).
    this.subs.add(
      this.codexService.entries$.subscribe((entries) => {
        this.assessable = this.buildAssessable(entries || []);
        if (this.evaluatedItems.length === 0) {
          this.restoreState();
        }
        if (this.query) {
          this.onQueryChange();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/codex']);
  }

  // ---------------------------------------------------------------------------
  // Item indexing / search
  // ---------------------------------------------------------------------------

  private normalize(text: string): string {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  /** Letters-only normalized key, used to match stat names robustly. */
  private statKeyId(key: string): string {
    return this.normalize(key).replace(/[^a-z]/g, '');
  }

  private parseStatValue(raw: unknown): number {
    const n = parseFloat(String(raw ?? '').replace('%', '').replace(',', '.').trim());
    return isNaN(n) ? 0 : n;
  }

  private extractStats(entry: CodexEntry): AssessStat[] {
    const out: AssessStat[] = [];
    const stats = entry.itemStats || {};
    for (const key of Object.keys(stats)) {
      const alias = STAT_ALIASES[this.statKeyId(key)];
      if (!alias) continue; // excludes Crít, Adornment Slots, unknown keys
      const base = this.parseStatValue(stats[key]);
      if (base <= 0) continue; // only positive base values are assessable
      if (out.some((s) => s.canon === alias.canon)) continue;
      out.push({
        key,
        canon: alias.canon,
        label: alias.label,
        base,
        percent: String(stats[key]).includes('%')
      });
    }
    return out;
  }

  private buildAssessable(entries: CodexEntry[]): AssessableItem[] {
    const list: AssessableItem[] = [];
    for (const entry of entries) {
      if (entry.category !== 'items' || !entry.itemStats) continue;
      const stats = this.extractStats(entry);
      if (stats.length === 0) continue;
      list.push({
        entry,
        stats,
        search: this.normalize([entry.nameEs, entry.nameEn, entry.name].filter(Boolean).join(' | '))
      });
    }
    return list;
  }

  onQueryChange(): void {
    const q = this.normalize(this.query);
    if (q.length < 2) {
      this.results = [];
      return;
    }
    const starts: AssessableItem[] = [];
    const contains: AssessableItem[] = [];
    for (const item of this.assessable) {
      const idx = item.search.indexOf(q);
      if (idx === -1) continue;
      (idx === 0 ? starts : contains).push(item);
      if (starts.length >= 20) break;
    }
    this.results = [...starts, ...contains].slice(0, 20);
  }

  displayName(entry: CodexEntry): string {
    return entry.nameEs || entry.name || entry.nameEn || '';
  }

  selectItem(item: AssessableItem): void {
    const existing = this.evaluatedItems.find((e) => e.item.entry.id === item.entry.id);
    if (!existing) {
      this.evaluatedItems.unshift({
        item,
        rows: [this.newRow(item)]
      });
    }
    this.query = '';
    this.results = [];
    this.saveState();
  }

  removeItem(index: number): void {
    if (index >= 0 && index < this.evaluatedItems.length) {
      this.evaluatedItems.splice(index, 1);
      this.saveState();
    }
  }

  clearAll(): void {
    this.evaluatedItems = [];
    this.query = '';
    this.results = [];
    this.saveState();
  }

  clearSelection(): void {
    this.clearAll();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.visibility = 'hidden';
  }

  // ---------------------------------------------------------------------------
  // Rows
  // ---------------------------------------------------------------------------

  newRow(item: AssessableItem): AssessRow {
    const values: { [k: string]: number | null } = {};
    (item?.stats || []).forEach((s) => (values[s.key] = null));
    return { level: 1, values };
  }

  addRow(entry: EvaluatedItemState): void {
    entry.rows.push(this.newRow(entry.item));
    this.saveState();
  }

  removeRow(entry: EvaluatedItemState, index: number): void {
    if (entry.rows.length <= 1) return;
    entry.rows.splice(index, 1);
    this.saveState();
  }

  onLevelChange(row: AssessRow): void {
    const lvl = Math.round(Number(row.level));
    if (!isNaN(lvl) && lvl >= 1 && lvl <= 10) {
      row.level = lvl;
    }
    this.saveState();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ---------------------------------------------------------------------------
  // Quality formula
  // ---------------------------------------------------------------------------
  /*
   * LOCAL APPROXIMATION of Orna's quality assessment (orna.guide /api/v1/assess is unavailable):
   *   levelMult(L)      = 1 + 0.1 * (L - 1)                 (L = item level 1..10)
   *   quality(stat)     = entered / (base * levelMult(L))
   *   quality(item)     = average of quality(stat) over the stats the user filled in (> 0)
   * Result shown as a percentage with 1 decimal (e.g. 163.2%). Rounding in-game makes
   * low base stats imprecise, so results outside 70%..200% trigger a warning.
   */
  levelMult(level: number): number {
    const lvl = Math.min(10, Math.max(1, Math.round(Number(level) || 1)));
    return 1 + 0.1 * (lvl - 1);
  }

  rowQuality(item: AssessableItem, row: AssessRow): number | null {
    if (!item) return null;
    const mult = this.levelMult(row.level);
    const ratios: number[] = [];
    for (const s of item.stats) {
      const v = Number(row.values[s.key]);
      if (!v || isNaN(v) || v <= 0) continue;
      ratios.push(v / (s.base * mult));
    }
    if (ratios.length === 0) return null;
    return (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100;
  }

  qualityTier(q: number): QualityTier {
    if (q < 90) return { label: 'Pobre', cls: 'q-common' };
    if (q < 100) return { label: 'Común', cls: 'q-common' };
    if (q < 120) return { label: 'Superior', cls: 'q-superior' };
    if (q < 140) return { label: 'Famoso', cls: 'q-famed' };
    if (q < 170) return { label: 'Legendario', cls: 'q-legendary' };
    return { label: 'Ornado', cls: 'q-ornate' };
  }

  isOutOfRange(q: number): boolean {
    return q < 70 || q > 200;
  }

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  saveState(): void {
    try {
      if (this.evaluatedItems.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const data = this.evaluatedItems.map((e) => ({
        itemId: e.item.entry.id,
        rows: e.rows
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable: ignore */
    }
  }

  private restoreState(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const list: Array<{ itemId: string; rows: AssessRow[] }> = Array.isArray(parsed)
        ? parsed
        : parsed && parsed.itemId
        ? [parsed]
        : [];

      const restored: EvaluatedItemState[] = [];
      for (const entry of list) {
        const found = this.assessable.find((i) => i.entry.id === entry.itemId);
        if (found) {
          const rows = Array.isArray(entry.rows) && entry.rows.length
            ? entry.rows.map((r) => {
                const values: { [k: string]: number | null } = {};
                found.stats.forEach((s) => {
                  const v = r?.values?.[s.key];
                  values[s.key] = typeof v === 'number' && !isNaN(v) ? v : null;
                });
                return { level: this.levelMultSafeLevel(r?.level), values };
              })
            : [this.newRow(found)];
          restored.push({ item: found, rows });
        }
      }
      this.evaluatedItems = restored;
    } catch {
      /* corrupted state: ignore */
    }
  }

  private levelMultSafeLevel(level: unknown): number {
    const lvl = Math.round(Number(level));
    return !isNaN(lvl) && lvl >= 1 && lvl <= 10 ? lvl : 1;
  }
}

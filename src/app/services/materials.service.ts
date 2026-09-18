import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { DayForecast, GuildStock, MaterialSearchResult, MaterialGuildAppearance, DayMaterials } from '../models/material.model';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {
  private http = inject(HttpClient);
  private timerService = inject(TimerService);

  private readonly FORECAST_URL = 'https://docs.google.com/spreadsheets/d/1gWTEeQnFlNePLTOLCbrzyMWljJjR01L84z2tpeaOAi8/export?format=csv&gid=1635134007';
  private readonly CACHE_TODAY_KEY = 'orna_today_forecast';
  private readonly CACHE_TOMORROW_KEY = 'orna_tomorrow_forecast';
  private readonly CACHE_CATALOG_KEY = 'orna_materials_catalog';
  private readonly LAST_UPDATED_KEY = 'orna_materials_last_updated';

  private todaySubject = new BehaviorSubject<DayForecast | null>(null);
  public today$ = this.todaySubject.asObservable();

  private tomorrowSubject = new BehaviorSubject<DayForecast | null>(null);
  public tomorrow$ = this.tomorrowSubject.asObservable();

  private catalogSubject = new BehaviorSubject<MaterialSearchResult[]>([]);
  public catalog$ = this.catalogSubject.asObservable();

  public lastUpdated: Date | null = null;
  private autoRefreshSub: Subscription | null = null;

  constructor() {
    this.loadFromCache();
    this.loadData();

    // Auto-refresh every 5 minutes
    this.autoRefreshSub = interval(5 * 60 * 1000).subscribe(() => {
      this.loadData();
    });

    // Refresh on midnight
    this.timerService.dayReset$.subscribe(() => {
      setTimeout(() => this.loadData(), 30000);
    });
  }

  get isStale(): boolean {
    return this.timerService.isInStaleWindow();
  }

  loadData(): void {
    this.http.get(this.FORECAST_URL, { responseType: 'text' }).subscribe({
      next: (csvData) => {
        this.parseForecastCsv(csvData);
        this.lastUpdated = new Date();
        localStorage.setItem(this.LAST_UPDATED_KEY, this.lastUpdated.toISOString());
      },
      error: (err) => {
        console.error('Failed to load Forecast CSV data', err);
      }
    });
  }

  private loadFromCache(): void {
    const cachedToday = localStorage.getItem(this.CACHE_TODAY_KEY);
    const cachedTomorrow = localStorage.getItem(this.CACHE_TOMORROW_KEY);
    const cachedCatalog = localStorage.getItem(this.CACHE_CATALOG_KEY);
    const cachedDate = localStorage.getItem(this.LAST_UPDATED_KEY);

    if (cachedToday) {
      try {
        this.todaySubject.next(JSON.parse(cachedToday));
      } catch (e) {
        console.error('Error parsing cached today', e);
      }
    }
    if (cachedTomorrow) {
      try {
        this.tomorrowSubject.next(JSON.parse(cachedTomorrow));
      } catch (e) {
        console.error('Error parsing cached tomorrow', e);
      }
    }
    if (cachedCatalog) {
      try {
        this.catalogSubject.next(JSON.parse(cachedCatalog));
      } catch (e) {
        console.error('Error parsing cached catalog', e);
      }
    }
    if (cachedDate) {
      this.lastUpdated = new Date(cachedDate);
    }
  }

  private parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          fields.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    fields.push(current);
    return fields;
  }

  private parseForecastCsv(csvText: string): void {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 15) return;

    let todayIdx = -1;
    let tomorrowIdx = -1;
    let todayTitle = "Today's Date";
    let tomorrowTitle = "Tomorrow's Stock";

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("Today's Date")) {
        todayIdx = i;
        const f = this.parseCsvLine(lines[i]);
        if (f[1]?.trim()) todayTitle = f[1].trim();
      }
      if (lines[i].includes("Tomorrow's Stock")) {
        tomorrowIdx = i;
        const f = this.parseCsvLine(lines[i]);
        if (f[1]?.trim()) tomorrowTitle = f[1].trim();
      }
    }

    // 1. Parse TODAY guilds
    const todayGuilds: GuildStock[] = [];
    if (todayIdx !== -1 && tomorrowIdx !== -1) {
      for (let i = todayIdx + 1; i < tomorrowIdx; i++) {
        const f = this.parseCsvLine(lines[i]);
        const guild = f[2]?.trim();
        const matsStr = f[3]?.trim();
        if (guild && matsStr) {
          const mats = matsStr.split(',').map(m => m.trim()).filter(m => m.length > 0);
          todayGuilds.push({ guildName: guild, materials: mats });
        }
      }
    }

    const todayForecast: DayForecast = {
      dateTitle: todayTitle,
      guilds: todayGuilds
    };
    this.todaySubject.next(todayForecast);
    localStorage.setItem(this.CACHE_TODAY_KEY, JSON.stringify(todayForecast));

    // 2. Parse TOMORROW guilds
    const tomorrowGuilds: GuildStock[] = [];
    if (tomorrowIdx !== -1) {
      for (let i = tomorrowIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('ALL MISSING DATA') || line.includes('We are 99.9% done')) break;
        const f = this.parseCsvLine(line);
        const guild = f[2]?.trim();
        const matsStr = f[3]?.trim();
        if (guild && matsStr) {
          const mats = matsStr.split(',').map(m => m.trim()).filter(m => m.length > 0);
          tomorrowGuilds.push({ guildName: guild, materials: mats });
        }
      }
    }

    const tomorrowForecast: DayForecast = {
      dateTitle: tomorrowTitle,
      guilds: tomorrowGuilds
    };
    this.tomorrowSubject.next(tomorrowForecast);
    localStorage.setItem(this.CACHE_TOMORROW_KEY, JSON.stringify(tomorrowForecast));

    // 3. Parse NEXT APPEARANCES table (All materials across all guilds)
    // Find the row containing 'Material' header for Next Appearances
    let headerRowIdx = -1;
    let guildColumns: { col: number; guild: string }[] = [];
    let matColIdx = 11;

    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const f = this.parseCsvLine(lines[i]);
      const idx = f.findIndex(val => val.trim().toLowerCase() === 'material');
      if (idx !== -1) {
        headerRowIdx = i;
        matColIdx = idx;
        for (let c = idx + 1; c < f.length; c++) {
          const gName = f[c]?.trim();
          if (gName) {
            guildColumns.push({ col: c, guild: gName });
          }
        }
        break;
      }
    }

    // Fallback if not found by exact string
    if (guildColumns.length === 0) {
      const defaultGuilds = ['Anguish 1.0', 'Agony', 'Despair', 'Melancholy', 'Torment', 'Coral', 'Deepshards', 'Remembrance', 'Sparring', 'Trials', 'Towers', 'Towers (Balor, HoA)'];
      defaultGuilds.forEach((g, idx) => guildColumns.push({ col: 12 + idx, guild: g }));
    }

    const catalog: MaterialSearchResult[] = [];
    const now = new Date();
    const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const startRow = headerRowIdx !== -1 ? headerRowIdx + 2 : 6;

    for (let i = startRow; i < lines.length; i++) {
      const f = this.parseCsvLine(lines[i]);
      // Check column matColIdx or search for the material name
      let mat = f[matColIdx]?.trim() || f[11]?.trim() || f[10]?.trim();
      if (!mat || mat.startsWith('ALL MISSING') || mat.includes(':') || mat.length < 2) continue;

      const appearances: MaterialGuildAppearance[] = [];

      guildColumns.forEach(gc => {
        const dateVal = f[gc.col]?.trim();
        if (dateVal && dateVal !== '#N/A' && dateVal !== 'N/A' && dateVal.length > 2) {
          let daysUntil: number | null = null;
          try {
            const parsedD = new Date(`${dateVal}, ${now.getUTCFullYear()} UTC`);
            if (!isNaN(parsedD.getTime())) {
              let diff = Math.round((parsedD.getTime() - todayMidnight.getTime()) / 86400000);
              if (diff < 0) {
                const nextYearD = new Date(`${dateVal}, ${now.getUTCFullYear() + 1} UTC`);
                diff = Math.round((nextYearD.getTime() - todayMidnight.getTime()) / 86400000);
              }
              daysUntil = diff;
            }
          } catch (e) {
            // ignore
          }

          appearances.push({
            guildName: gc.guild,
            nextDate: dateVal,
            daysUntil
          });
        }
      });

      if (appearances.length > 0) {
        appearances.sort((a, b) => (a.daysUntil ?? 999) - (b.daysUntil ?? 999));
        catalog.push({
          materialName: mat,
          guildAppearances: appearances
        });
      }
    }

    catalog.sort((a, b) => a.materialName.localeCompare(b.materialName));
    this.catalogSubject.next(catalog);
    localStorage.setItem(this.CACHE_CATALOG_KEY, JSON.stringify(catalog));
  }

  getAllMaterialNames(): string[] {
    return this.catalogSubject.value.map(c => c.materialName);
  }

  searchMaterial(name: string): MaterialSearchResult | null {
    const search = name.trim().toLowerCase();
    return this.catalogSubject.value.find(c => c.materialName.toLowerCase() === search) || null;
  }
}

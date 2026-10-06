import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Subject } from 'rxjs';
import { TowerKind, TowerInfo, TowersService } from './towers.service';

export interface ScheduledReminder {
  id: number;
  type: 'material' | 'tower';
  key: string; // materialName or towerKind
  title: string;
  body: string;
  targetTime: string; // ISO string
  createdAt: string;
  guild?: string; // material reminders: guild where it will appear
  mode?: 'normal' | 'specific'; // material reminders: nearest guild vs chosen guild
  displayName?: string;
}

const STORAGE_MATERIAL_REMINDERS = 'lastresources_material_reminders';
const STORAGE_TOWER_REMINDERS = 'lastresources_tower_reminders';
const STORAGE_ALL_TOWERS_ENABLED = 'lastresources_all_towers_50_notify';
const STORAGE_CUSTOM_FLOOR = 'lastresources_tower_custom_floor'; // legacy number (16..49) or absent
const STORAGE_CUSTOM_FLOORS = 'lastresources_tower_custom_floors'; // array of numbers
const STORAGE_CUSTOM_FLOOR_REMINDERS = 'lastresources_tower_custom_floor_reminders';
/** How many upcoming occurrences per tower are pre-scheduled for the custom floor alert. */
const CUSTOM_FLOOR_OCCURRENCES = 2;

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private isNative = Capacitor.isNativePlatform();
  private channelCreated = false;

  private materialReminders: Record<string, ScheduledReminder> = {};
  private towerReminders: Record<string, ScheduledReminder> = {};
  private customFloorReminders: Record<string, ScheduledReminder> = {};

  /** Emits whenever reminders are created/cancelled (used by the home-screen widget bridge). */
  readonly changed$ = new Subject<void>();

  constructor() {
    this.loadRemindersFromStorage();
    this.setupChannel();
  }

  private loadRemindersFromStorage(): void {
    try {
      const matRaw = localStorage.getItem(STORAGE_MATERIAL_REMINDERS);
      if (matRaw) this.materialReminders = JSON.parse(matRaw);

      const towRaw = localStorage.getItem(STORAGE_TOWER_REMINDERS);
      if (towRaw) this.towerReminders = JSON.parse(towRaw);

      const cfRaw = localStorage.getItem(STORAGE_CUSTOM_FLOOR_REMINDERS);
      if (cfRaw) this.customFloorReminders = JSON.parse(cfRaw);
    } catch (e) {
      console.error('Error loading reminders from storage:', e);
    }
  }

  private saveReminders(): void {
    try {
      localStorage.setItem(STORAGE_MATERIAL_REMINDERS, JSON.stringify(this.materialReminders));
      localStorage.setItem(STORAGE_TOWER_REMINDERS, JSON.stringify(this.towerReminders));
      localStorage.setItem(STORAGE_CUSTOM_FLOOR_REMINDERS, JSON.stringify(this.customFloorReminders));
    } catch (e) {
      console.error('Error saving reminders to storage:', e);
    }
    this.changed$.next();
  }

  private async setupChannel(): Promise<void> {
    if (!this.isNative || this.channelCreated) return;
    try {
      await LocalNotifications.createChannel({
        id: 'lastresources_alerts',
        name: 'Alertas LastResources',
        description: 'Recordatorios de materiales de gremios y torres en piso 50',
        importance: 4, // High importance (shows in status bar and popup heads-up)
        visibility: 1, // Public on lockscreen
        vibration: true,
        sound: 'default'
      });
      this.channelCreated = true;
    } catch (err) {
      console.warn('Could not create notification channel:', err);
    }
  }

  /**
   * Generates a stable positive 32-bit integer ID for LocalNotifications.
   */
  private generateNotificationId(prefix: string, key: string): number {
    const str = `${prefix}_${key}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 2147483640 + 1;
  }

  /**
   * Checks and requests notification permission from the user.
   */
  async requestPermission(): Promise<boolean> {
    if (this.isNative) {
      try {
        const check = await LocalNotifications.checkPermissions();
        if (check.display === 'granted') {
          return true;
        }
        const req = await LocalNotifications.requestPermissions();
        return req.display === 'granted';
      } catch (e) {
        console.error('Error requesting native notification permission:', e);
        return false;
      }
    } else {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') return true;
        if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          return perm === 'granted';
        }
      }
      return false;
    }
  }

  /**
   * Schedules a local notification at a specific Date.
   */
  private async scheduleLocal(id: number, title: string, body: string, at: Date): Promise<boolean> {
    const granted = await this.requestPermission();
    if (!granted) {
      console.warn('Notification permission not granted.');
      return false;
    }

    await this.setupChannel();

    // Ensure future date (at least 2 seconds from now)
    const now = Date.now();
    let scheduledDate = at;
    if (scheduledDate.getTime() <= now) {
      scheduledDate = new Date(now + 2000);
    }

    if (this.isNative) {
      try {
        // Cancel prior if any
        await LocalNotifications.cancel({ notifications: [{ id }] });

        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title,
              body,
              schedule: { at: scheduledDate },
              channelId: 'lastresources_alerts',
              smallIcon: 'ic_launcher',
              sound: 'default'
            }
          ]
        });
        return true;
      } catch (err) {
        console.error('Error scheduling native local notification:', err);
        return false;
      }
    } else {
      // Web notification fallback
      const delay = scheduledDate.getTime() - Date.now();
      if (delay > 0 && delay < 2147483647) {
        setTimeout(() => {
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: 'assets/icon/last_codex.png' });
          }
        }, delay);
      }
      return true;
    }
  }

  private async cancelLocal(id: number): Promise<void> {
    if (this.isNative) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id }] });
      } catch (err) {
        console.warn('Error canceling local notification:', err);
      }
    }
  }

  // ==========================================================================
  // MATERIAL REMINDERS
  // ==========================================================================

  isMaterialReminderActive(materialName: string): boolean {
    const item = this.materialReminders[materialName.toLowerCase()];
    if (!item) return false;
    // Check if still in future
    if (new Date(item.targetTime).getTime() > Date.now()) {
      return true;
    }
    delete this.materialReminders[materialName.toLowerCase()];
    this.saveReminders();
    return false;
  }

  getMaterialReminder(materialName: string): ScheduledReminder | null {
    if (this.isMaterialReminderActive(materialName)) {
      return this.materialReminders[materialName.toLowerCase()];
    }
    return null;
  }

  getAllActiveMaterialReminders(): ScheduledReminder[] {
    const now = Date.now();
    const active: ScheduledReminder[] = [];
    let changed = false;
    for (const key of Object.keys(this.materialReminders)) {
      const item = this.materialReminders[key];
      if (new Date(item.targetTime).getTime() > now) {
        active.push(item);
      } else {
        delete this.materialReminders[key];
        changed = true;
      }
    }
    if (changed) this.saveReminders();
    active.sort((a, b) => new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime());
    return active;
  }

  getNearestActiveMaterialReminder(): ScheduledReminder | null {
    const all = this.getAllActiveMaterialReminders();
    return all.length > 0 ? all[0] : null;
  }

  async scheduleMaterialReminder(
    materialName: string,
    targetDate: Date,
    displayName?: string,
    guildName?: string,
    mode: 'normal' | 'specific' = 'normal'
  ): Promise<boolean> {
    const key = materialName.toLowerCase();
    const id = this.generateNotificationId('mat', key);
    const name = displayName || materialName;

    let targetGuild = 'gremio más cercano';
    if (guildName && guildName.trim()) {
      const trimmed = guildName.trim();
      if (trimmed.toLowerCase().startsWith('gremio') || trimmed.toLowerCase().startsWith('guild')) {
        targetGuild = trimmed;
      } else {
        targetGuild = `gremio ${trimmed}`;
      }
    }

    const title = `¡Material Disponible: ${name}!`;
    const body = mode === 'specific'
      ? `El material ${name} ya está disponible en el ${targetGuild}.`
      : `El material ${name} está disponible hoy en ${targetGuild}.`;

    const success = await this.scheduleLocal(id, title, body, targetDate);
    if (success) {
      this.materialReminders[key] = {
        id,
        type: 'material',
        key,
        title,
        body,
        targetTime: targetDate.toISOString(),
        createdAt: new Date().toISOString(),
        guild: guildName || '',
        mode,
        displayName: name
      };
      this.saveReminders();
      return true;
    }
    return false;
  }

  async cancelMaterialReminder(materialName: string): Promise<void> {
    const key = materialName.toLowerCase();
    const item = this.materialReminders[key];
    if (item) {
      await this.cancelLocal(item.id);
      delete this.materialReminders[key];
      this.saveReminders();
    }
  }

  // ==========================================================================
  // TOWER 50F REMINDERS
  // ==========================================================================

  isTowerReminderActive(kind: TowerKind): boolean {
    const item = this.towerReminders[kind];
    if (!item) return false;
    if (new Date(item.targetTime).getTime() > Date.now()) {
      return true;
    }
    delete this.towerReminders[kind];
    this.saveReminders();
    return false;
  }

  getTowerReminder(kind: TowerKind): ScheduledReminder | null {
    if (this.isTowerReminderActive(kind)) {
      return this.towerReminders[kind];
    }
    return null;
  }

  async scheduleTower50Reminder(kind: TowerKind, towerTitle: string, targetDate: Date): Promise<boolean> {
    const id = this.generateNotificationId('tower', kind);
    const title = `¡${towerTitle} al Piso 50!`;
    const body = `La ${towerTitle} acaba de alcanzar su punto máximo (Piso 50).\n¡Es momento de farmear!`;

    const success = await this.scheduleLocal(id, title, body, targetDate);
    if (success) {
      this.towerReminders[kind] = {
        id,
        type: 'tower',
        key: kind,
        title,
        body,
        targetTime: targetDate.toISOString(),
        createdAt: new Date().toISOString()
      };
      this.saveReminders();
      return true;
    }
    return false;
  }

  async cancelTower50Reminder(kind: TowerKind): Promise<void> {
    const item = this.towerReminders[kind];
    if (item) {
      await this.cancelLocal(item.id);
      delete this.towerReminders[kind];
      this.saveReminders();
    }
  }

  // ==========================================================================
  // ALL TOWERS AT 50F (SETTINGS TOGGLE)
  // ==========================================================================

  isAllTowersNotificationEnabled(): boolean {
    return localStorage.getItem(STORAGE_ALL_TOWERS_ENABLED) === 'true';
  }

  async setAllTowersNotificationEnabled(enabled: boolean, towers: TowerInfo[]): Promise<boolean> {
    if (enabled) {
      const granted = await this.requestPermission();
      if (!granted) return false;

      localStorage.setItem(STORAGE_ALL_TOWERS_ENABLED, 'true');
      await this.syncAllTowersNotifications(towers);
      return true;
    } else {
      localStorage.setItem(STORAGE_ALL_TOWERS_ENABLED, 'false');
      // Cancel automatic tower reminders
      for (const t of towers) {
        await this.cancelTower50Reminder(t.kind);
      }
      return false;
    }
  }

  async syncAllTowersNotifications(towers: TowerInfo[]): Promise<void> {
    if (!this.isAllTowersNotificationEnabled()) return;

    for (const t of towers) {
      if (t.next50Date && t.next50Date.getTime() > Date.now()) {
        await this.scheduleTower50Reminder(t.kind, t.title, t.next50Date);
      }
    }
  }

  // ==========================================================================
  // CUSTOM FLOOR TOWERS REMINDER (SETTINGS PREDETERMINADO / PERSONALIZADO)
  // ==========================================================================

  getCustomFloors(): number[] {
    try {
      const raw = localStorage.getItem(STORAGE_CUSTOM_FLOORS);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return arr
            .map(n => parseInt(n, 10))
            .filter(n => !isNaN(n) && n >= 15 && n < 50)
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort((a, b) => a - b);
        }
      }
      // Backward compatibility fallback to legacy single floor
      const legacyRaw = localStorage.getItem(STORAGE_CUSTOM_FLOOR);
      if (legacyRaw) {
        const n = parseInt(legacyRaw, 10);
        if (!isNaN(n) && n >= 15 && n < 50) {
          return [n];
        }
      }
    } catch (e) {
      console.warn('Error reading custom floors:', e);
    }
    return [];
  }

  getCustomFloorSetting(): number | null {
    const list = this.getCustomFloors();
    return list.length > 0 ? list[0] : null;
  }

  async setCustomFloorSetting(floor: number | null, towersService: TowersService, lang: 'es' | 'en' = 'es'): Promise<boolean> {
    if (floor === null || floor < 15 || floor >= 50) {
      return await this.clearAllCustomFloors();
    }
    return await this.saveAndScheduleCustomFloors([floor], towersService, lang);
  }

  async addCustomFloor(floor: number, towersService: TowersService, lang: 'es' | 'en' = 'es'): Promise<boolean> {
    if (floor < 15 || floor >= 50) return false;
    const current = this.getCustomFloors();
    if (current.includes(floor)) return true;
    current.push(floor);
    current.sort((a, b) => a - b);
    return await this.saveAndScheduleCustomFloors(current, towersService, lang);
  }

  async removeCustomFloor(floor: number, towersService: TowersService, lang: 'es' | 'en' = 'es'): Promise<boolean> {
    const current = this.getCustomFloors().filter(f => f !== floor);
    return await this.saveAndScheduleCustomFloors(current, towersService, lang);
  }

  async clearAllCustomFloors(): Promise<boolean> {
    for (const key of Object.keys(this.customFloorReminders)) {
      const item = this.customFloorReminders[key];
      if (item) {
        await this.cancelLocal(item.id);
      }
    }
    this.customFloorReminders = {};
    localStorage.removeItem(STORAGE_CUSTOM_FLOORS);
    localStorage.removeItem(STORAGE_CUSTOM_FLOOR);
    this.saveReminders();
    return true;
  }

  async saveAndScheduleCustomFloors(floors: number[], towersService: TowersService, lang: 'es' | 'en' = 'es'): Promise<boolean> {
    // 1. Cancel previous custom floor reminders
    for (const key of Object.keys(this.customFloorReminders)) {
      const item = this.customFloorReminders[key];
      if (item) {
        await this.cancelLocal(item.id);
      }
    }
    this.customFloorReminders = {};

    if (floors.length === 0) {
      localStorage.removeItem(STORAGE_CUSTOM_FLOORS);
      localStorage.removeItem(STORAGE_CUSTOM_FLOOR);
      this.saveReminders();
      return true;
    }

    const granted = await this.requestPermission();
    if (!granted) return false;

    localStorage.setItem(STORAGE_CUSTOM_FLOORS, JSON.stringify(floors));
    localStorage.setItem(STORAGE_CUSTOM_FLOOR, floors[0].toString());

    // Schedule for each tower and each floor
    const towers = towersService.getTowers(lang);
    for (const floor of floors) {
      for (const t of towers) {
        const nextDates = towersService.findNextFloorDates(t.kind, floor, CUSTOM_FLOOR_OCCURRENCES);
        let idx = 0;
        for (const d of nextDates) {
          idx++;
          const remKey = `${t.kind}_f${floor}_${idx}`;
          const id = this.generateNotificationId('custom_floor', remKey);
          const title = lang === 'es' ? `¡${t.title} al Piso ${floor}!` : `¡${t.title} at Floor ${floor}!`;
          const body = lang === 'es'
            ? `La ${t.title} acaba de alcanzar el piso ${floor}.\n¡Es momento de aprovechar su rotación!`
            : `${t.title} just reached Floor ${floor}.\nTime to take advantage!`;

          const ok = await this.scheduleLocal(id, title, body, d);
          if (ok) {
            this.customFloorReminders[remKey] = {
              id,
              type: 'tower',
              key: remKey,
              title,
              body,
              targetTime: d.toISOString(),
              createdAt: new Date().toISOString()
            };
          }
        }
      }
    }
    this.saveReminders();
    return true;
  }
}

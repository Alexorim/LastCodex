import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { TowerKind, TowerInfo } from './towers.service';

export interface ScheduledReminder {
  id: number;
  type: 'material' | 'tower';
  key: string; // materialName or towerKind
  title: string;
  body: string;
  targetTime: string; // ISO string
  createdAt: string;
}

const STORAGE_MATERIAL_REMINDERS = 'lastresources_material_reminders';
const STORAGE_TOWER_REMINDERS = 'lastresources_tower_reminders';
const STORAGE_ALL_TOWERS_ENABLED = 'lastresources_all_towers_50_notify';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private isNative = Capacitor.isNativePlatform();
  private channelCreated = false;

  private materialReminders: Record<string, ScheduledReminder> = {};
  private towerReminders: Record<string, ScheduledReminder> = {};

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
    } catch (e) {
      console.error('Error loading reminders from storage:', e);
    }
  }

  private saveReminders(): void {
    try {
      localStorage.setItem(STORAGE_MATERIAL_REMINDERS, JSON.stringify(this.materialReminders));
      localStorage.setItem(STORAGE_TOWER_REMINDERS, JSON.stringify(this.towerReminders));
    } catch (e) {
      console.error('Error saving reminders to storage:', e);
    }
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

  async scheduleMaterialReminder(materialName: string, targetDate: Date, displayName?: string): Promise<boolean> {
    const key = materialName.toLowerCase();
    const id = this.generateNotificationId('mat', key);
    const name = displayName || materialName;

    const title = `📦 ¡Material Disponible: ${name}!`;
    const body = `El material ${name} ya está disponible en la rotación de materiales de gremios.`;

    const success = await this.scheduleLocal(id, title, body, targetDate);
    if (success) {
      this.materialReminders[key] = {
        id,
        type: 'material',
        key,
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
    const title = `⭐ ¡${towerTitle} al Piso 50!`;
    const body = `La ${towerTitle} acaba de alcanzar su punto máximo (Piso 50). ¡Es momento de farmear esquirlas celestiales!`;

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
}

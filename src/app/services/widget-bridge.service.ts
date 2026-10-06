import { Injectable, inject } from '@angular/core';
import { registerPlugin, Capacitor } from '@capacitor/core';
import { TowersService } from './towers.service';
import { NotificationsService, ScheduledReminder } from './notifications.service';
import { SettingsService } from './settings.service';
import { interval } from 'rxjs';

interface WidgetBridgePluginInterface {
  updateWidget(options: {
    towerName: string;
    towerFloor: number;
    towerTime: string;
    matActive: boolean;
    matName?: string;
    matGuild?: string;
    matTime?: string;
  }): Promise<{ success: boolean }>;
}

const WidgetBridge = registerPlugin<WidgetBridgePluginInterface>('WidgetBridge');

@Injectable({
  providedIn: 'root'
})
export class WidgetBridgeService {
  private towersService = inject(TowersService);
  private notificationsService = inject(NotificationsService);
  private settingsService = inject(SettingsService);

  private isNative = Capacitor.isNativePlatform();

  constructor() {
    this.init();
  }

  private init(): void {
    if (!this.isNative) return;

    // Sync on launch
    setTimeout(() => this.syncWidget(), 1000);

    // Sync when reminders change
    this.notificationsService.changed$.subscribe(() => {
      this.syncWidget();
    });

    // Periodic sync every 5 minutes to keep remaining time and tower rotations fresh
    interval(5 * 60 * 1000).subscribe(() => {
      this.syncWidget();
    });
  }

  async syncWidget(): Promise<void> {
    if (!this.isNative) return;

    try {
      const lang: 'es' | 'en' = this.settingsService.currentLang === 'en' ? 'en' : 'es';
      const towers = this.towersService.getTowers(lang);

      if (!towers || towers.length === 0) return;

      // 1. Highest Tower (torre con mayor cantidad de pisos actuales)
      const highest = towers.reduce((prev, curr) => (curr.currentFloor > prev.currentFloor ? curr : prev), towers[0]);

      const towerName = highest.title;
      const towerFloor = highest.currentFloor;
      const towerTime = highest.isMaxFloor
        ? (lang === 'es' ? '¡Activa en 50 pisos!' : 'Active at 50F!')
        : (lang === 'es' ? `Para 50F: ${highest.timeUntil50}` : `To 50F: ${highest.timeUntil50}`);

      // 2. Active Material Reminder (el recordatorio activo más próximo)
      const nearestMat: ScheduledReminder | null = this.notificationsService.getNearestActiveMaterialReminder();
      let matActive = false;
      let matName = '';
      let matGuild = '';
      let matTime = '';

      if (nearestMat) {
        matActive = true;
        matName = nearestMat.displayName || nearestMat.key;
        matGuild = nearestMat.guild ? (nearestMat.guild.startsWith('gremio') ? nearestMat.guild : `Gremio ${nearestMat.guild}`) : 'En gremio';

        const diffMs = new Date(nearestMat.targetTime).getTime() - Date.now();
        if (diffMs > 0) {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const days = Math.floor(hours / 24);
          const remHours = hours % 24;
          if (days > 0) {
            matTime = lang === 'es' ? `En ${days}d ${remHours}h` : `In ${days}d ${remHours}h`;
          } else {
            matTime = lang === 'es' ? `En ${hours}h` : `In ${hours}h`;
          }
        } else {
          matTime = lang === 'es' ? '¡Hoy!' : 'Today!';
        }
      }

      await WidgetBridge.updateWidget({
        towerName,
        towerFloor,
        towerTime,
        matActive,
        matName,
        matGuild,
        matTime
      });
    } catch (err) {
      console.warn('Could not sync Android Widget:', err);
    }
  }
}

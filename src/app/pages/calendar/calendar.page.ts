import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronDown, chevronForward, calendarOutline, shieldOutline, alarm, alarmOutline, timeOutline, notificationsOutline } from 'ionicons/icons';
import { MaterialsService } from '../../services/materials.service';
import { SettingsService, Language } from '../../services/settings.service';
import { NotificationsService } from '../../services/notifications.service';
import { MaterialSearchResult } from '../../models/material.model';
import { getMaterialIcon } from '../../utils/material-icon.util';
import { getGuildIcon } from '../../utils/guild-icon.util';
import { translateMaterialName } from '../../utils/material-translation.util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CalendarPage implements OnInit, OnDestroy {
  private materialsService = inject(MaterialsService);
  private settingsService = inject(SettingsService);
  private notificationsService = inject(NotificationsService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  private dataSub: Subscription | null = null;
  private langSub: Subscription | null = null;

  catalog: MaterialSearchResult[] = [];
  expandedMaterial: string | null = null;
  currentLang: Language = 'es';

  constructor() {
    addIcons({ chevronDown, chevronForward, calendarOutline, shieldOutline, alarm, alarmOutline, timeOutline, notificationsOutline });
  }

  ngOnInit() {
    this.langSub = this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.dataSub = this.materialsService.catalog$.subscribe(cat => {
      this.catalog = cat;
    });
  }

  ngOnDestroy() {
    this.dataSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  getMatIcon(name: string): string {
    return getMaterialIcon(name);
  }

  getMatName(name: string): string {
    return translateMaterialName(name, this.currentLang);
  }

  getGuildImg(name: string): string {
    return getGuildIcon(name);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src) {
      if (target.src.includes('assets/materials/')) {
        const file = target.src.split('assets/materials/').pop();
        if (file && !target.dataset['fallbackTried']) {
          target.dataset['fallbackTried'] = '1';
          target.src = `assets/codex/materials/${file}`;
          return;
        }
      }
      if (target.src.includes('assets/codex/')) {
        const match = target.src.match(/assets\/codex\/(.+)$/);
        if (match && match[1] && !target.dataset['remoteTried']) {
          target.dataset['remoteTried'] = '1';
          target.src = `https://playorna.com/static/img/${match[1]}`;
          return;
        }
      }
      target.style.display = 'none';
    }
  }

  toggleMaterial(matName: string) {
    if (this.expandedMaterial === matName) {
      this.expandedMaterial = null;
    } else {
      this.expandedMaterial = matName;
    }
  }

  isExpanded(matName: string): boolean {
    return this.expandedMaterial === matName;
  }

  getGuildColor(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('anguish')) return '#ff5252';
    if (lower.includes('agony')) return '#ff7043';
    if (lower.includes('despair')) return '#ab47bc';
    if (lower.includes('melancholy')) return '#5c6bc0';
    if (lower.includes('torment')) return '#26a69a';
    if (lower.includes('coral')) return '#ec407a';
    if (lower.includes('deepshards') || lower.includes('shard')) return '#42a5f5';
    if (lower.includes('remembrance') || lower.includes('memory')) return '#26c6da';
    if (lower.includes('sparring') || lower.includes('blade')) return '#66bb6a';
    if (lower.includes('trials')) return '#ffa726';
    if (lower.includes('towers') || lower.includes('titan')) return '#8d6e63';
    if (lower.includes('monument')) return '#7e57c2';
    return '#78909c';
  }

  isReminderSet(materialName: string): boolean {
    return this.notificationsService.isMaterialReminderActive(materialName);
  }

  async onMaterialClockClick(event: Event, item: MaterialSearchResult): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    const isEs = this.currentLang === 'es';
    const matName = this.getMatName(item.materialName);
    const isAlreadySet = this.isReminderSet(item.materialName);

    if (isAlreadySet) {
      const alert = await this.alertCtrl.create({
        header: isEs ? 'Recordatorio Activo' : 'Active Reminder',
        subHeader: matName,
        message: isEs
          ? `Ya tienes una alerta programada para cuando aparezca ${matName}. ¿Deseas cancelarla?`
          : `You already have an alert scheduled for ${matName}. Do you want to cancel it?`,
        buttons: [
          {
            text: isEs ? 'Mantener' : 'Keep',
            role: 'cancel'
          },
          {
            text: isEs ? 'Cancelar Recordatorio' : 'Cancel Reminder',
            role: 'destructive',
            handler: async () => {
              await this.notificationsService.cancelMaterialReminder(item.materialName);
              const toast = await this.toastCtrl.create({
                message: isEs ? `Recordatorio cancelado para ${matName}` : `Reminder canceled for ${matName}`,
                duration: 2000,
                position: 'bottom',
                color: 'medium'
              });
              await toast.present();
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    // Determine target date
    const firstApp = item.guildAppearances && item.guildAppearances.length > 0 ? item.guildAppearances[0] : null;
    const daysUntil = firstApp && typeof firstApp.daysUntil === 'number' ? firstApp.daysUntil : 1;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysUntil);
    targetDate.setHours(0, 5, 0, 0); // 5 min after 00:00 rotation

    const dateStr = targetDate.toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });

    const alert = await this.alertCtrl.create({
      header: isEs ? 'Crear Recordatorio' : 'Set Reminder',
      subHeader: matName,
      message: isEs
        ? `¿Quieres programar una notificación para avisarte cuando ${matName} esté disponible en los gremios (${dateStr})?`
        : `Do you want to set a notification to alert you when ${matName} is in guilds (${dateStr})?`,
      buttons: [
        {
          text: isEs ? 'No' : 'No',
          role: 'cancel'
        },
        {
          text: isEs ? 'Sí, avisarme' : 'Yes, notify me',
          handler: async () => {
            const success = await this.notificationsService.scheduleMaterialReminder(
              item.materialName,
              targetDate,
              matName,
              firstApp?.guildName
            );

            if (success) {
              const toast = await this.toastCtrl.create({
                message: isEs
                  ? `🔔 ¡Listo! Te avisaremos cuando salga ${matName}`
                  : `🔔 Ready! We will notify you when ${matName} appears`,
                duration: 2500,
                position: 'bottom',
                color: 'success'
              });
              await toast.present();
            } else {
              const toast = await this.toastCtrl.create({
                message: isEs
                  ? '⚠️ Debes permitir las notificaciones para activar recordatorios'
                  : '⚠️ Please enable notifications to activate reminders',
                duration: 3000,
                position: 'bottom',
                color: 'warning'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}

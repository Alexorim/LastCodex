import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  sparkles,
  calendarOutline,
  refreshOutline,
  informationCircleOutline,
  closeOutline,
  openOutline,
  flashOutline,
  shieldOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  flameOutline,
  waterOutline,
  moonOutline,
  sunnyOutline,
  trendingUpOutline,
  alarm,
  alarmOutline,
  notificationsOutline,
  calculatorOutline
} from 'ionicons/icons';
import { TowersService, TowerInfo, TowerKind, CheckpointProjection, NextGrowthTimer, TowerResetProgression, TOWERS_META } from '../../services/towers.service';
import { SettingsService, Language } from '../../services/settings.service';
import { NotificationsService } from '../../services/notifications.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-towers',
  templateUrl: './towers.page.html',
  styleUrls: ['./towers.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TowersPage implements OnInit, OnDestroy {
  private towersService = inject(TowersService);
  private settingsService = inject(SettingsService);
  private notificationsService = inject(NotificationsService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentLang: Language = 'es';
  selectedTab: 'current' | 'peaks' | 'schedule' = 'current';
  selectedTowerFilter: 'all' | TowerKind = 'all';

  towers: TowerInfo[] = [];
  nextTimer: NextGrowthTimer | null = null;
  projections: CheckpointProjection[] = [];
  selectedTowerDetail: TowerInfo | null = null;
  selectedTowerResets: TowerResetProgression[] = [];
  isDetailModalOpen = false;

  private subs = new Subscription();
  private timerInterval: any = null;

  constructor() {
    addIcons({
      timeOutline,
      sparkles,
      calendarOutline,
      refreshOutline,
      informationCircleOutline,
      closeOutline,
      openOutline,
      flashOutline,
      shieldOutline,
      arrowForwardOutline,
      checkmarkCircleOutline,
      chevronForwardOutline,
      flameOutline,
      waterOutline,
      moonOutline,
      sunnyOutline,
      trendingUpOutline,
      alarm,
      alarmOutline,
      notificationsOutline,
      calculatorOutline
    });
  }

  ngOnInit() {
    this.subs.add(
      this.settingsService.lang$.subscribe((lang) => {
        this.currentLang = lang;
        this.refreshData();
      })
    );

    this.subs.add(
      this.settingsService.tabClick$.subscribe((tab) => {
        if (tab === 'towers' && this.isDetailModalOpen) {
          this.closeTowerDetail();
          this.cdr.detectChanges();
        }
      })
    );

    this.refreshData();

    // Live countdown update every second
    this.timerInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  refreshData() {
    const lang = this.currentLang === 'es' ? 'es' : 'en';
    const now = new Date();
    this.towers = this.towersService.getTowers(lang, now);
    this.nextTimer = this.towersService.getNextGrowthCountdown(now, lang);
    this.projections = this.towersService.getProjections(now, 42, lang);
    this.cdr.detectChanges();
  }

  updateCountdown() {
    const lang = this.currentLang === 'es' ? 'es' : 'en';
    const now = new Date();
    this.nextTimer = this.towersService.getNextGrowthCountdown(now, lang);

    // If countdown hits zero, refresh all tower floors
    if (this.nextTimer.remainingSecondsTotal <= 0) {
      this.refreshData();
    }
    this.cdr.detectChanges();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProofs() {
    this.router.navigate(['/proofs']);
  }

  selectTab(tab: 'current' | 'peaks' | 'schedule') {
    this.selectedTab = tab;
  }

  openTowerDetail(tower: TowerInfo) {
    this.selectedTowerDetail = tower;
    const lang = this.currentLang === 'es' ? 'es' : 'en';
    this.selectedTowerResets = this.towersService.getUpcomingResetsForTower(tower.kind, 8, lang);
    this.isDetailModalOpen = true;
  }

  closeTowerDetail() {
    this.isDetailModalOpen = false;
    this.selectedTowerDetail = null;
    this.selectedTowerResets = [];
  }

  getSortedPeaks(): TowerInfo[] {
    return [...this.towers].sort((a, b) => {
      if (a.isMaxFloor && !b.isMaxFloor) return -1;
      if (!a.isMaxFloor && b.isMaxFloor) return 1;
      if (a.next50Date && b.next50Date) {
        return a.next50Date.getTime() - b.next50Date.getTime();
      }
      return 0;
    });
  }

  getFilteredProjections(): CheckpointProjection[] {
    if (this.selectedTowerFilter === 'all') {
      return this.projections;
    }
    return this.projections;
  }

  getTowerLore(kind?: TowerKind): string {
    if (!kind) return '';
    const meta = TOWERS_META[kind];
    return this.currentLang === 'es' ? meta.loreEs : meta.loreEn;
  }

  getTitanCodexUrl(kind: TowerKind): string {
    return `https://playorna.com/codex/monsters/titan-${kind}/`;
  }

  openCodexSearch(kind: TowerKind) {
    const meta = TOWERS_META[kind];
    this.closeTowerDetail();
    this.router.navigate(['/codex'], {
      queryParams: {
        entry: meta.codexId,
        search: meta.titanNameEs,
        cat: 'bosses'
      }
    });
  }

  getTowerIconName(kind: TowerKind): string {
    switch (kind) {
      case 'selene': return 'moon-outline';
      case 'eos': return 'sunny-outline';
      case 'oceanus': return 'water-outline';
      case 'themis': return 'shield-outline';
      case 'prometheus': return 'flame-outline';
      default: return 'sparkles';
    }
  }

  isTowerReminderActive(kind: TowerKind): boolean {
    return this.notificationsService.isTowerReminderActive(kind);
  }

  async onTowerReminderClick(tower: TowerInfo, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const isEs = this.currentLang === 'es';
    const isAlreadySet = this.isTowerReminderActive(tower.kind);

    if (isAlreadySet) {
      const alert = await this.alertCtrl.create({
        header: isEs ? 'Recordatorio Activo' : 'Active Reminder',
        subHeader: tower.title,
        message: isEs
          ? `Ya tienes programado un recordatorio para cuando la ${tower.title} alcance el Piso 50. ¿Deseas cancelarlo?`
          : `You already have an alert scheduled for when ${tower.title} reaches Floor 50. Do you want to cancel it?`,
        buttons: [
          {
            text: isEs ? 'Mantener' : 'Keep',
            role: 'cancel'
          },
          {
            text: isEs ? 'Cancelar Recordatorio' : 'Cancel Reminder',
            role: 'destructive',
            handler: async () => {
              await this.notificationsService.cancelTower50Reminder(tower.kind);
              const toast = await this.toastCtrl.create({
                message: isEs ? `Recordatorio cancelado para ${tower.title}` : `Reminder canceled for ${tower.title}`,
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

    if (tower.isMaxFloor) {
      const toast = await this.toastCtrl.create({
        message: isEs
          ? `⭐ ¡La ${tower.title} ya está en su punto máximo (Piso 50) hoy!`
          : `⭐ ${tower.title} is already at its peak (Floor 50) today!`,
        duration: 3000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      return;
    }

    if (!tower.next50Date) {
      return;
    }

    const alert = await this.alertCtrl.create({
      header: isEs ? 'Recordatorio Piso 50' : 'Floor 50 Reminder',
      subHeader: tower.title,
      message: isEs
        ? `¿Quieres recibir una notificación cuando la ${tower.title} alcance el Piso 50 el ${tower.next50Formatted} (en ${tower.timeUntil50})?`
        : `Do you want to get an alert when ${tower.title} reaches Floor 50 on ${tower.next50Formatted} (in ${tower.timeUntil50})?`,
      buttons: [
        {
          text: isEs ? 'No' : 'No',
          role: 'cancel'
        },
        {
          text: isEs ? 'Sí, avisarme' : 'Yes, notify me',
          handler: async () => {
            const success = await this.notificationsService.scheduleTower50Reminder(
              tower.kind,
              tower.title,
              tower.next50Date!
            );

            if (success) {
              const toast = await this.toastCtrl.create({
                message: isEs
                  ? `🔔 ¡Listo! Te notificaremos cuando ${tower.title} llegue al Piso 50`
                  : `🔔 Ready! We will notify you when ${tower.title} reaches Floor 50`,
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

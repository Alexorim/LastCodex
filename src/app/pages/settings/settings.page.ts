import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  settings,
  globeOutline,
  colorPaletteOutline,
  timeOutline,
  informationCircleOutline,
  shieldCheckmarkOutline,
  refreshOutline,
  cloudDownloadOutline,
  syncOutline,
  trashOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  fileTrayFullOutline,
  sparkles,
  openOutline,
  closeOutline,
  chevronForwardOutline,
  searchOutline,
  libraryOutline,
  downloadOutline,
  mapOutline,
  notificationsOutline,
  notifications,
  alarmOutline,
  alarm,
  shieldOutline,
  documentTextOutline,
  calculatorOutline,
  optionsOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { SettingsService, Language, ThemeMode, AVAILABLE_LANGUAGES, LanguageOption } from '../../services/settings.service';
import { TimerService } from '../../services/timer.service';
import { CodexService, SyncProgress, UpdateCheckResult } from '../../services/codex.service';
import { NotificationsService } from '../../services/notifications.service';
import { TowersService } from '../../services/towers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private timerService = inject(TimerService);
  private codexService = inject(CodexService);
  private notificationsService = inject(NotificationsService);
  private towersService = inject(TowersService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  private subs = new Subscription();

  currentLang: Language = 'es';
  currentTheme: ThemeMode = 'codex-dark';
  deviceTimezone = '';
  localResetTime = '';

  isAllTowersNotificationEnabled = false;
  customTowerFloor: number | null = null;
  customTowerFloors: number[] = [];

  versionNumber = '1.4.7.1';
  appVersion = `v${this.versionNumber}`;
  apkFileName = `lastresources_${this.versionNumber}.apk`;
  apkDownloadUrl = `https://lastresources.vercel.app/assets/${this.apkFileName}`;
  githubApkUrl = `https://github.com/Alexorim/LastCodex/raw/main/src/assets/${this.apkFileName}`;

  // Multi-language support (22 Orna languages)
  availableLanguages = AVAILABLE_LANGUAGES;
  selectedLangOption: LanguageOption = AVAILABLE_LANGUAGES[5]; // Default Spanish
  isLanguageModalOpen = false;
  languageFilter = '';

  // Codex status & sync
  totalCodexEntries = 0;
  lastSyncFormatted: string | null = null;
  isCustomData = false;
  checkingUpdates = false;

  syncProgress: SyncProgress = {
    running: false,
    percent: 0,
    currentCategory: '',
    statusText: ''
  };
  updateStatus: UpdateCheckResult | null = null;
  syncSuccessMessage: string | null = null;
  syncErrorMessage: string | null = null;

  // App updates state
  isCheckingAppUpdate = false;
  appUpdateStatus: 'idle' | 'up-to-date' | 'has-update' | 'error' = 'idle';
  latestRemoteVersion = '';
  appUpdateError = '';

  constructor() {
    addIcons({
      settings,
      globeOutline,
      colorPaletteOutline,
      timeOutline,
      informationCircleOutline,
      shieldCheckmarkOutline,
      refreshOutline,
      cloudDownloadOutline,
      syncOutline,
      trashOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      fileTrayFullOutline,
      sparkles,
      openOutline,
      closeOutline,
      chevronForwardOutline,
      searchOutline,
      libraryOutline,
      downloadOutline,
      mapOutline,
      notificationsOutline,
      notifications,
      alarmOutline,
      alarm,
      shieldOutline,
      documentTextOutline,
      calculatorOutline,
      optionsOutline
    });
  }

  goToProofs(): void {
    this.router.navigate(['/proofs']);
  }

  goToLegal(): void {
    this.router.navigate(['/legal']);
  }

  ngOnInit() {
    this.currentLang = this.settingsService.currentLang;
    this.currentTheme = this.settingsService.currentTheme;
    this.selectedLangOption = this.settingsService.getCurrentLanguageOption();

    try {
      this.deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC-5';
    } catch {
      this.deviceTimezone = 'UTC-5';
    }

    this.subs.add(
      this.settingsService.lang$.subscribe(lang => {
        this.currentLang = lang;
        this.selectedLangOption = this.settingsService.getCurrentLanguageOption();
      })
    );

    this.subs.add(
      this.settingsService.theme$.subscribe(theme => {
        this.currentTheme = theme;
      })
    );

    this.subs.add(
      this.timerService.localResetTime$.subscribe(time => {
        this.localResetTime = time;
      })
    );

    this.subs.add(
      this.codexService.entries$.subscribe(entries => {
        this.totalCodexEntries = entries.length;
      })
    );

    this.subs.add(
      this.codexService.lastSync$.subscribe(syncDate => {
        if (!syncDate) {
          this.lastSyncFormatted = null;
        } else {
          try {
            const date = new Date(syncDate);
            this.lastSyncFormatted = date.toLocaleString(
              this.currentLang === 'es' ? 'es-ES' : 'en-US',
              { dateStyle: 'medium', timeStyle: 'short' }
            );
          } catch {
            this.lastSyncFormatted = syncDate;
          }
        }
      })
    );

    this.subs.add(
      this.codexService.isCustomData$.subscribe(custom => {
        this.isCustomData = custom;
      })
    );

    this.subs.add(
      this.codexService.syncProgress$.subscribe(prog => {
        this.syncProgress = prog;
        if (prog.error) {
          this.syncErrorMessage = prog.error;
          this.syncSuccessMessage = null;
        }
      })
    );

    this.subs.add(
      this.codexService.updateStatus$.subscribe(status => {
        this.updateStatus = status;
      })
    );

    this.isAllTowersNotificationEnabled = this.notificationsService.isAllTowersNotificationEnabled();
    this.customTowerFloors = this.notificationsService.getCustomFloors();
    this.customTowerFloor = this.notificationsService.getCustomFloorSetting();

    // Verificación automática y silenciosa al entrar a Ajustes
    this.checkAppUpdates(true);
  }

  async addCustomFloorPrompt(): Promise<void> {
    const isEs = this.currentLang === 'es';
    const alert = await this.alertController.create({
      header: isEs ? 'Añadir Recordatorio de Pisos' : 'Add Floor Reminder',
      subHeader: isEs ? 'Notificación personalizada de torres' : 'Custom tower notification',
      message: isEs
        ? 'Indica el número de piso para recibir una alerta automática cuando cualquier torre lo alcance (ej: 16, 20, 40 pisos).'
        : 'Enter the floor count to get an automatic alert when any tower reaches it (e.g. 16, 20, 40 floors).',
      inputs: [
        {
          name: 'floor',
          type: 'number',
          min: 15,
          max: 49,
          placeholder: '16'
        }
      ],
      buttons: [
        {
          text: isEs ? 'Cancelar' : 'Cancel',
          role: 'cancel'
        },
        {
          text: isEs ? 'Añadir' : 'Add',
          handler: async (data: any) => {
            const val = parseInt(data.floor, 10);
            if (isNaN(val) || val < 15 || val >= 50) {
              const errToast = await this.toastCtrl.create({
                message: isEs ? 'El piso debe estar entre 15 y 49.' : 'Floor must be between 15 and 49.',
                duration: 2500,
                position: 'bottom',
                color: 'warning'
              });
              await errToast.present();
              return false;
            }

            if (this.customTowerFloors.includes(val)) {
              const dupToast = await this.toastCtrl.create({
                message: isEs ? `El piso ${val} ya tiene un recordatorio activo.` : `Floor ${val} already has an active reminder.`,
                duration: 2500,
                position: 'bottom',
                color: 'warning'
              });
              await dupToast.present();
              return false;
            }

            const ok = await this.notificationsService.addCustomFloor(val, this.towersService, isEs ? 'es' : 'en');
            if (ok) {
              this.customTowerFloors = this.notificationsService.getCustomFloors();
              this.customTowerFloor = this.notificationsService.getCustomFloorSetting();
              this.cdr.detectChanges();
              const toast = await this.toastCtrl.create({
                message: isEs
                  ? `🔔 Recordatorio añadido: Alerta cuando cualquier torre alcance ${val} pisos.`
                  : `🔔 Reminder added: Alert when any tower reaches ${val} floors.`,
                duration: 3000,
                position: 'bottom',
                color: 'success'
              });
              await toast.present();
              return true;
            } else {
              const toast = await this.toastCtrl.create({
                message: isEs
                  ? '⚠️ Se requieren permisos de notificación en tu celular.'
                  : '⚠️ Notification permission required on device.',
                duration: 3000,
                position: 'bottom',
                color: 'warning'
              });
              await toast.present();
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async removeCustomFloor(floor: number): Promise<void> {
    const isEs = this.currentLang === 'es';
    await this.notificationsService.removeCustomFloor(floor, this.towersService, isEs ? 'es' : 'en');
    this.customTowerFloors = this.notificationsService.getCustomFloors();
    this.customTowerFloor = this.notificationsService.getCustomFloorSetting();
    this.cdr.detectChanges();
    const toast = await this.toastCtrl.create({
      message: isEs ? `Recordatorio del piso ${floor} eliminado.` : `Floor ${floor} reminder removed.`,
      duration: 2000,
      position: 'bottom',
      color: 'medium'
    });
    await toast.present();
  }

  async configureCustomTowerFloor(): Promise<void> {
    await this.addCustomFloorPrompt();
  }

  async onAllTowersNotificationToggle(event: any): Promise<void> {
    const checked = event.detail ? event.detail.checked : event.target.checked;
    const isEs = this.currentLang === 'es';
    const towers = this.towersService.getTowers(isEs ? 'es' : 'en');
    const success = await this.notificationsService.setAllTowersNotificationEnabled(checked, towers);

    this.isAllTowersNotificationEnabled = this.notificationsService.isAllTowersNotificationEnabled();
    this.cdr.detectChanges();

    if (checked) {
      if (success) {
        const toast = await this.toastCtrl.create({
          message: isEs
            ? '🔔 Notificaciones activadas para todas las Torres en Piso 50'
            : '🔔 Notifications activated for all Towers at Floor 50',
          duration: 3000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      } else {
        const toast = await this.toastCtrl.create({
          message: isEs
            ? '⚠️ Debes conceder permisos de notificación en tu celular para activar esta alerta'
            : '⚠️ Please grant notification permission on your device to activate this alert',
          duration: 3500,
          position: 'bottom',
          color: 'warning'
        });
        await toast.present();
      }
    } else {
      const toast = await this.toastCtrl.create({
        message: isEs
          ? 'Notificaciones de Torres desactivadas'
          : 'Tower notifications disabled',
        duration: 2000,
        position: 'bottom',
        color: 'medium'
      });
      await toast.present();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  get filteredLanguages(): LanguageOption[] {
    if (!this.languageFilter.trim()) return this.availableLanguages;
    const q = this.languageFilter.toLowerCase().trim();
    return this.availableLanguages.filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.subname && l.subname.toLowerCase().includes(q)) ||
      l.code.toLowerCase().includes(q)
    );
  }

  openLanguageModal() {
    this.languageFilter = '';
    this.isLanguageModalOpen = true;
  }

  closeLanguageModal() {
    this.isLanguageModalOpen = false;
  }

  selectLanguage(lang: LanguageOption) {
    this.selectedLangOption = lang;
    this.currentLang = lang.code;
    this.settingsService.setLanguage(lang.code);
    this.isLanguageModalOpen = false;
  }

  onLanguageChange(lang: Language) {
    this.currentLang = lang;
    this.settingsService.setLanguage(lang);
    this.selectedLangOption = this.settingsService.getCurrentLanguageOption();
  }

  onThemeChange(theme: ThemeMode) {
    this.currentTheme = theme;
    this.settingsService.setTheme(theme);
  }

  async checkUpdates(): Promise<void> {
    this.checkingUpdates = true;
    this.syncSuccessMessage = null;
    this.syncErrorMessage = null;
    try {
      const res = await this.codexService.checkForUpdates();
      if (!res.hasUpdate && !res.error) {
        this.syncSuccessMessage = this.currentLang === 'es'
          ? `Tu Códice está al día (${res.currentCount.toLocaleString()} entradas). No hay contenido adicional pendiente.`
          : `Your Codex is up to date (${res.currentCount.toLocaleString()} entries). No new content pending.`;
      }
    } finally {
      this.checkingUpdates = false;
    }
  }

  async syncCodex(): Promise<void> {
    this.syncSuccessMessage = null;
    this.syncErrorMessage = null;
    const result = await this.codexService.syncFromPlayOrna();
    if (result.success) {
      this.syncSuccessMessage = this.currentLang === 'es'
        ? `¡Códice actualizado con éxito! Se cargaron ${result.count.toLocaleString()} entradas directamente de PlayOrna.`
        : `Codex successfully synced! Loaded ${result.count.toLocaleString()} entries directly from PlayOrna.`;
    } else if (result.error) {
      this.syncErrorMessage = result.error;
    }
  }

  async resetCodex(): Promise<void> {
    if (confirm(this.currentLang === 'es'
      ? '¿Deseas restaurar la base de datos preinstalada de fábrica?'
      : 'Do you want to reset to the factory bundled database?')) {
      await this.codexService.resetToDefault();
      this.syncSuccessMessage = this.currentLang === 'es'
        ? 'Base de datos restaurada a la versión preinstalada de fábrica.'
        : 'Database reset to bundled factory version.';
      this.syncErrorMessage = null;
    }
  }

  compareVersions(v1: string, v2: string): number {
    const parse = (v: string) => (v || '').replace(/^[^\d]*/, '').split('.').map(p => parseInt(p, 10) || 0);
    const p1 = parse(v1);
    const p2 = parse(v2);
    const len = Math.max(p1.length, p2.length);
    for (let i = 0; i < len; i++) {
      const num1 = p1[i] ?? 0;
      const num2 = p2[i] ?? 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  private async fetchWithTimeout(url: string, timeoutMs = 4000): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timer);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  async checkAppUpdates(silent = false): Promise<void> {
    if (this.isCheckingAppUpdate) return;
    this.isCheckingAppUpdate = true;
    if (!silent) {
      this.appUpdateError = '';
    }
    this.cdr.detectChanges();

    const cacheBuster = Date.now();
    let remoteVersion = '';
    let downloadUrl = `https://lastresources.vercel.app/assets/${this.apkFileName}`;
    let mirrorUrl = this.githubApkUrl;
    let fileName = this.apkFileName;

    try {
      // 1. Probar en primer lugar el servidor oficial en vivo de Vercel (Edge CDN, ultra rápido, sin bloqueos)
      try {
        const data = await this.fetchWithTimeout(
          `https://lastresources.vercel.app/assets/version.json?t=${cacheBuster}`,
          3500
        );
        if (data && data.version) {
          remoteVersion = data.version;
          if (data.downloadUrl) downloadUrl = data.downloadUrl;
          if (data.mirrorUrl) mirrorUrl = data.mirrorUrl;
          if (data.apkFileName) fileName = data.apkFileName;
        }
      } catch (e) {
        console.warn('Fallback 1 (Vercel CDN) failed:', e);
      }

      // 2. Probar raw.githubusercontent.com version.json
      if (!remoteVersion) {
        try {
          const data = await this.fetchWithTimeout(
            `https://raw.githubusercontent.com/Alexorim/LastCodex/main/src/assets/version.json?t=${cacheBuster}`,
            3500
          );
          if (data && data.version) {
            remoteVersion = data.version;
            if (data.downloadUrl) downloadUrl = data.downloadUrl;
            if (data.mirrorUrl) mirrorUrl = data.mirrorUrl;
            if (data.apkFileName) fileName = data.apkFileName;
          }
        } catch (e) {
          console.warn('Fallback 2 (Raw version.json) failed:', e);
        }
      }

      // 3. Probar vía jsDelivr CDN
      if (!remoteVersion) {
        try {
          const data = await this.fetchWithTimeout(
            `https://cdn.jsdelivr.net/gh/Alexorim/LastCodex@main/src/assets/version.json?t=${cacheBuster}`,
            3500
          );
          if (data && data.version) {
            remoteVersion = data.version;
            if (data.downloadUrl) downloadUrl = data.downloadUrl;
            if (data.mirrorUrl) mirrorUrl = data.mirrorUrl;
            if (data.apkFileName) fileName = data.apkFileName;
          }
        } catch (e) {
          console.warn('Fallback 3 (jsDelivr) failed:', e);
        }
      }

      // 4. Probar raw.githubusercontent.com package.json
      if (!remoteVersion) {
        try {
          const data = await this.fetchWithTimeout(
            `https://raw.githubusercontent.com/Alexorim/LastCodex/main/package.json?t=${cacheBuster}`,
            3500
          );
          if (data && data.version) {
            remoteVersion = data.version;
          }
        } catch (e) {
          console.warn('Fallback 4 (package.json) failed:', e);
        }
      }

      // IMPORTANTE: NO hacemos fallback al archivo local assets/version.json
      // porque hacía que una versión antigua en el móvil se leyera a sí misma y dijera que ya estaba al día.
      if (!remoteVersion) {
        throw new Error(
          this.currentLang === 'es'
            ? 'No se pudo conectar con el servidor para comprobar actualizaciones. Comprueba tu conexión a internet.'
            : 'Could not connect to server to check for updates. Please check your internet connection.'
        );
      }

      this.latestRemoteVersion = remoteVersion;
      this.apkDownloadUrl = downloadUrl;
      this.githubApkUrl = mirrorUrl;
      this.apkFileName = fileName;

      if (this.compareVersions(remoteVersion, this.versionNumber) > 0) {
        this.appUpdateStatus = 'has-update';
      } else {
        this.appUpdateStatus = 'up-to-date';
      }
    } catch (err: any) {
      if (!silent) {
        this.appUpdateStatus = 'error';
        this.appUpdateError = err?.message || (
          this.currentLang === 'es'
            ? 'Error de conexión al buscar actualizaciones.'
            : 'Connection error while checking for updates.'
        );
      }
    } finally {
      this.isCheckingAppUpdate = false;
      this.cdr.detectChanges();
    }
  }

  async openMap(): Promise<void> {
    const isEs = this.currentLang === 'es';
    const alert = await this.alertController.create({
      header: isEs ? 'Mapa de Aethric' : 'Aethric Map',
      subHeader: isEs ? 'Fase de prueba' : 'Testing phase',
      message: isEs
        ? 'El mapa interactivo está en fase de prueba y puede tener requerimientos adicionales de rendimiento.'
        : 'The interactive map is in testing phase and may have performance requirements.',
      backdropDismiss: true,
      buttons: [
        {
          text: isEs ? 'Cancelar' : 'Cancel',
          role: 'cancel'
        },
        {
          text: isEs ? 'Aceptar' : 'Accept',
          handler: () => {
            this.router.navigate(['/map']);
          }
        }
      ]
    });
    await alert.present();
  }

  openObsidianVault(): void {
    this.router.navigate(['/obsidian-vault']);
  }

  downloadApk(event?: Event, targetUrl?: string): void {
    if (event) {
      event.preventDefault();
    }

    const remoteUrl = targetUrl || this.apkDownloadUrl || `https://lastresources.vercel.app/assets/${this.apkFileName}`;

    const isCapacitor = typeof (window as any).Capacitor !== 'undefined' &&
      typeof (window as any).Capacitor.isNativePlatform === 'function' &&
      (window as any).Capacitor.isNativePlatform();

    if (isCapacitor) {
      // En Capacitor nativo (Android), navegar a la URL externa dispara shouldOverrideUrlLoading en Bridge,
      // el cual lanza un Intent ACTION_VIEW nativo abriendo el navegador del sistema / gestor de descargas.
      window.location.href = remoteUrl;
      return;
    }

    // En navegador web (PC / móvil):
    window.open(remoteUrl, '_blank');
  }
}

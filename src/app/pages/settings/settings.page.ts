import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
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
  downloadOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { SettingsService, Language, ThemeMode, AVAILABLE_LANGUAGES, LanguageOption } from '../../services/settings.service';
import { TimerService } from '../../services/timer.service';
import { CodexService, SyncProgress, UpdateCheckResult } from '../../services/codex.service';
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
  private router = inject(Router);

  private subs = new Subscription();

  currentLang: Language = 'es';
  currentTheme: ThemeMode = 'codex-dark';
  deviceTimezone = '';
  localResetTime = '';

  versionNumber = '1.4.3';
  appVersion = `v${this.versionNumber}`;
  apkFileName = 'lastcodex_stable.apk';
  apkDownloadUrl = `assets/${this.apkFileName}`;
  githubApkUrl = `https://github.com/Alexorim/LastCodex/raw/main/src/assets/lastcodex_stable.apk`;

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
      downloadOutline
    });
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

  async checkAppUpdates(): Promise<void> {
    this.isCheckingAppUpdate = true;
    this.appUpdateError = '';
    const cacheBuster = Date.now();
    try {
      let remoteVersion = '';
      let downloadUrl = this.githubApkUrl;

      // 1. Probar primero versión remota en raw github version.json
      try {
        const resp = await fetch(
          `https://raw.githubusercontent.com/Alexorim/LastCodex/main/src/assets/version.json?t=${cacheBuster}`,
          { cache: 'no-store' }
        );
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.version) {
            remoteVersion = data.version;
            if (data.downloadUrl) {
              downloadUrl = data.downloadUrl;
            }
          }
        }
      } catch {
        // Continuar al siguiente fallback
      }

      // 2. Probar package.json en raw github
      if (!remoteVersion) {
        try {
          const resp = await fetch(
            `https://raw.githubusercontent.com/Alexorim/LastCodex/main/package.json?t=${cacheBuster}`,
            { cache: 'no-store' }
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.version) {
              remoteVersion = data.version;
            }
          }
        } catch {
          // Continuar al siguiente fallback
        }
      }

      // 3. Fallback a assets/version.json local/bundled
      if (!remoteVersion) {
        try {
          const resp = await fetch(`assets/version.json?t=${cacheBuster}`);
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.version) {
              remoteVersion = data.version;
              if (data.downloadUrl) {
                downloadUrl = data.downloadUrl;
              }
            }
          }
        } catch {
          // Sin más fallbacks
        }
      }

      if (!remoteVersion) {
        throw new Error(
          this.currentLang === 'es'
            ? 'No se pudo verificar la versión en el servidor.'
            : 'Could not verify version on the server.'
        );
      }

      this.latestRemoteVersion = remoteVersion;
      this.apkDownloadUrl = downloadUrl;

      if (this.compareVersions(remoteVersion, this.versionNumber) > 0) {
        this.appUpdateStatus = 'has-update';
      } else {
        this.appUpdateStatus = 'up-to-date';
      }
    } catch (err: any) {
      this.appUpdateStatus = 'error';
      this.appUpdateError = err?.message || (
        this.currentLang === 'es'
          ? 'Error de conexión al buscar actualizaciones.'
          : 'Connection error while checking for updates.'
      );
    } finally {
      this.isCheckingAppUpdate = false;
    }
  }

  downloadApk(event?: Event): void {
    const isCapacitor = typeof (window as any).Capacitor !== 'undefined' &&
      typeof (window as any).Capacitor.isNativePlatform === 'function' &&
      (window as any).Capacitor.isNativePlatform();

    const directRemoteUrl = `https://github.com/Alexorim/LastCodex/raw/main/src/assets/${this.apkFileName}`;
    const directLocalUrl = `assets/${this.apkFileName}`;

    if (isCapacitor) {
      if (event) event.preventDefault();
      // On native Capacitor, open the direct link in the system browser so Android download manager handles the APK
      window.open(directRemoteUrl, '_system');
      return;
    }

    // On browser / web:
    // If event is missing, trigger via window.open
    if (!event) {
      window.open(directLocalUrl, '_blank');
    }
    // If event is present from <a>, allow browser's native download to proceed without preventDefault
  }
}

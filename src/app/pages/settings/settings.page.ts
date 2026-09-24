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
  libraryOutline
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

  versionNumber = '1.4.1';
  appVersion = `v${this.versionNumber}`;
  apkFileName = `lastcodex_${this.versionNumber}.apk`;
  apkDownloadUrl = `assets/${this.apkFileName}`;

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
      libraryOutline
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

  downloadApk(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const link = document.createElement('a');
    link.href = `assets/${this.apkFileName}`;
    link.download = this.apkFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import {
  home,
  homeOutline,
  calendarOutline,
  refreshOutline,
  shieldOutline,
  timeOutline,
  alertCircleOutline,
  downloadOutline,
  shareSocialOutline,
  sparkles,
  sparklesOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  logoWhatsapp,
  imageOutline,
  informationCircleOutline,
  openOutline,
  cloudDownloadOutline,
  closeOutline,
  bookOutline,
  cloudOfflineOutline,
  skullOutline,
  hammerOutline,
  gridOutline,
  listOutline,
  calculatorOutline,
  alarmOutline,
  alarm
} from 'ionicons/icons';
import { AlertController, ToastController } from '@ionic/angular';
import { NotificationsService } from '../../services/notifications.service';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toPng } from 'html-to-image';
import { MaterialsService } from '../../services/materials.service';
import { TimerService } from '../../services/timer.service';
import { SettingsService, Language } from '../../services/settings.service';
import { CodexService, CodexEntry } from '../../services/codex.service';
import { BackButtonService } from '../../services/back-button.service';
import { DayForecast } from '../../models/material.model';
import { getMaterialIcon } from '../../utils/material-icon.util';
import { getGuildIcon } from '../../utils/guild-icon.util';
import { translateMaterialName } from '../../utils/material-translation.util';
import { generateForecastImage } from '../../utils/forecast-canvas.util';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit, OnDestroy {
  private materialsService = inject(MaterialsService);
  private timerService = inject(TimerService);
  private settingsService = inject(SettingsService);
  private codexService = inject(CodexService);
  private backButtonService = inject(BackButtonService);
  private notificationsService = inject(NotificationsService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  @ViewChild('exportTargetSingle') exportTargetSingle!: ElementRef<HTMLElement>;
  @ViewChild('exportTargetBoth') exportTargetBoth!: ElementRef<HTMLElement>;

  private todaySub: Subscription | null = null;
  private tomorrowSub: Subscription | null = null;
  private langSub: Subscription | null = null;
  private unregisterExportOverlay: (() => void) | null = null;
  private unregisterMaterialOverlay: (() => void) | null = null;

  todayForecast: DayForecast | null = null;
  tomorrowForecast: DayForecast | null = null;
  countdownStr$: Observable<string> = this.timerService.countdownStr$;
  localResetTime$: Observable<string> = this.timerService.localResetTime$;
  currentLang: Language = 'es';
  isLoading = true;

  // Export Modal States
  showExportModal = false;
  showUpdateBanner = false;
  exportMode: 'single' | 'both' = 'both';
  isExporting = false;
  exportFeedback: string | null = null;

  // Material Detail Modal State
  selectedMaterial: CodexEntry | null = null;

  constructor() {
    addIcons({
      home,
      homeOutline,
      calendarOutline,
      refreshOutline,
      shieldOutline,
      timeOutline,
      alertCircleOutline,
      downloadOutline,
      shareSocialOutline,
      sparkles,
      sparklesOutline,
      closeCircleOutline,
      checkmarkCircleOutline,
      logoWhatsapp,
      imageOutline,
      informationCircleOutline,
      openOutline,
      cloudDownloadOutline,
      closeOutline,
      bookOutline,
      cloudOfflineOutline,
      skullOutline,
      hammerOutline,
      gridOutline,
      listOutline,
      calculatorOutline,
      alarmOutline,
      alarm
    });
  }

  get isStale(): boolean {
    return this.materialsService.isStale;
  }

  get lastUpdated(): Date | null {
    return this.materialsService.lastUpdated;
  }

  materialsViewMode: 'list' | 'grid' = 'list';

  ngOnInit() {
    const savedMode = localStorage.getItem('materials_view_mode') as 'list' | 'grid';
    if (savedMode === 'grid' || savedMode === 'list') {
      this.materialsViewMode = savedMode;
    }

    // Solo mostrar banner si expresamente vino redirigido de un APK antiguo con el parámetro ?outdated=true
    const urlParams = new URLSearchParams(window.location.search);
    const isRedirectedOutdated = urlParams.get('outdated') === 'true';
    const isDismissed = sessionStorage.getItem('orna_update_banner_dismissed') === 'true';
    if (isRedirectedOutdated && !isDismissed) {
      this.showUpdateBanner = true;
    }

    this.langSub = this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.todaySub = this.materialsService.today$.subscribe(today => {
      if (today && today.guilds.length > 0) {
        this.todayForecast = today;
        this.isLoading = false;
      }
    });

    this.tomorrowSub = this.materialsService.tomorrow$.subscribe(tomorrow => {
      if (tomorrow && tomorrow.guilds.length > 0) {
        this.tomorrowForecast = tomorrow;
        this.isLoading = false;
      }
    });

    // Safety fallback: ensure skeleton loading stops after 2.5s if offline
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
      }
    }, 2500);
  }

  ngOnDestroy() {
    this.todaySub?.unsubscribe();
    this.tomorrowSub?.unsubscribe();
    this.langSub?.unsubscribe();
    if (this.unregisterExportOverlay) this.unregisterExportOverlay();
    if (this.unregisterMaterialOverlay) this.unregisterMaterialOverlay();
  }

  goToEvents(): void {
    this.router.navigate(['/events']);
  }

  goToProofs(): void {
    this.router.navigate(['/proofs']);
  }

  goToProofsForMaterial(mat: CodexEntry | null): void {
    const cleanName = mat ? (mat.nameEn || mat.name || '') : '';
    this.closeMaterialModal();
    this.router.navigate(['/proofs'], {
      queryParams: {
        material: cleanName
      }
    });
  }

  goToCodex(): void {
    this.router.navigate(['/codex']);
  }

  exploreInCodex(mat: CodexEntry | null): void {
    const cleanName = mat ? (mat.nameEn || mat.name || '') : '';
    const cat = mat?.category || 'items';
    this.closeMaterialModal();
    this.router.navigate(['/codex'], {
      queryParams: {
        item: cleanName,
        cat: cat
      }
    });
  }

  toggleMaterialsView(): void {
    this.materialsViewMode = this.materialsViewMode === 'list' ? 'grid' : 'list';
    localStorage.setItem('materials_view_mode', this.materialsViewMode);
  }

  ionViewWillLeave(): void {
    this.closeMaterialModal();
    this.closeExportModal();
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
      document.body.classList.remove('footer-visible');
    }
  }

  // Export Modal Methods
  openExportModal(): void {
    if (!this.tomorrowForecast) {
      this.exportMode = 'single';
    }
    this.showExportModal = true;
    this.exportFeedback = null;
    if (this.unregisterExportOverlay) this.unregisterExportOverlay();
    this.unregisterExportOverlay = this.backButtonService.registerOverlay(() => {
      if (this.showExportModal) {
        this.closeExportModal();
        return true;
      }
      return false;
    });
  }

  closeExportModal(): void {
    this.showExportModal = false;
    this.exportFeedback = null;
    if (this.unregisterExportOverlay) {
      this.unregisterExportOverlay();
      this.unregisterExportOverlay = null;
    }
  }

  // Material Detail Modal Methods
  openMaterialModal(rawName: string): void {
    if (!rawName) return;
    const clean = rawName.replace(/\(.*?\)/g, '').replace(/:.*$/g, '').trim();
    const translatedEs = translateMaterialName(clean, 'es');
    const translatedEn = translateMaterialName(clean, 'en');

    const cleanLower = clean.toLowerCase();
    const esLower = translatedEs.toLowerCase();
    const enLower = translatedEn.toLowerCase();

    const entries = this.codexService.currentEntries;
    let found = entries.find(e =>
      e.name.toLowerCase() === esLower ||
      e.name.toLowerCase() === enLower ||
      e.name.toLowerCase() === cleanLower ||
      (e.nameEs && e.nameEs.toLowerCase() === esLower) ||
      (e.nameEn && e.nameEn.toLowerCase() === enLower)
    );

    if (!found) {
      found = entries.find(e =>
        e.category === 'items' &&
        (e.name.toLowerCase().includes(esLower) || (e.nameEn && e.nameEn.toLowerCase().includes(enLower)))
      );
    }

    if (found) {
      this.selectedMaterial = {
        ...found,
        icon: found.icon || getMaterialIcon(clean)
      };
    } else {
      this.selectedMaterial = {
        id: `mat-${clean}`,
        name: this.currentLang === 'es' ? translatedEs : translatedEn,
        nameEs: translatedEs,
        nameEn: translatedEn,
        category: 'items',
        subcategory: 'material',
        tier: 1,
        icon: getMaterialIcon(clean),
        type: 'Items',
        descriptionEs: 'Material de artesanía y mejora utilizado en herrerías y gremios.',
        descriptionEn: 'Crafting and upgrade material used in blacksmiths and guilds.',
        droppedBy: []
      };
    }

    if (this.unregisterMaterialOverlay) this.unregisterMaterialOverlay();
    this.unregisterMaterialOverlay = this.backButtonService.registerOverlay(() => {
      if (this.selectedMaterial) {
        this.closeMaterialModal();
        return true;
      }
      return false;
    });
  }

  closeMaterialModal(): void {
    this.selectedMaterial = null;
    if (this.unregisterMaterialOverlay) {
      this.unregisterMaterialOverlay();
      this.unregisterMaterialOverlay = null;
    }
  }

  isMaterialReminderActive(mat: CodexEntry | null): boolean {
    if (!mat) return false;
    const rawName = mat.nameEn || mat.name || '';
    return this.notificationsService.isMaterialReminderActive(rawName);
  }

  async openMaterialReminderDialog(mat: CodexEntry | null): Promise<void> {
    if (!mat) return;
    const isEs = this.currentLang === 'es';
    const rawName = mat.nameEn || mat.name || '';
    const displayName = isEs ? (mat.nameEs || mat.name || rawName) : (mat.nameEn || rawName);
    const isAlreadySet = this.notificationsService.isMaterialReminderActive(rawName);

    if (isAlreadySet) {
      const activeRem = this.notificationsService.getMaterialReminder(rawName);
      const guildText = activeRem?.guild ? ` (${activeRem.guild})` : '';
      const alert = await this.alertCtrl.create({
        header: isEs ? 'Recordatorio Activo' : 'Active Reminder',
        subHeader: displayName,
        message: isEs
          ? `Ya tienes un recordatorio programado para ${displayName}${guildText}. ¿Qué deseas hacer?`
          : `You already have an active reminder for ${displayName}${guildText}. What would you like to do?`,
        buttons: [
          {
            text: isEs ? 'Cerrar' : 'Close',
            role: 'cancel'
          },
          {
            text: isEs ? 'Eliminar Alerta' : 'Delete Alert',
            role: 'destructive',
            handler: async () => {
              await this.notificationsService.cancelMaterialReminder(rawName);
              const toast = await this.toastCtrl.create({
                message: isEs ? `Recordatorio cancelado para ${displayName}` : `Reminder canceled for ${displayName}`,
                duration: 2000,
                position: 'bottom',
                color: 'medium'
              });
              await toast.present();
            }
          },
          {
            text: isEs ? 'Cambiar' : 'Change',
            handler: () => {
              this.showMaterialReminderTypeDialog(rawName, displayName);
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    await this.showMaterialReminderTypeDialog(rawName, displayName);
  }

  private async showMaterialReminderTypeDialog(rawName: string, displayName: string): Promise<void> {
    const isEs = this.currentLang === 'es';
    const alert = await this.alertCtrl.create({
      header: isEs ? 'Tipo de Recordatorio' : 'Reminder Type',
      subHeader: displayName,
      message: isEs
        ? 'Elige cómo quieres que la app te avise sobre este material:'
        : 'Choose how you want to be alerted for this material:',
      inputs: [
        {
          type: 'radio',
          label: isEs ? 'Recordatorio normal (Gremio más cercano)' : 'Normal (Nearest guild)',
          value: 'normal',
          checked: true
        },
        {
          type: 'radio',
          label: isEs ? 'Recordatorio específico (Elegir un gremio)' : 'Specific (Pick a guild)',
          value: 'specific'
        }
      ],
      buttons: [
        {
          text: isEs ? 'Cancelar' : 'Cancel',
          role: 'cancel'
        },
        {
          text: isEs ? 'Continuar' : 'Next',
          handler: async (selectedType: string) => {
            if (selectedType === 'normal') {
              await this.setupNormalMaterialReminder(rawName, displayName);
            } else if (selectedType === 'specific') {
              await this.setupSpecificMaterialReminder(rawName, displayName);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async setupNormalMaterialReminder(rawName: string, displayName: string): Promise<void> {
    const isEs = this.currentLang === 'es';
    const searchRes = this.materialsService.searchMaterial(rawName);
    const firstApp = searchRes?.guildAppearances && searchRes.guildAppearances.length > 0
      ? searchRes.guildAppearances[0]
      : null;

    const daysUntil = firstApp && typeof firstApp.daysUntil === 'number' ? firstApp.daysUntil : 1;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Math.max(0, daysUntil));
    targetDate.setHours(0, 5, 0, 0);

    const guildName = firstApp?.guildName || 'el gremio más cercano';
    const success = await this.notificationsService.scheduleMaterialReminder(
      rawName,
      targetDate,
      displayName,
      guildName,
      'normal'
    );

    if (success) {
      const toast = await this.toastCtrl.create({
        message: isEs
          ? `🔔 Recordatorio normal programado: Te avisará cuando ${displayName} esté en ${guildName}.`
          : `🔔 Normal reminder set: Will alert when ${displayName} is in ${guildName}.`,
        duration: 3500,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    }
  }

  private async setupSpecificMaterialReminder(rawName: string, displayName: string): Promise<void> {
    const isEs = this.currentLang === 'es';
    const searchRes = this.materialsService.searchMaterial(rawName);

    const inputs: any[] = [];
    if (searchRes && searchRes.guildAppearances.length > 0) {
      searchRes.guildAppearances.forEach((app, idx) => {
        const timeTxt = app.daysUntil !== null
          ? (app.daysUntil === 0 ? (isEs ? '¡Hoy!' : 'Today!') : (isEs ? `en ${app.daysUntil} días` : `in ${app.daysUntil} days`))
          : app.nextDate;
        inputs.push({
          type: 'radio',
          label: `${app.guildName} (${timeTxt})`,
          value: app.guildName,
          checked: idx === 0
        });
      });
    } else {
      const defaultGuilds = ['Anguish', 'Agony', 'Despair', 'Melancholy', 'Torment', 'Coral', 'Deepshards', 'Remembrance', 'Sparring', 'Trials', 'Towers'];
      defaultGuilds.forEach((g, idx) => {
        inputs.push({
          type: 'radio',
          label: g,
          value: g,
          checked: idx === 0
        });
      });
    }

    const alert = await this.alertCtrl.create({
      header: isEs ? 'Recordatorio Específico' : 'Specific Reminder',
      subHeader: displayName,
      message: isEs
        ? '¿En qué gremio deseas que esté el material para recibir el aviso?'
        : 'In which guild would you like this material to appear for the alert?',
      inputs,
      buttons: [
        {
          text: isEs ? 'Cancelar' : 'Cancel',
          role: 'cancel'
        },
        {
          text: isEs ? 'Guardar Recordatorio' : 'Save Reminder',
          handler: async (selectedGuild: string) => {
            if (!selectedGuild) return;
            const app = searchRes?.guildAppearances.find(a => a.guildName.toLowerCase() === selectedGuild.toLowerCase());
            const daysUntil = app && typeof app.daysUntil === 'number' ? app.daysUntil : 1;

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + Math.max(0, daysUntil));
            targetDate.setHours(0, 5, 0, 0);

            const success = await this.notificationsService.scheduleMaterialReminder(
              rawName,
              targetDate,
              displayName,
              selectedGuild,
              'specific'
            );

            if (success) {
              const toast = await this.toastCtrl.create({
                message: isEs
                  ? `🔔 Alerta específica guardada: Te avisaremos cuando ${displayName} llegue a ${selectedGuild}.`
                  : `🔔 Specific alert saved: You will be alerted when ${displayName} hits ${selectedGuild}.`,
                duration: 3500,
                position: 'bottom',
                color: 'success'
              });
              await toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async exportImage(action: 'download' | 'share'): Promise<void> {
    if (this.isExporting) return;
    this.isExporting = true;
    this.exportFeedback = this.currentLang === 'es' ? 'Generando imagen...' : 'Generating image...';

    try {
      await new Promise(r => setTimeout(r, 100));

      if (!this.todayForecast) {
        throw new Error('No forecast data to export');
      }

      // Generate PNG using the native 2D Canvas engine (100% offline-safe, no SVG foreignObject taint)
      let dataUrl: string;
      try {
        dataUrl = await generateForecastImage({
          today: this.todayForecast,
          tomorrow: this.tomorrowForecast,
          mode: this.exportMode,
          lang: this.currentLang
        });
      } catch (canvasErr) {
        console.warn('Canvas generator fallback to toPng:', canvasErr);
        let targetEl = this.exportMode === 'single'
          ? this.exportTargetSingle?.nativeElement
          : this.exportTargetBoth?.nativeElement;
        if (!targetEl) targetEl = this.exportTargetSingle?.nativeElement;
        if (!targetEl) throw new Error('Element to capture not found');

        dataUrl = await toPng(targetEl, {
          quality: 0.96,
          pixelRatio: 2,
          backgroundColor: '#161514',
          cacheBust: false,
          skipFonts: true,
          fontEmbedCSS: '',
          imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAALAAAAAABAAEAAAICRAEAOw==',
          onImageErrorHandler: () => {}
        });
      }

      const fileName = `LastResources-Stock-${this.exportMode === 'single' ? 'Hoy' : 'Hoy-y-Manana'}-${new Date().toISOString().slice(0, 10)}.png`;

      // Native Android capacitor export handling
      if (Capacitor.isNativePlatform()) {
        try {
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

          if (action === 'share') {
            const saved = await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Cache
            });

            await Share.share({
              title: 'LastResources',
              files: [saved.uri],
              dialogTitle: this.currentLang === 'es' ? 'Compartir Imagen' : 'Share Image'
            });
            this.exportFeedback = this.currentLang === 'es' ? '¡Compartido con éxito!' : 'Shared successfully!';
            setTimeout(() => this.closeExportModal(), 1800);
            return;
          } else {
            let savedFile;
            try {
              savedFile = await Filesystem.writeFile({
                path: `Download/${fileName}`,
                data: base64Data,
                directory: Directory.ExternalStorage
              });
            } catch {
              savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents
              });
            }
            this.exportFeedback = this.currentLang === 'es' ? '¡Imagen guardada en el dispositivo!' : 'Image saved to device!';
            setTimeout(() => this.closeExportModal(), 2000);
            return;
          }
        } catch (nativeErr) {
          console.warn('Native filesystem/share error, falling back to web:', nativeErr);
        }
      }

      // Web / fallback handling
      if (action === 'download') {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        this.exportFeedback = this.currentLang === 'es' ? '¡Imagen descargada con éxito!' : 'Image downloaded successfully!';
        setTimeout(() => this.closeExportModal(), 1800);
      } else {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'LastResources — Orna Guild Forecast',
            text: this.currentLang === 'es' ? 'Stock de materiales por gremio en Orna RPG' : 'Orna RPG Guild Material Stock'
          });
          this.exportFeedback = this.currentLang === 'es' ? '¡Compartido con éxito!' : 'Shared successfully!';
          setTimeout(() => this.closeExportModal(), 1800);
        } else {
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          link.click();
          this.exportFeedback = this.currentLang === 'es'
            ? 'Imagen descargada. Ya puedes adjuntarla en WhatsApp.'
            : 'Image downloaded. You can now attach it in WhatsApp.';
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Consulta el stock de materiales de gremios de Orna en LastResources!')}`, '_blank');
          setTimeout(() => this.closeExportModal(), 2800);
        }
      }
    } catch (err: any) {
      console.error('Export error:', err);
      const errMsg = err?.message || '';
      this.exportFeedback = this.currentLang === 'es'
        ? `Error al generar la imagen (${errMsg || 'error inesperado'})`
        : `Failed to export image (${errMsg || 'unexpected error'})`;
    } finally {
      this.isExporting = false;
    }
  }

  getMatIcon(name: string): string {
    return getMaterialIcon(name);
  }

  getModalMatIcon(mat: CodexEntry | null): string {
    if (!mat) return '';
    if (mat.icon) return mat.icon;
    if (mat.nameEn) {
      const icon = getMaterialIcon(mat.nameEn);
      if (icon) return icon;
    }
    return getMaterialIcon(mat.name);
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

  doRefresh(event: any) {
    this.materialsService.loadData();
    setTimeout(() => {
      if (event && event.target && event.target.complete) {
        event.target.complete();
      }
    }, 2000);
  }

  dismissUpdateBanner(): void {
    this.showUpdateBanner = false;
    sessionStorage.setItem('orna_update_banner_dismissed', 'true');
  }
}

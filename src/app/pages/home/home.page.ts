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
  cloudOfflineOutline
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { toPng } from 'html-to-image';
import { MaterialsService } from '../../services/materials.service';
import { TimerService } from '../../services/timer.service';
import { SettingsService, Language } from '../../services/settings.service';
import { DayForecast } from '../../models/material.model';
import { getMaterialIcon } from '../../utils/material-icon.util';
import { getGuildIcon } from '../../utils/guild-icon.util';
import { translateMaterialName } from '../../utils/material-translation.util';
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
  private router = inject(Router);

  @ViewChild('exportTargetSingle') exportTargetSingle!: ElementRef<HTMLElement>;
  @ViewChild('exportTargetBoth') exportTargetBoth!: ElementRef<HTMLElement>;

  private todaySub: Subscription | null = null;
  private tomorrowSub: Subscription | null = null;
  private langSub: Subscription | null = null;

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
      cloudOfflineOutline
    });
  }

  get isStale(): boolean {
    return this.materialsService.isStale;
  }

  get lastUpdated(): Date | null {
    return this.materialsService.lastUpdated;
  }

  ngOnInit() {
    const isNative = Capacitor.isNativePlatform();
    const isDismissed = sessionStorage.getItem('orna_update_banner_dismissed') === 'true';
    if (!isNative && !isDismissed) {
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
  }

  goToEvents(): void {
    this.router.navigate(['/events']);
  }

  goToCodex(): void {
    this.router.navigate(['/codex']);
  }

  // Export Modal Methods
  openExportModal(): void {
    this.showExportModal = true;
    this.exportFeedback = null;
  }

  closeExportModal(): void {
    this.showExportModal = false;
    this.exportFeedback = null;
  }

  async exportImage(action: 'download' | 'share'): Promise<void> {
    if (this.isExporting) return;
    this.isExporting = true;
    this.exportFeedback = this.currentLang === 'es' ? 'Generando imagen...' : 'Generating image...';

    try {
      // Small pause to let DOM render
      await new Promise(r => setTimeout(r, 200));

      const targetEl = this.exportMode === 'single'
        ? this.exportTargetSingle?.nativeElement
        : this.exportTargetBoth?.nativeElement;

      if (!targetEl) {
        throw new Error('Element to capture not found');
      }

      const dataUrl = await toPng(targetEl, {
        quality: 0.96,
        pixelRatio: 2.2,
        backgroundColor: '#161514',
        cacheBust: true
      });

      const fileName = `LastResources-Stock-${this.exportMode === 'single' ? 'Hoy' : 'Hoy-y-Manana'}-${new Date().toISOString().slice(0, 10)}.png`;

      if (action === 'download') {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        this.exportFeedback = this.currentLang === 'es' ? '¡Imagen descargada con éxito!' : 'Image downloaded successfully!';
        setTimeout(() => this.closeExportModal(), 1800);
      } else {
        // Share via Web Share API or WhatsApp
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
          // Fallback: download and prompt WhatsApp
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
    } catch (err) {
      console.error('Export error:', err);
      this.exportFeedback = this.currentLang === 'es' ? 'Error al generar la imagen' : 'Failed to export image';
    } finally {
      this.isExporting = false;
    }
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
    event.target.style.display = 'none';
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

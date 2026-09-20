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
  openOutline
} from 'ionicons/icons';
import { toPng } from 'html-to-image';
import { MaterialsService } from '../../services/materials.service';
import { TimerService } from '../../services/timer.service';
import { SettingsService, Language } from '../../services/settings.service';
import { DayForecast } from '../../models/material.model';
import { getMaterialIcon } from '../../utils/material-icon.util';
import { getGuildIcon } from '../../utils/guild-icon.util';
import { Observable, Subscription } from 'rxjs';

export interface OrnaCalendarEvent {
  id: string;
  name: string;
  startDay: number;
  endDay: number;
  icon: string;
  color: string;
  tag: string;
  descriptionEs: string;
  descriptionEn: string;
  rewardsEs: string;
  rewardsEn: string;
}

export interface CalendarCell {
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: OrnaCalendarEvent[];
}

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
  exportMode: 'single' | 'both' = 'both';
  isExporting = false;
  exportFeedback: string | null = null;

  // Events Calendar Modal States
  showEventsModal = false;
  selectedEventDetail: OrnaCalendarEvent | null = null;
  calendarMonthName = 'Septiembre 2026';
  calendarWeeks: CalendarCell[][] = [];

  // Orna Official Events List
  officialEvents: OrnaCalendarEvent[] = [
    {
      id: 'surrounded-memories',
      name: 'Surrounded by Memories',
      startDay: 1,
      endDay: 5,
      icon: 'https://playorna.com/static/img/icons/amity.png',
      color: '#00bcd4',
      tag: 'Amities',
      descriptionEs: 'Aparición aumentada de recuerdos ancestrales y amities míticas en el mundo.',
      descriptionEn: 'Increased spawn rate of memory hunts and mythic amities across the realm.',
      rewardsEs: 'Amities exclusivas, Fragmentos de memoria',
      rewardsEn: 'Exclusive amities, Memory shards'
    },
    {
      id: 'riftfall',
      name: 'Riftfall',
      startDay: 2,
      endDay: 30,
      icon: 'https://playorna.com/static/img/icons/riftfall3.png',
      color: '#ab47bc',
      tag: 'Event Raid & Bosses',
      descriptionEs: 'Fisuras dimensionales abriéndose en todo el reino. Invade los consejos oscuros y derrota a los jueces.',
      descriptionEn: 'Dimensional rifts opening across the realm. Invade dark counsels and vanquish judges.',
      rewardsEs: 'Shade of Rhada, Shade of Achlys, Equipo de invocador élite',
      rewardsEn: 'Shade of Rhada, Shade of Achlys, Elite summoner gear'
    },
    {
      id: 'lucky-event',
      name: 'Lucky Event',
      startDay: 4,
      endDay: 8,
      icon: 'https://playorna.com/static/img/icons/rewards.png',
      color: '#ffb300',
      tag: 'Bonus Boost',
      descriptionEs: 'Bonificación extraordinaria de suerte en botines de mazmorras y enemigos en campo.',
      descriptionEn: 'Extraordinary luck multiplier applied to dungeon loot and world foes.',
      rewardsEs: '+25% Tasa de aparición de objetos raros',
      rewardsEn: '+25% Rare item drop rate'
    },
    {
      id: 'spelunking',
      name: 'Spelunking Event',
      startDay: 11,
      endDay: 14,
      icon: 'https://playorna.com/static/img/bosses/dweller.png',
      color: '#8d6e63',
      tag: 'Dungeons',
      descriptionEs: 'Expediciones profundas en cavernas con monstruos de las profundidades y cofres secretos.',
      descriptionEn: 'Deep cavern expeditions featuring underworld dwellers and treasure troves.',
      rewardsEs: 'Subterranean Dwellers, Minerales raros',
      rewardsEn: 'Subterranean Dwellers, Rare crafting minerals'
    },
    {
      id: 'plight-apollyon',
      name: 'The Plight of Apollyon',
      startDay: 25,
      endDay: 30,
      icon: 'https://playorna.com/static/img/icons/apollyon.png',
      color: '#e53935',
      tag: 'Kingdom Raid',
      descriptionEs: 'El destructor celestial desafía a los reinos. Consigue las armaduras más resistentes de Orna.',
      descriptionEn: 'The celestial destroyer challenges kingdom forces. Attain high-ward armor sets.',
      rewardsEs: 'Apollyon Raid Gear, Ward Armor',
      rewardsEn: 'Apollyon Raid Gear, Ward Armor'
    },
    {
      id: 'lunar-festival',
      name: 'Lunar Festival',
      startDay: 25,
      endDay: 30,
      icon: 'https://playorna.com/static/img/icons/moon.png',
      color: '#5c6bc0',
      tag: 'Moon Festival',
      descriptionEs: 'Celebración bajo las estrellas. Criaturas nocturnas y seguidores lunares exclusivos.',
      descriptionEn: 'Starlight celebration under moonlight. Nightstalkers and lunar followers available.',
      rewardsEs: 'Lunar Pets, Hechizos celestiales',
      rewardsEn: 'Lunar Pets, Celestial Spells'
    },
    {
      id: 'exp-event',
      name: 'EXP Event',
      startDay: 25,
      endDay: 28,
      icon: 'https://playorna.com/static/img/icons/exp.png',
      color: '#43a047',
      tag: 'Double XP',
      descriptionEs: 'Duplica toda la experiencia ganada derrotando monstruos, jefes y jefes de asalto.',
      descriptionEn: 'Double all experience earned by slaying monsters, bosses, and raid beasts.',
      rewardsEs: '+100% EXP global',
      rewardsEn: '+100% Global EXP'
    }
  ];

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
      openOutline
    });
  }

  get isStale(): boolean {
    return this.materialsService.isStale;
  }

  get lastUpdated(): Date | null {
    return this.materialsService.lastUpdated;
  }

  ngOnInit() {
    this.langSub = this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
      this.updateCalendarMonthName();
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

    this.buildCalendarGrid();
  }

  ngOnDestroy() {
    this.todaySub?.unsubscribe();
    this.tomorrowSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  private updateCalendarMonthName(): void {
    const now = new Date();
    const month = now.toLocaleString(this.currentLang === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
    this.calendarMonthName = month.charAt(0).toUpperCase() + month.slice(1);
  }

  buildCalendarGrid(): void {
    const now = new Date();
    const currentDay = now.getDate();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const activeEvents = this.officialEvents.filter(ev => day >= ev.startDay && day <= ev.endDay);
      cells.push({
        dayNumber: day,
        isCurrentMonth: true,
        isToday: day === currentDay,
        events: activeEvents
      });
    }

    // Next month padding to fill weeks (multiples of 7)
    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({
        dayNumber: nextDay++,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    // Split into weeks of 7 days
    this.calendarWeeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      this.calendarWeeks.push(cells.slice(i, i + 7));
    }
  }

  isEventLive(ev: OrnaCalendarEvent): boolean {
    const today = new Date().getDate();
    return today >= ev.startDay && today <= ev.endDay;
  }

  openEventsModal(): void {
    this.showEventsModal = true;
  }

  closeEventsModal(): void {
    this.showEventsModal = false;
    this.selectedEventDetail = null;
  }

  viewEventDetail(ev: OrnaCalendarEvent): void {
    this.selectedEventDetail = ev;
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
}

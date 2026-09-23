import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import {
  sparkles,
  sparklesOutline,
  calendarOutline,
  timeOutline,
  openOutline,
  closeCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  informationCircleOutline,
  trophyOutline,
  arrowBackOutline,
  homeOutline
} from 'ionicons/icons';
import { SettingsService, Language } from '../../services/settings.service';
import { BackButtonService } from '../../services/back-button.service';
import { Subscription } from 'rxjs';
import { OrnaCalendarEvent, CalendarCell } from '../../models/event.model';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EventsPage implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private backButtonService = inject(BackButtonService);
  private router = inject(Router);

  private langSub: Subscription | null = null;
  private unregisterBackOverlay: (() => void) | null = null;
  currentLang: Language = 'es';

  calendarMonthName = '';
  calendarWeeks: CalendarCell[][] = [];
  selectedEventDetail: OrnaCalendarEvent | null = null;
  selectedDayCell: CalendarCell | null = null;

  // Orna Official Events Data
  officialEvents: OrnaCalendarEvent[] = [
    {
      id: 'surrounded-memories',
      name: 'Surrounded by Memories',
      startDay: 1,
      endDay: 5,
      icon: 'https://playorna.com/static/img/icons/amity.png',
      color: '#00bcd4',
      tag: 'Amities',
      descriptionEs: 'Aparición aumentada de recuerdos ancestrales y amities míticas en el mundo abierto.',
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
      sparkles,
      sparklesOutline,
      calendarOutline,
      timeOutline,
      openOutline,
      closeCircleOutline,
      chevronBackOutline,
      chevronForwardOutline,
      informationCircleOutline,
      trophyOutline,
      arrowBackOutline,
      homeOutline
    });
  }

  ngOnInit() {
    this.langSub = this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
      this.updateCalendarMonthName();
    });
    this.updateCalendarMonthName();
    this.buildCalendarGrid();

    // Select the first active event if any
    const live = this.officialEvents.find(e => this.isEventLive(e));
    if (live) {
      this.selectedEventDetail = live;
    }
  }

  ngOnDestroy() {
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

  onSelectDay(cell: CalendarCell): void {
    if (!cell.isCurrentMonth) return;
    this.selectedDayCell = cell;
    if (cell.events.length > 0) {
      this.viewEventDetail(cell.events[0]);
    }
  }

  viewEventDetail(ev: OrnaCalendarEvent, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedEventDetail = ev;
    if (this.unregisterBackOverlay) this.unregisterBackOverlay();
    this.unregisterBackOverlay = this.backButtonService.registerOverlay(() => {
      if (this.selectedEventDetail) {
        this.closeEventDetail();
        return true;
      }
      return false;
    });
  }

  closeEventDetail(): void {
    this.selectedEventDetail = null;
    if (this.unregisterBackOverlay) {
      this.unregisterBackOverlay();
      this.unregisterBackOverlay = null;
    }
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}

import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
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
  sunnyOutline
} from 'ionicons/icons';
import { TowersService, TowerInfo, TowerKind, CheckpointProjection, NextGrowthTimer, TOWERS_META } from '../../services/towers.service';
import { SettingsService, Language } from '../../services/settings.service';
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
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentLang: Language = 'es';
  selectedTab: 'current' | 'peaks' | 'schedule' = 'current';
  selectedTowerFilter: 'all' | TowerKind = 'all';

  towers: TowerInfo[] = [];
  nextTimer: NextGrowthTimer | null = null;
  projections: CheckpointProjection[] = [];
  selectedTowerDetail: TowerInfo | null = null;
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
      sunnyOutline
    });
  }

  ngOnInit() {
    this.subs.add(
      this.settingsService.lang$.subscribe((lang) => {
        this.currentLang = lang;
        this.refreshData();
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

  selectTab(tab: 'current' | 'peaks' | 'schedule') {
    this.selectedTab = tab;
  }

  openTowerDetail(tower: TowerInfo) {
    this.selectedTowerDetail = tower;
    this.isDetailModalOpen = true;
  }

  closeTowerDetail() {
    this.isDetailModalOpen = false;
    this.selectedTowerDetail = null;
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
    this.closeTowerDetail();
    this.router.navigate(['/codex'], { queryParams: { search: `Titan ${TOWERS_META[kind].name}` } });
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
}

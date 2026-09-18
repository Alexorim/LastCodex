import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import { home, homeOutline, calendarOutline, refreshOutline, shieldOutline, timeOutline } from 'ionicons/icons';
import { MaterialsService } from '../../services/materials.service';
import { TimerService } from '../../services/timer.service';
import { DayForecast } from '../../models/material.model';
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
  private todaySub: Subscription | null = null;
  private tomorrowSub: Subscription | null = null;

  todayForecast: DayForecast | null = null;
  tomorrowForecast: DayForecast | null = null;
  countdownStr$: Observable<string> = this.timerService.countdownStr$;
  isLoading = true;

  constructor() {
    addIcons({ home, homeOutline, calendarOutline, refreshOutline, shieldOutline, timeOutline });
  }

  get isStale(): boolean {
    return this.materialsService.isStale;
  }

  get lastUpdated(): Date | null {
    return this.materialsService.lastUpdated;
  }

  ngOnInit() {
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
  }

  ngOnDestroy() {
    this.todaySub?.unsubscribe();
    this.tomorrowSub?.unsubscribe();
  }

  getGuildColor(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('anguish')) return '#ff5252';
    if (lower.includes('agony')) return '#ff7043';
    if (lower.includes('despair')) return '#ab47bc';
    if (lower.includes('melancholy')) return '#5c6bc0';
    if (lower.includes('torment')) return '#26a69a';
    if (lower.includes('coral')) return '#ec407a';
    if (lower.includes('deepshards')) return '#42a5f5';
    if (lower.includes('remembrance')) return '#26c6da';
    if (lower.includes('sparring')) return '#66bb6a';
    if (lower.includes('trials')) return '#ffa726';
    if (lower.includes('towers')) return '#8d6e63';
    return '#78909c';
  }

  doRefresh(event: any) {
    this.materialsService.loadData();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
}

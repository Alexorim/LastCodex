import { Component, OnInit, inject } from '@angular/core';
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
  refreshOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { SettingsService, Language, ThemeMode } from '../../services/settings.service';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {
  private settingsService = inject(SettingsService);
  private timerService = inject(TimerService);
  private router = inject(Router);

  currentLang: Language = 'es';
  currentTheme: ThemeMode = 'codex-dark';
  deviceTimezone = '';
  localResetTime = '';

  constructor() {
    addIcons({
      settings,
      globeOutline,
      colorPaletteOutline,
      timeOutline,
      informationCircleOutline,
      shieldCheckmarkOutline,
      refreshOutline
    });
  }

  ngOnInit() {
    this.currentLang = this.settingsService.currentLang;
    this.currentTheme = this.settingsService.currentTheme;

    try {
      this.deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC-5';
    } catch {
      this.deviceTimezone = 'UTC-5';
    }

    this.settingsService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.timerService.localResetTime$.subscribe(time => {
      this.localResetTime = time;
    });
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  onLanguageChange(lang: Language) {
    this.currentLang = lang;
    this.settingsService.setLanguage(lang);
  }

  onThemeChange(theme: ThemeMode) {
    this.currentTheme = theme;
    this.settingsService.setTheme(theme);
  }
}

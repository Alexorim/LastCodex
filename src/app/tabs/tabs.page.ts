import { Component, OnInit, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { home, homeOutline, search, searchOutline, calendar, calendarOutline, settings, settingsOutline } from 'ionicons/icons';
import { SettingsService, Language } from '../services/settings.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  private settingsService = inject(SettingsService);
  currentLang: Language = 'es';

  constructor() {
    addIcons({
      home,
      homeOutline,
      search,
      searchOutline,
      calendar,
      calendarOutline,
      settings,
      settingsOutline
    });
  }

  ngOnInit() {
    this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }
}

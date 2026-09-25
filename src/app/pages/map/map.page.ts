import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import { arrowBackOutline, map, mapOutline, warningOutline, homeOutline } from 'ionicons/icons';
import { SettingsService, Language } from '../../services/settings.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MapPage implements OnInit {
  private router = inject(Router);
  private settingsService = inject(SettingsService);

  currentLang: Language = 'es';

  constructor() {
    addIcons({
      arrowBackOutline,
      map,
      mapOutline,
      warningOutline,
      homeOutline
    });
  }

  ngOnInit() {
    this.currentLang = this.settingsService.currentLang;
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}

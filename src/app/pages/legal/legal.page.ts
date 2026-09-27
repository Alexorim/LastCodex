import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline,
  shieldOutline,
  informationCircleOutline,
  mailOutline,
  lockClosedOutline,
  heartOutline,
  alertCircleOutline,
  arrowBackOutline,
  homeOutline,
  openOutline,
  documentTextOutline,
  sparklesOutline
} from 'ionicons/icons';
import { SettingsService, Language } from '../../services/settings.service';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.page.html',
  styleUrls: ['./legal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class LegalPage implements OnInit {
  private settingsService = inject(SettingsService);
  private router = inject(Router);

  currentLang: Language = 'es';

  constructor() {
    addIcons({
      shieldCheckmarkOutline,
      shieldOutline,
      informationCircleOutline,
      mailOutline,
      lockClosedOutline,
      heartOutline,
      alertCircleOutline,
      arrowBackOutline,
      homeOutline,
      openOutline,
      documentTextOutline,
      sparklesOutline
    });
  }

  ngOnInit(): void {
    this.currentLang = this.settingsService.currentLang;
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }
}

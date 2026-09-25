import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { arrowBackOutline, map, mapOutline, homeOutline, refreshOutline } from 'ionicons/icons';
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
  private sanitizer = inject(DomSanitizer);
  private settingsService = inject(SettingsService);

  currentLang: Language = 'es';
  mapViewerUrl: SafeResourceUrl = '';
  isLoadingMap = true;

  constructor() {
    addIcons({
      arrowBackOutline,
      map,
      mapOutline,
      homeOutline,
      refreshOutline
    });
  }

  ngOnInit() {
    this.currentLang = this.settingsService.currentLang;
    this.mapViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/map/index.html');
  }

  onMapLoaded(): void {
    this.isLoadingMap = false;
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}

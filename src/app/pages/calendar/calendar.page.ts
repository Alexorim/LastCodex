import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import { chevronDown, chevronForward, calendarOutline, shieldOutline } from 'ionicons/icons';
import { MaterialsService } from '../../services/materials.service';
import { SettingsService, Language } from '../../services/settings.service';
import { MaterialSearchResult } from '../../models/material.model';
import { getMaterialIcon } from '../../utils/material-icon.util';
import { getGuildIcon } from '../../utils/guild-icon.util';
import { translateMaterialName } from '../../utils/material-translation.util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CalendarPage implements OnInit, OnDestroy {
  private materialsService = inject(MaterialsService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);

  private dataSub: Subscription | null = null;
  private langSub: Subscription | null = null;

  catalog: MaterialSearchResult[] = [];
  expandedMaterial: string | null = null;
  currentLang: Language = 'es';

  constructor() {
    addIcons({ chevronDown, chevronForward, calendarOutline, shieldOutline });
  }

  ngOnInit() {
    this.langSub = this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.dataSub = this.materialsService.catalog$.subscribe(cat => {
      this.catalog = cat;
    });
  }

  ngOnDestroy() {
    this.dataSub?.unsubscribe();
    this.langSub?.unsubscribe();
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
    const target = event.target as HTMLImageElement;
    if (target && target.src) {
      if (target.src.includes('assets/materials/')) {
        const file = target.src.split('assets/materials/').pop();
        if (file && !target.dataset['fallbackTried']) {
          target.dataset['fallbackTried'] = '1';
          target.src = `assets/codex/materials/${file}`;
          return;
        }
      }
      if (target.src.includes('assets/codex/')) {
        const match = target.src.match(/assets\/codex\/(.+)$/);
        if (match && match[1] && !target.dataset['remoteTried']) {
          target.dataset['remoteTried'] = '1';
          target.src = `https://playorna.com/static/img/${match[1]}`;
          return;
        }
      }
      target.style.display = 'none';
    }
  }

  toggleMaterial(matName: string) {
    if (this.expandedMaterial === matName) {
      this.expandedMaterial = null;
    } else {
      this.expandedMaterial = matName;
    }
  }

  isExpanded(matName: string): boolean {
    return this.expandedMaterial === matName;
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
}

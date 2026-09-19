import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, shieldOutline, closeCircleOutline } from 'ionicons/icons';
import { MaterialsService } from '../../services/materials.service';
import { SettingsService, Language } from '../../services/settings.service';
import { MaterialSearchResult } from '../../models/material.model';
import { getMaterialIcon } from '../../utils/material-icon.util';
import { getGuildIcon } from '../../utils/guild-icon.util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SearchPage implements OnInit, OnDestroy {
  private materialsService = inject(MaterialsService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);

  private dataSub: Subscription | null = null;
  private langSub: Subscription | null = null;

  searchQuery: string = '';
  allMaterials: string[] = [];
  filteredMaterials: string[] = [];
  selectedResult: MaterialSearchResult | null = null;
  showSuggestions: boolean = false;
  currentLang: Language = 'es';

  constructor() {
    addIcons({ searchOutline, calendarOutline, shieldOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.langSub = this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.dataSub = this.materialsService.catalog$.subscribe(catalog => {
      this.allMaterials = catalog.map(c => c.materialName);
    });
  }

  ngOnDestroy() {
    this.dataSub?.unsubscribe();
    this.langSub?.unsubscribe();
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

  onSearchChange() {
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const query = this.searchQuery.trim().toLowerCase();
      this.filteredMaterials = this.allMaterials.filter(mat =>
        mat.toLowerCase().includes(query)
      );
      this.showSuggestions = true;
    } else {
      this.filteredMaterials = [];
      this.showSuggestions = false;
    }
  }

  selectMaterial(name: string) {
    this.selectedResult = this.materialsService.searchMaterial(name);
    this.searchQuery = name;
    this.showSuggestions = false;
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredMaterials = [];
    this.selectedResult = null;
    this.showSuggestions = false;
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

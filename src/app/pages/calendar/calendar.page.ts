import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import { chevronDown, chevronForward, calendarOutline, shieldOutline } from 'ionicons/icons';
import { MaterialsService } from '../../services/materials.service';
import { MaterialSearchResult } from '../../models/material.model';
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
  private dataSub: Subscription | null = null;

  catalog: MaterialSearchResult[] = [];
  selectedFilter: string = 'all';
  expandedMaterial: string | null = null;

  constructor() {
    addIcons({ chevronDown, chevronForward, calendarOutline, shieldOutline });
  }

  ngOnInit() {
    this.dataSub = this.materialsService.catalog$.subscribe(cat => {
      this.catalog = cat;
    });
  }

  ngOnDestroy() {
    this.dataSub?.unsubscribe();
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
    if (lower.includes('deepshards')) return '#42a5f5';
    if (lower.includes('remembrance')) return '#26c6da';
    if (lower.includes('sparring')) return '#66bb6a';
    if (lower.includes('trials')) return '#ffa726';
    if (lower.includes('towers')) return '#8d6e63';
    return '#78909c';
  }
}

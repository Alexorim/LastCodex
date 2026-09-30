import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import {
  calculatorOutline,
  searchOutline,
  closeCircleOutline,
  informationCircleOutline,
  chevronBackOutline,
  sparklesOutline,
  swapVerticalOutline,
  refreshOutline,
  arrowForwardOutline,
  bookOutline,
  addCircleOutline,
  removeCircleOutline,
  cubeOutline,
  addOutline
} from 'ionicons/icons';
import { ProofsService, MaterialOption, ProofCurrency, ProofCalculationResult } from '../../services/proofs.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-proofs',
  templateUrl: './proofs.page.html',
  styleUrls: ['./proofs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class ProofsPage implements OnInit {
  private proofsService = inject(ProofsService);
  private settingsService = inject(SettingsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public currentLang: 'es' | 'en' = 'es';
  public allMaterials: MaterialOption[] = [];
  public filteredMaterials: MaterialOption[] = [];
  public searchFilter: string = '';
  public selectedMaterial: MaterialOption | null = null;
  public materialCount: number = 10;
  public calculations: ProofCalculationResult[] = [];
  public isSelectingMaterial: boolean = false;

  constructor() {
    addIcons({
      calculatorOutline,
      searchOutline,
      closeCircleOutline,
      informationCircleOutline,
      chevronBackOutline,
      sparklesOutline,
      swapVerticalOutline,
      refreshOutline,
      arrowForwardOutline,
      bookOutline,
      addCircleOutline,
      removeCircleOutline,
      cubeOutline,
      addOutline
    });
  }

  ngOnInit(): void {
    this.currentLang = (this.settingsService.currentLang as 'es' | 'en') || 'es';
    this.allMaterials = this.proofsService.getAllMaterials();
    this.filteredMaterials = [...this.allMaterials];

    // Check query params for pre-selected material
    this.route.queryParams.subscribe(params => {
      const q = params['material'] || params['id'] || params['name'];
      if (q) {
        const found = this.proofsService.findMaterial(q);
        if (found) {
          this.selectMaterial(found);
          this.isSelectingMaterial = false;
          return;
        }
      }
      this.selectedMaterial = null;
      this.isSelectingMaterial = false;
      this.updateCalculations();
    });
  }

  public onSearchChange(event: any): void {
    const val = (event?.detail?.value || this.searchFilter || '').trim().toLowerCase();
    this.searchFilter = val;
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = this.allMaterials;

    if (this.searchFilter) {
      list = list.filter(m =>
        m.name.toLowerCase().includes(this.searchFilter) ||
        m.nameEs.toLowerCase().includes(this.searchFilter) ||
        m.nameEn.toLowerCase().includes(this.searchFilter)
      );
    }

    this.filteredMaterials = list;
  }

  public selectMaterial(mat: MaterialOption): void {
    this.selectedMaterial = mat;
    this.isSelectingMaterial = false;
    this.updateCalculations();
  }

  public toggleMaterialSelector(): void {
    this.isSelectingMaterial = !this.isSelectingMaterial;
    if (this.isSelectingMaterial) {
      this.searchFilter = '';
      this.applyFilters();
    }
  }

  public onMaterialCountChange(val: any): void {
    const num = parseInt(val, 10);
    this.materialCount = isNaN(num) || num < 0 ? 0 : num;
    this.updateCalculations();
  }



  public onProofCountChange(currency: ProofCurrency, event: any): void {
    if (!this.selectedMaterial) return;
    const proofAmount = parseInt(event?.target?.value || event, 10);
    if (!isNaN(proofAmount) && proofAmount >= 0) {
      const computedMats = this.proofsService.calculateMaterialCountFromProof(
        proofAmount,
        currency.rate,
        this.selectedMaterial.baseRate
      );
      this.materialCount = computedMats;
      this.updateCalculations();
    }
  }

  private updateCalculations(): void {
    if (!this.selectedMaterial) {
      this.calculations = this.proofsService.getCurrencies().map(curr => ({
        currency: curr,
        cost: 0,
        costFormatted: '0'
      }));
      return;
    }
    this.calculations = this.proofsService.calculateAll(
      this.materialCount,
      this.selectedMaterial.baseRate
    );
  }

  public getRarityClass(rarity: string): string {
    const r = (rarity || '').toLowerCase();
    switch (r) {
      case 'legendary':
      case 'legendario':
        return 'rarity-legendary';
      case 'famed':
      case 'afamado':
        return 'rarity-famed';
      case 'rare':
      case 'raro':
        return 'rarity-rare';
      default:
        return 'rarity-common';
    }
  }

  public getRarityLabel(rarity: string): string {
    const r = (rarity || '').toLowerCase();
    if (this.currentLang === 'es') {
      switch (r) {
        case 'legendary': return 'Legendario';
        case 'famed': return 'Afamado';
        case 'rare': return 'Raro';
        default: return 'Común';
      }
    }
    return rarity ? rarity.charAt(0).toUpperCase() + rarity.slice(1) : 'Common';
  }

  public onImageError(event: any): void {
    event.target.src = 'assets/codex/materials/steel.png';
  }


  public goToCodex(): void {
    if (this.selectedMaterial) {
      this.router.navigate(['/codex'], {
        queryParams: { search: this.selectedMaterial.nameEn }
      });
    } else {
      this.router.navigate(['/codex']);
    }
  }
}

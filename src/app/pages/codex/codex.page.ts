import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { addIcons } from 'ionicons';
import {
  book,
  bookOutline,
  searchOutline,
  filterOutline,
  openOutline,
  sparklesOutline,
  sparkles,
  shieldOutline,
  skullOutline,
  pawOutline,
  flameOutline,
  businessOutline,
  cubeOutline,
  flashOutline,
  chevronForwardOutline,
  chevronDownOutline,
  closeCircleOutline,
  informationCircleOutline,
  syncOutline,
  cloudDownloadOutline,
  alertCircleOutline,
  hammerOutline,
  shieldCheckmarkOutline,
  skull,
  flash,
  heartOutline,
  waterOutline,
  hardwareChipOutline,
  bagCheckOutline,
  constructOutline,
  ribbonOutline,
  layersOutline,
  gridOutline,
  listOutline,
  chevronBackOutline,
  playBackOutline,
  playForwardOutline
} from 'ionicons/icons';
import { SettingsService, Language } from '../../services/settings.service';
import { CodexService, CodexEntry, CodexSubItem, SyncProgress, UpdateCheckResult } from '../../services/codex.service';
import { BackButtonService } from '../../services/back-button.service';
import { Subscription } from 'rxjs';

export interface CodexCategory {
  id: string;
  nameEs: string;
  nameEn: string;
  icon: string;
  sprite: string;
  descriptionEs: string;
  descriptionEn: string;
}

@Component({
  selector: 'app-codex',
  templateUrl: './codex.page.html',
  styleUrls: ['./codex.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CodexPage implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private codexService = inject(CodexService);
  private backButtonService = inject(BackButtonService);
  private router = inject(Router);

  private subs = new Subscription();
  private unregisterBackOverlay: (() => void) | null = null;
  currentLang: Language = 'es';

  searchQuery = '';
  selectedCategory = 'all';
  selectedSubcategory = 'all';
  selectedTier: number | null = null;
  selectedEntry: CodexEntry | null = null;
  viewMode: 'list' | 'grid' = 'list';
  currentPage = 1;
  pageSize = 60;

  bannerDismissed = false;

  syncProgress: SyncProgress = {
    running: false,
    percent: 0,
    currentCategory: '',
    statusText: ''
  };

  updateStatus: UpdateCheckResult | null = null;

  categories: CodexCategory[] = [
    {
      id: 'items',
      nameEs: 'Objetos & Equipo',
      nameEn: 'Items & Gear',
      icon: 'shield-outline',
      sprite: 'https://playorna.com/static/img/weapons/blue_flame.png',
      descriptionEs: 'Armas, armaduras, accesorios y consumibles.',
      descriptionEn: 'Weapons, armor, accessories and consumables.'
    },
    {
      id: 'monsters',
      nameEs: 'Monstruos',
      nameEn: 'Monsters',
      icon: 'skull-outline',
      sprite: 'https://playorna.com/static/img/monsters/rat_man.png',
      descriptionEs: 'Criaturas salvajes del mundo abierto.',
      descriptionEn: 'Wild creatures roaming the overworld.'
    },
    {
      id: 'bosses',
      nameEs: 'Jefes (Bosses)',
      nameEn: 'Bosses',
      icon: 'skull-outline',
      sprite: 'https://playorna.com/static/img/bosses/minotaur.png',
      descriptionEs: 'Enemigos élite con recompensas legendarias.',
      descriptionEn: 'Elite enemies guarding legendary treasures.'
    },
    {
      id: 'raids',
      nameEs: 'Asaltos (Raids)',
      nameEn: 'Raids',
      icon: 'flame-outline',
      sprite: 'https://playorna.com/static/img/bosses/abaddon.png',
      descriptionEs: 'Jefes colosales de gremio y eventos del reino.',
      descriptionEn: 'Colossal kingdom and guild raid bosses.'
    },
    {
      id: 'followers',
      nameEs: 'Seguidores',
      nameEn: 'Followers',
      icon: 'paw-outline',
      sprite: 'https://playorna.com/static/img/monsters/dog.png',
      descriptionEs: 'Mascotas de combate y apoyo en batalla.',
      descriptionEn: 'Combat pets and battle companions.'
    },
    {
      id: 'spells',
      nameEs: 'Habilidades & Hechizos',
      nameEn: 'Skills & Spells',
      icon: 'flash-outline',
      sprite: 'https://playorna.com/static/img/spells/arcane.png',
      descriptionEs: 'Magias, artes marciales y bufos elementales.',
      descriptionEn: 'Spells, martial arts, and elemental buffs.'
    },
    {
      id: 'buildings',
      nameEs: 'Edificios',
      nameEn: 'Buildings',
      icon: 'business-outline',
      sprite: 'https://playorna.com/static/img/shops/town_hall.png',
      descriptionEs: 'Herrerías, tiendas, casas de cambio y puestos.',
      descriptionEn: 'Blacksmiths, shops, bestiaries and outposts.'
    },
    {
      id: 'dungeons',
      nameEs: 'Mazmorras',
      nameEn: 'Dungeons',
      icon: 'cubeOutline',
      sprite: 'https://playorna.com/static/img/shops/dragon_roost.png',
      descriptionEs: 'Guaridas, torres de titanes y desafíos épicos.',
      descriptionEn: 'Roosts, titan towers and labyrinth challenges.'
    },
    {
      id: 'classes',
      nameEs: 'Clases',
      nameEn: 'Classes',
      icon: 'sparkles-outline',
      sprite: 'https://playorna.com/static/img/classes/mage/default_m.png',
      descriptionEs: 'Especializaciones y ramas de progresión de héroe.',
      descriptionEn: 'Specializations and hero progression trees.'
    }
  ];

  codexDatabase: CodexEntry[] = [];

  constructor() {
    addIcons({
      book,
      bookOutline,
      searchOutline,
      filterOutline,
      openOutline,
      sparklesOutline,
      sparkles,
      shieldOutline,
      skullOutline,
      pawOutline,
      flameOutline,
      businessOutline,
      cubeOutline,
      flashOutline,
      chevronForwardOutline,
      chevronDownOutline,
      closeCircleOutline,
      informationCircleOutline,
      syncOutline,
      cloudDownloadOutline,
      alertCircleOutline,
      hammerOutline,
      shieldCheckmarkOutline,
      skull,
      flash,
      heartOutline,
      waterOutline,
      hardwareChipOutline,
      bagCheckOutline,
      constructOutline,
      ribbonOutline,
      layersOutline,
      gridOutline,
      listOutline,
      chevronBackOutline,
      playBackOutline,
      playForwardOutline
    });
  }

  ngOnInit() {
    const savedViewMode = localStorage.getItem('codex_view_mode') as 'list' | 'grid';
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      this.viewMode = savedViewMode;
    }

    this.subs.add(
      this.settingsService.lang$.subscribe(lang => {
        this.currentLang = lang;
      })
    );

    this.subs.add(
      this.codexService.entries$.subscribe(entries => {
        this.codexDatabase = entries;
        this.updateSubcatCounts();
      })
    );

    this.subs.add(
      this.codexService.syncProgress$.subscribe(prog => {
        this.syncProgress = prog;
      })
    );

    this.subs.add(
      this.codexService.updateStatus$.subscribe(status => {
        this.updateStatus = status;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    document.body.classList.remove('modal-open');
    if (this.unregisterBackOverlay) {
      this.unregisterBackOverlay();
      this.unregisterBackOverlay = null;
    }
  }

  subcatCounts: Record<string, number> = {
    all: 0,
    armor: 0,
    weapon: 0,
    consumable: 0,
    material: 0,
    currency: 0,
    adornment: 0,
    fish: 0
  };

  getItemSubcategory(entry: CodexEntry): string {
    if (entry.subcategory && entry.subcategory.trim()) {
      return entry.subcategory.trim().toLowerCase();
    }
    return this.codexService.deduceSubcategory(entry);
  }

  updateSubcatCounts(): void {
    const counts: Record<string, number> = {
      all: 0,
      armor: 0,
      weapon: 0,
      consumable: 0,
      material: 0,
      currency: 0,
      adornment: 0,
      fish: 0
    };
    for (const e of this.codexDatabase) {
      if (e.category !== 'items') continue;
      if (this.selectedTier !== null && e.tier !== this.selectedTier) continue;
      counts['all']++;
      const sub = this.getItemSubcategory(e);
      if (counts[sub] !== undefined) {
        counts[sub]++;
      }
    }
    this.subcatCounts = counts;
  }

  get filteredEntries(): CodexEntry[] {
    return this.codexDatabase.filter(entry => {
      const matchCat = this.selectedCategory === 'all' || entry.category === this.selectedCategory;
      const subcat = this.getItemSubcategory(entry);
      const matchSubcat =
        this.selectedCategory !== 'items' ||
        this.selectedSubcategory === 'all' ||
        subcat === this.selectedSubcategory;
      const matchTier = this.selectedTier === null || entry.tier === this.selectedTier;

      const q = this.searchQuery.trim().toLowerCase();
      if (!q) {
        return matchCat && matchSubcat && matchTier;
      }

      const matchQuery =
        (entry.name && entry.name.toLowerCase().includes(q)) ||
        (entry.nameEs && entry.nameEs.toLowerCase().includes(q)) ||
        (entry.nameEn && entry.nameEn.toLowerCase().includes(q)) ||
        (entry.type && entry.type.toLowerCase().includes(q)) ||
        (entry.rarity && entry.rarity.toLowerCase().includes(q)) ||
        (entry.description && entry.description.toLowerCase().includes(q)) ||
        (entry.descriptionEs && entry.descriptionEs.toLowerCase().includes(q)) ||
        (entry.descriptionEn && entry.descriptionEn.toLowerCase().includes(q));

      return matchCat && matchSubcat && matchTier && matchQuery;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEntries.length / this.pageSize) || 1;
  }

  get displayedEntries(): CodexEntry[] {
    const total = this.totalPages;
    if (this.currentPage > total) {
      this.currentPage = total;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEntries.slice(startIndex, startIndex + this.pageSize);
  }

  getPageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total);
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }

    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.scrollToTop();
  }

  scrollToTop(): void {
    const content = document.querySelector('ion-content.codex-content') as any;
    if (content && typeof content.scrollToTop === 'function') {
      content.scrollToTop(250);
    }
  }

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
    localStorage.setItem('codex_view_mode', mode);
  }

  toggleViewMode(): void {
    this.setViewMode(this.viewMode === 'list' ? 'grid' : 'list');
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  selectCategory(catId: string): void {
    this.selectedCategory = catId;
    this.selectedSubcategory = 'all';
    this.currentPage = 1;
    if (catId === 'items') {
      this.updateSubcatCounts();
    }
    this.scrollToTop();
  }

  setSubcategory(subcatId: string): void {
    this.selectedSubcategory = subcatId;
    this.currentPage = 1;
    this.scrollToTop();
  }

  openClassesTree(event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/codex/classes']);
  }

  onTierChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedTier = val ? Number(val) : null;
    this.currentPage = 1;
    this.updateSubcatCounts();
    this.scrollToTop();
  }

  onSubcategoryChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedSubcategory = val || 'all';
    this.currentPage = 1;
    this.scrollToTop();
  }

  openEntry(entry: CodexEntry): void {
    this.selectedEntry = entry;
    document.body.classList.add('modal-open');
    if (this.unregisterBackOverlay) {
      this.unregisterBackOverlay();
    }
    this.unregisterBackOverlay = this.backButtonService.registerOverlay(() => {
      if (this.selectedEntry) {
        this.closeEntry();
        return true;
      }
      return false;
    });
  }

  closeEntry(): void {
    this.selectedEntry = null;
    document.body.classList.remove('modal-open');
    if (this.unregisterBackOverlay) {
      this.unregisterBackOverlay();
      this.unregisterBackOverlay = null;
    }
  }

  ionViewWillLeave(): void {
    if (this.selectedEntry) {
      this.closeEntry();
    }
    document.body.classList.remove('modal-open');
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src && target.src.includes('assets/codex/')) {
      const match = target.src.match(/assets\/codex\/(.+)$/);
      if (match && match[1]) {
        target.src = `https://playorna.com/static/img/${match[1]}`;
        return;
      }
    }
    if (target) {
      target.style.display = 'none';
    }
  }

  getDisplayName(entry: CodexEntry): string {
    if (this.currentLang === 'es' && entry.nameEs) return entry.nameEs;
    if (this.currentLang === 'en' && entry.nameEn) return entry.nameEn;
    return entry.name;
  }

  getDisplayDescription(entry: CodexEntry): string {
    if (this.currentLang === 'es' && entry.descriptionEs) return entry.descriptionEs;
    if (this.currentLang === 'en' && entry.descriptionEn) return entry.descriptionEn;
    return entry.description || '';
  }

  async syncCodex(): Promise<void> {
    await this.codexService.syncFromPlayOrna();
  }

  dismissBanner(): void {
    this.bannerDismissed = true;
  }

  getItemStatEntries(entry: CodexEntry): Array<{ label: string; value: string }> {
    if (!entry.itemStats) return [];
    return Object.entries(entry.itemStats).map(([label, value]) => ({ label, value }));
  }

  getStatClass(label: string): string {
    const l = label.toLowerCase();
    if (l.includes('ataque') || l.includes('attack') || l.includes('power')) return 'stat-attack';
    if (l.includes('magia') || l.includes('magic')) return 'stat-magic';
    if (l.includes('defensa') || l.includes('defense')) return 'stat-defense';
    if (l.includes('resistencia') || l.includes('resistance')) return 'stat-resistance';
    if (l.includes('destreza') || l.includes('dexterity')) return 'stat-dexterity';
    if (l.includes('guard') || l.includes('ward')) return 'stat-ward';
    if (l.includes('salud') || l.includes('hp') || l.includes('ps')) return 'stat-hp';
    if (l.includes('maná') || l.includes('mana')) return 'stat-mana';
    if (l.includes('crít') || l.includes('crit')) return 'stat-crit';
    if (l.includes('adornment')) return 'stat-slots';
    if (l.includes('previsión')) return 'stat-foresight';
    return 'stat-general';
  }

  openSubItem(subItem: { name: string; url?: string }): void {
    if (!subItem || !subItem.name) return;
    const target = this.codexDatabase.find(e =>
      e.name.toLowerCase() === subItem.name.toLowerCase() ||
      (e.nameEs && e.nameEs.toLowerCase() === subItem.name.toLowerCase()) ||
      (e.nameEn && e.nameEn.toLowerCase() === subItem.name.toLowerCase())
    );
    if (target) {
      this.selectedEntry = target;
      document.body.classList.add('modal-open');
    } else if (subItem.url) {
      window.open(`https://playorna.com${subItem.url}`, '_blank');
    }
  }
}

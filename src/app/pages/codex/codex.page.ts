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
  informationCircleOutline
} from 'ionicons/icons';
import { SettingsService, Language } from '../../services/settings.service';
import { Subscription } from 'rxjs';
import codexData from '../../data/codex-items.json';

export interface CodexCategory {
  id: string;
  nameEs: string;
  nameEn: string;
  icon: string;
  sprite: string;
  descriptionEs: string;
  descriptionEn: string;
}

export interface CodexEntry {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  tier: number;
  icon: string;
  type: string;
  descriptionEs: string;
  descriptionEn: string;
  stats?: string;
  officialUrl: string;
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
  private router = inject(Router);

  private langSub: Subscription | null = null;
  currentLang: Language = 'es';

  searchQuery = '';
  selectedCategory = 'all';
  selectedSubcategory: string | null = null;
  selectedTier: number | null = null;
  selectedEntry: CodexEntry | null = null;
  displayLimit = 60;

  categories: CodexCategory[] = [
    {
      id: 'items',
      nameEs: 'Objetos & Equipo',
      nameEn: 'Items & Gear',
      icon: 'shield-outline',
      sprite: 'https://playorna.com/static/img/weapons/blue_flame.png',
      descriptionEs: 'Armas, armaduras, accesorios y materiales de forja.',
      descriptionEn: 'Weapons, armor, accessories and forging materials.'
    },
    {
      id: 'classes',
      nameEs: 'Clases',
      nameEn: 'Classes',
      icon: 'sparkles-outline',
      sprite: 'https://playorna.com/static/img/classes/mage/default_m.png',
      descriptionEs: 'Especializaciones y ramas de progresión de héroe.',
      descriptionEn: 'Specializations and hero progression trees.'
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
      id: 'followers',
      nameEs: 'Seguidores',
      nameEn: 'Followers',
      icon: 'paw-outline',
      sprite: 'https://playorna.com/static/img/monsters/dog.png',
      descriptionEs: 'Mascotas de combate y apoyo en batalla.',
      descriptionEn: 'Combat pets and battle companions.'
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
    }
  ];

  subcategoryLabels: { [key: string]: { es: string; en: string } } = {
    armors: { es: 'Armaduras', en: 'Armors' },
    weapons: { es: 'Armas', en: 'Weapons' },
    adornment: { es: 'Adornos', en: 'Adornments' },
    currency: { es: 'Monedas', en: 'Currency' },
    field: { es: 'Campo', en: 'Field' },
    fish: { es: 'Peces', en: 'Fish' },
    material: { es: 'Materiales', en: 'Materials' },
    useable: { es: 'Consumibles', en: 'Consumables' }
  };

  codexDatabase: CodexEntry[] = codexData as CodexEntry[];

  constructor() {
    addIcons({
      book,
      bookOutline,
      searchOutline,
      filterOutline,
      openOutline,
      sparklesOutline,
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
      informationCircleOutline
    });
  }

  ngOnInit() {
    this.langSub = this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  get filteredEntries(): CodexEntry[] {
    return this.codexDatabase.filter(entry => {
      const matchCat = this.selectedCategory === 'all' || entry.category === this.selectedCategory;
      const matchSub = this.selectedSubcategory === null || entry.subcategory === this.selectedSubcategory;
      const matchTier = this.selectedTier === null || entry.tier === this.selectedTier;
      const q = this.searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        entry.type.toLowerCase().includes(q) ||
        entry.descriptionEs.toLowerCase().includes(q) ||
        entry.descriptionEn.toLowerCase().includes(q);

      return matchCat && matchSub && matchTier && matchQuery;
    });
  }

  get displayedEntries(): CodexEntry[] {
    return this.filteredEntries.slice(0, this.displayLimit);
  }

  get availableSubcategories(): string[] {
    if (this.selectedCategory !== 'items') return [];
    const subs = new Set<string>();
    this.codexDatabase
      .filter(e => e.category === 'items' && e.subcategory)
      .forEach(e => subs.add(e.subcategory!));
    return Array.from(subs).sort();
  }

  selectCategory(catId: string): void {
    if (catId === 'classes') {
      this.router.navigate(['/codex/classes']);
      return;
    }
    this.selectedCategory = catId;
    this.selectedSubcategory = null;
    this.displayLimit = 60;
  }

  filterSubcategory(sub: string | null): void {
    this.selectedSubcategory = this.selectedSubcategory === sub ? null : sub;
    this.displayLimit = 60;
  }

  filterTier(tier: number | null): void {
    this.selectedTier = this.selectedTier === tier ? null : tier;
    this.displayLimit = 60;
  }

  onTierChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedTier = val ? Number(val) : null;
    this.displayLimit = 60;
  }

  onSubcategoryChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedSubcategory = val || null;
    this.displayLimit = 60;
  }

  loadMore(): void {
    this.displayLimit += 60;
  }

  openEntry(entry: CodexEntry): void {
    this.selectedEntry = entry;
  }

  closeEntry(): void {
    this.selectedEntry = null;
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  getSubcategoryLabel(sub: string): string {
    const label = this.subcategoryLabels[sub];
    if (!label) return sub;
    return this.currentLang === 'es' ? label.es : label.en;
  }
}


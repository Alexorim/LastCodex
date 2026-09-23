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
import { CodexService, CodexEntry } from '../../services/codex.service';
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
  private router = inject(Router);

  private langSub: Subscription | null = null;
  private codexSub: Subscription | null = null;
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

    this.codexSub = this.codexService.entries$.subscribe(entries => {
      this.codexDatabase = entries;
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
    this.codexSub?.unsubscribe();
  }

  get filteredEntries(): CodexEntry[] {
    return this.codexDatabase.filter(entry => {
      const matchCat = this.selectedCategory === 'all' || entry.category === this.selectedCategory;
      const matchTier = this.selectedTier === null || entry.tier === this.selectedTier;

      const q = this.searchQuery.trim().toLowerCase();
      if (!q) {
        return matchCat && matchTier;
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

      return matchCat && matchTier && matchQuery;
    });
  }

  get displayedEntries(): CodexEntry[] {
    return this.filteredEntries.slice(0, this.displayLimit);
  }

  selectCategory(catId: string): void {
    this.selectedCategory = catId;
    this.selectedSubcategory = null;
    this.displayLimit = 60;
  }

  openClassesTree(event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/codex/classes']);
  }

  onTierChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedTier = val ? Number(val) : null;
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
}

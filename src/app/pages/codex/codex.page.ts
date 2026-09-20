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
  closeCircleOutline
} from 'ionicons/icons';
import { SettingsService, Language } from '../../services/settings.service';
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

export interface CodexEntry {
  id: string;
  name: string;
  category: string;
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
  selectedTier: number | null = null;
  selectedEntry: CodexEntry | null = null;

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

  codexDatabase: CodexEntry[] = [
    // Items
    {
      id: 'baldur-gear',
      name: 'Baldur Gear',
      category: 'items',
      tier: 10,
      icon: 'https://playorna.com/static/img/weapons/blue_flame.png',
      type: 'Armor / Gear',
      descriptionEs: 'Equipamiento legendario imbuido con poder celestial de Baldur.',
      descriptionEn: 'Legendary gear imbued with celestial Baldur powers.',
      stats: 'Def: +450 | Res: +420 | Ward: +85%',
      officialUrl: 'https://playorna.com/codex/items/'
    },
    {
      id: 'questing-staff',
      name: 'Questing Staff',
      category: 'items',
      tier: 9,
      icon: 'https://playorna.com/static/img/weapons/blue_flame.png',
      type: 'Staff / Weapon',
      descriptionEs: 'Bastón codiciado por magos que otorga bonificaciones masivas de experiencia y oro.',
      descriptionEn: 'Coveted mage staff granting massive bonuses to EXP and Gold.',
      stats: 'Mag: +680 | Bonus EXP & Orns',
      officialUrl: 'https://playorna.com/codex/items/'
    },
    {
      id: 'ortanite-ore',
      name: 'Ortanite',
      category: 'items',
      tier: 8,
      icon: 'assets/materials/ortanite.png',
      type: 'Material',
      descriptionEs: 'Mineral puro codiciado por los 12 gremios para forja avanzada.',
      descriptionEn: 'Pure ore required across all 12 guilds for master forging.',
      stats: 'Tier 8 Crafting Material',
      officialUrl: 'https://playorna.com/codex/items/'
    },
    {
      id: 'coconuts',
      name: 'Great Mimic Mischief',
      category: 'items',
      tier: 7,
      icon: 'assets/materials/pure_water.png',
      type: 'Consumable / Charm',
      descriptionEs: 'Amuleto curioso que altera las probabilidades del destino en el mundo.',
      descriptionEn: 'Curious charm altering worldly fate and luck.',
      stats: 'Luck +20%',
      officialUrl: 'https://playorna.com/codex/items/'
    },

    // Classes
    {
      id: 'deity',
      name: 'Deity',
      category: 'classes',
      tier: 10,
      icon: 'https://playorna.com/static/img/classes/mage/default_m.png',
      type: 'Hero Class',
      descriptionEs: 'El pináculo del poder mortal, capaz de canalizar todos los elementos y afinidades.',
      descriptionEn: 'The pinnacle of mortal potential, channeling all elemental affinities.',
      stats: 'HP: S | MP: S | Atk: S | Mag: S',
      officialUrl: 'https://playorna.com/codex/classes/'
    },
    {
      id: 'heretic',
      name: 'Heretic',
      category: 'classes',
      tier: 10,
      icon: 'https://playorna.com/static/img/classes/mage/default_m.png',
      type: 'Mage Class',
      descriptionEs: 'Maestro de la hechicería oscura cuyo daño aumenta a medida que disminuye su maná.',
      descriptionEn: 'Master of dark sorcery whose destructive power amplifies as mana depletes.',
      stats: 'Mag: S+ | Apex Dark Magic',
      officialUrl: 'https://playorna.com/codex/classes/'
    },
    {
      id: 'gilgamesh',
      name: 'Gilgamesh',
      category: 'classes',
      tier: 10,
      icon: 'https://playorna.com/static/img/classes/warrior/default_m.png',
      type: 'Warrior Class',
      descriptionEs: 'Titán inquebrantable que convierte sus reservas de guardia en daño demoledor.',
      descriptionEn: 'Unshakable juggernaut converting deep ward pools into cataclysmic strikes.',
      stats: 'HP: S+ | Def: S+ | Ward: +150%',
      officialUrl: 'https://playorna.com/codex/classes/'
    },
    {
      id: 'grand-summoner',
      name: 'Grand Summoner',
      category: 'classes',
      tier: 10,
      icon: 'https://playorna.com/static/img/classes/mage/default_m.png',
      type: 'Summoner Class',
      descriptionEs: 'Comandante del ejército dimensional, invocando entidades cósmicas al campo de batalla.',
      descriptionEn: 'Commander of dimensional legions, calling forth cosmic entities.',
      stats: 'Multi-Summon Capacity',
      officialUrl: 'https://playorna.com/codex/classes/'
    },

    // Monsters & Bosses
    {
      id: 'mammon',
      name: 'Mammon',
      category: 'bosses',
      tier: 9,
      icon: 'https://playorna.com/static/img/bosses/minotaur.png',
      type: 'World Boss',
      descriptionEs: 'El señor de la codicia y portador de la espada demoníaca.',
      descriptionEn: 'The lord of greed and bearer of the fiendish blade.',
      stats: 'Drops: Fallen Gear & Pure Ortanite',
      officialUrl: 'https://playorna.com/codex/bosses/'
    },
    {
      id: 'arisen-morrigan',
      name: 'Arisen Morrigan',
      category: 'raids',
      tier: 10,
      icon: 'https://playorna.com/static/img/bosses/abaddon.png',
      type: 'Kingdom Raid Boss',
      descriptionEs: 'La diosa de la guerra en su forma resurgida. Desafío supremo para reinos.',
      descriptionEn: 'The goddess of warfare resurrected. Ultimate kingdom raid challenge.',
      stats: 'HP: 300,000,000',
      officialUrl: 'https://playorna.com/codex/raids/'
    },
    {
      id: 'apollyon',
      name: 'Apollyon the Destroyer',
      category: 'raids',
      tier: 9,
      icon: 'https://playorna.com/static/img/icons/apollyon.png',
      type: 'Kingdom Raid Boss',
      descriptionEs: 'El destructor ancestral que porta armaduras de inmensa resistencia elemental.',
      descriptionEn: 'The ancient destructor carrying impenetrable elemental armor.',
      stats: 'HP: 100,000,000',
      officialUrl: 'https://playorna.com/codex/raids/'
    },

    // Followers
    {
      id: 'ashen-phoenix',
      name: 'Ashen Phoenix',
      category: 'followers',
      tier: 10,
      icon: 'https://playorna.com/static/img/monsters/dog.png',
      type: 'Pet / Follower',
      descriptionEs: 'Fénix ceniciento capaz de otorgar el bufo Deific Channel en combate.',
      descriptionEn: 'Ashen Phoenix blessing its master with Deific Channel in combat.',
      stats: 'Skill: Deific Channel & Rebirth',
      officialUrl: 'https://playorna.com/codex/followers/'
    },
    {
      id: 'spirit-golem',
      name: 'Spirit Golem',
      category: 'followers',
      tier: 8,
      icon: 'https://playorna.com/static/img/monsters/dog.png',
      type: 'Pet / Follower',
      descriptionEs: 'Golem espiritual protector que levanta barreras de guardia inquebrantables.',
      descriptionEn: 'Spiritual defender sustaining unbroken ward shields.',
      stats: 'Skill: Ward of Mythril',
      officialUrl: 'https://playorna.com/codex/followers/'
    },

    // Spells
    {
      id: 'omnistrike',
      name: 'Omnistrike V',
      category: 'spells',
      tier: 10,
      icon: 'https://playorna.com/static/img/spells/arcane.png',
      type: 'Physical Skill',
      descriptionEs: 'Golpe demoledor capaz de infligir reducciones de todos los atributos al oponente.',
      descriptionEn: 'Devastating strike inflicting multiple attribute reductions.',
      stats: 'Chance: All Single Down Debuffs',
      officialUrl: 'https://playorna.com/codex/spells/'
    },
    {
      id: 'divine-bastion',
      name: 'Divine Bastion II',
      category: 'spells',
      tier: 10,
      icon: 'https://playorna.com/static/img/spells/arcane.png',
      type: 'Ward Spell',
      descriptionEs: 'Eleva la absorción de daño de guardia al 100% protegiendo toda la vida.',
      descriptionEn: 'Raises ward damage absorption to 100% mitigating direct HP damage.',
      stats: 'Ward Absorb: 100%',
      officialUrl: 'https://playorna.com/codex/spells/'
    },

    // Dungeons & Buildings
    {
      id: 'titan-tower',
      name: 'Tower of Titans',
      category: 'dungeons',
      tier: 9,
      icon: 'https://playorna.com/static/img/shops/dragon_roost.png',
      type: 'Endgame Dungeon',
      descriptionEs: 'Torres infinitas de 50 pisos para recolectar fragmentos de torre y armas celestiales.',
      descriptionEn: '50-floor infinite spire rewarding tower shards and celestial gear.',
      stats: 'Tower Fragments & Augments',
      officialUrl: 'https://playorna.com/codex/dungeons/'
    },
    {
      id: 'wayvessel',
      name: 'Wayvessel',
      category: 'buildings',
      tier: 1,
      icon: 'https://playorna.com/static/img/shops/town_hall.png',
      type: 'Origin Town Building',
      descriptionEs: 'Portal místico que permite viajar instantáneamente a las bases de tus aliados.',
      descriptionEn: 'Mystic beacon permitting instantaneous travel between party outposts.',
      stats: 'Party Teleportation',
      officialUrl: 'https://playorna.com/codex/buildings/'
    }
  ];

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
      closeCircleOutline
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
      const matchTier = this.selectedTier === null || entry.tier === this.selectedTier;
      const q = this.searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        entry.type.toLowerCase().includes(q) ||
        entry.descriptionEs.toLowerCase().includes(q) ||
        entry.descriptionEn.toLowerCase().includes(q);

      return matchCat && matchTier && matchQuery;
    });
  }

  selectCategory(catId: string): void {
    this.selectedCategory = catId;
  }

  filterTier(tier: number | null): void {
    this.selectedTier = this.selectedTier === tier ? null : tier;
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
}

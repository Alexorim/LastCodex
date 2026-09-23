import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  arrowForward,
  chevronDown,
  chevronBackOutline,
  chevronForwardOutline,
  close,
  heart,
  sparklesOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { SettingsService } from '../../services/settings.service';

interface ClassDef {
  name: string;
  sprite: string;
  subclass?: string;
  isHybrid?: boolean;
}

interface TierDef {
  tier: number;
  level: number;
  classes: ClassDef[];
}

interface FamilyDef {
  name: string;
  pathEn: string;
  pathEs: string;
  color: string;
  tiers: TierDef[];
}

@Component({
  selector: 'app-codex-classes',
  templateUrl: './codex-classes.page.html',
  styleUrls: ['./codex-classes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CodexClassesPage {
  currentFamilyIndex: number = 0;
  
  families: FamilyDef[] = [
    {
      name: "Valor",
      pathEn: "Path of the Warrior",
      pathEs: "Senda del Guerrero",
      color: "#2563EB",
      tiers: [
        { tier: 1, level: 1, classes: [{ name: "Warrior", subclass: "Cataphract", sprite: "assets/codex/classes/1 VALOR/★ 1/warrior.png" }] },
        { tier: 2, level: 25, classes: [{ name: "Footsoldier", sprite: "assets/codex/classes/1 VALOR/★ 2/footsoldier.png" }] },
        { tier: 3, level: 50, classes: [{ name: "Squire", subclass: "Cataphract", sprite: "assets/codex/classes/1 VALOR/★ 3/squire.png" }] },
        { tier: 4, level: 75, classes: [{ name: "Lancer", sprite: "assets/codex/classes/1 VALOR/★ 4/lancer.png" }, { name: "Spellsword", subclass: "Cataphract", isHybrid: true, sprite: "assets/codex/classes/1 VALOR/★ 4/spellword.png" }] },
        { tier: 5, level: 100, classes: [{ name: "Cavalry", sprite: "assets/codex/classes/1 VALOR/★ 5/cavalry.png" }] },
        { tier: 6, level: 125, classes: [{ name: "Templar", subclass: "Tamer", sprite: "assets/codex/classes/1 VALOR/★ 6/templar.png" }] },
        { tier: 7, level: 150, classes: [{ name: "Majistrate", sprite: "assets/codex/classes/1 VALOR/★ 7/majistrate.png" }, { name: "Paladin", isHybrid: true, sprite: "assets/codex/classes/1 VALOR/★ 7/paladin.png" }] },
        { tier: 8, level: 175, classes: [{ name: "Atlas Vanguard", sprite: "assets/codex/classes/1 VALOR/★ 8/atlas vanguard.png" }] },
        { tier: 9, level: 200, classes: [{ name: "Titanguard", sprite: "assets/codex/classes/1 VALOR/★ 9/titanguard.png" }, { name: "Titanguard Hercules", sprite: "assets/codex/classes/1 VALOR/★ 9/titanguard_hercules.png" }, { name: "Titanguard Ursa", sprite: "assets/codex/classes/1 VALOR/★ 9/titanguard_ursa.png" }] },
        { tier: 10, level: 225, classes: [{ name: "Gilgamesh", sprite: "assets/codex/classes/1 VALOR/★ 10/gilgamesh.png" }, { name: "Gilgamesh Hercules", sprite: "assets/codex/classes/1 VALOR/★ 10/gilgamesh_hercules.png" }, { name: "Gilgamesh Ursa", sprite: "assets/codex/classes/1 VALOR/★ 10/gilgamesh_ursa.png" }] }
      ]
    },
    {
      name: "Omnimancy",
      pathEn: "Path of the Mage",
      pathEs: "Senda del Mago",
      color: "#7C3AED",
      tiers: [
        { tier: 1, level: 1, classes: [{ name: "Mage", subclass: "Cataphract", sprite: "assets/codex/classes/2 OMNIMANCY/★ 1/mage.png" }] },
        { tier: 2, level: 25, classes: [{ name: "Archmage", subclass: "High Cleric", sprite: "assets/codex/classes/2 OMNIMANCY/★ 2/archmage.png" }] },
        { tier: 3, level: 50, classes: [{ name: "Court Mage", subclass: "High Cleric", sprite: "assets/codex/classes/2 OMNIMANCY/★ 3/court_mage.png" }] },
        { tier: 4, level: 75, classes: [{ name: "Spellsword", subclass: "Cataphract", isHybrid: true, sprite: "assets/codex/classes/2 OMNIMANCY/★ 4/spellword.png" }, { name: "Mystic", subclass: "High Cleric", isHybrid: true, sprite: "assets/codex/classes/2 OMNIMANCY/★ 4/mystic_.png" }] },
        { tier: 5, level: 100, classes: [{ name: "Druid", subclass: "Tamer", sprite: "assets/codex/classes/2 OMNIMANCY/★ 5/druid.png" }] },
        { tier: 6, level: 125, classes: [{ name: "Spellweaver", subclass: "Chronomancer", sprite: "assets/codex/classes/2 OMNIMANCY/★ 6/spellweaver.png" }] },
        { tier: 7, level: 150, classes: [{ name: "Archdruid", sprite: "assets/codex/classes/2 OMNIMANCY/★ 7/archdruid.png" }, { name: "Paladin", isHybrid: true, sprite: "assets/codex/classes/2 OMNIMANCY/★ 7/paladin.png" }] },
        { tier: 8, level: 175, classes: [{ name: "Nekromancer", sprite: "assets/codex/classes/2 OMNIMANCY/★ 8/nekromancer.png" }] },
        { tier: 9, level: 200, classes: [{ name: "Omnimancer", sprite: "assets/codex/classes/2 OMNIMANCY/★ 9/omnimancer.png" }, { name: "Omnimancer Antlia", sprite: "assets/codex/classes/2 OMNIMANCY/★ 9/omnimancer_antlia.png" }, { name: "Omnimancer Ara", sprite: "assets/codex/classes/2 OMNIMANCY/★ 9/omnimancer_ara.png" }] },
        { tier: 10, level: 225, classes: [{ name: "Heretic", sprite: "assets/codex/classes/2 OMNIMANCY/★ 10/heretic.png" }, { name: "Heretic Ara", sprite: "assets/codex/classes/2 OMNIMANCY/★ 10/heretic_ara.png" }, { name: "Heretic Corvus", sprite: "assets/codex/classes/2 OMNIMANCY/★ 10/heretic_corvus.png" }] }
      ]
    },
    {
      name: "Shadowmancy",
      pathEn: "Path of the Thief",
      pathEs: "Senda del Ladrón",
      color: "#A855F7",
      tiers: [
        { tier: 1, level: 1, classes: [{ name: "Thief", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 1/thief.png" }] },
        { tier: 2, level: 25, classes: [{ name: "Strider", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 2/strider.png" }] },
        { tier: 3, level: 50, classes: [{ name: "Shadowmaker", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 3/shadowmaker.png" }] },
        { tier: 4, level: 75, classes: [{ name: "Lancer", isHybrid: true, sprite: "assets/codex/classes/3 SHADOWMANCY/★ 4/lancer.png" }, { name: "Mystic", subclass: "High Cleric", isHybrid: true, sprite: "assets/codex/classes/3 SHADOWMANCY/★ 4/mystic.png" }] },
        { tier: 5, level: 100, classes: [{ name: "Majestic", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 5/magestic.png" }] },
        { tier: 6, level: 125, classes: [{ name: "Shadowmancer", subclass: "Tamer", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 6/shadowmancer.png" }] },
        { tier: 7, level: 150, classes: [{ name: "Archdruid", isHybrid: true, sprite: "assets/codex/classes/3 SHADOWMANCY/★ 7/archdruid.png" }, { name: "Majistrate", isHybrid: true, sprite: "assets/codex/classes/3 SHADOWMANCY/★ 7/majistrate.png" }] },
        { tier: 8, level: 175, classes: [{ name: "Arcanic", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 8/arcanic.png" }] },
        { tier: 9, level: 200, classes: [{ name: "Nyx", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 9/nyx.png" }, { name: "Nyx Corvus", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 9/nyx_corvus.png" }, { name: "Nyx Hercules", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 9/nyx_hercules.png" }] },
        { tier: 10, level: 225, classes: [{ name: "Realmshifter", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 10/realmshifter_.png" }, { name: "Realmshifter Corvus", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 10/realmshifter_corvus.png" }, { name: "Realmshifter Dorado", sprite: "assets/codex/classes/3 SHADOWMANCY/★ 10/realmshifter_dorado.png" }] }
      ]
    },
    {
      name: "Valhallan",
      pathEn: "Path of the Tamer",
      pathEs: "Senda del Domador",
      color: "#84CC16",
      tiers: [
        { tier: 3, level: 50, classes: [{ name: "Handler", subclass: "Tamer", sprite: "assets/codex/classes/4 VALHALLAN/★ 3/handler.png" }] },
        { tier: 4, level: 75, classes: [{ name: "Wolf Tamer", subclass: "Tamer", sprite: "assets/codex/classes/4 VALHALLAN/★ 4/wolf_tamer.png" }] },
        { tier: 5, level: 100, classes: [{ name: "Spirit Tamer", subclass: "Tamer", sprite: "assets/codex/classes/4 VALHALLAN/★ 5/spirit_tamer.png" }] },
        { tier: 6, level: 125, classes: [{ name: "Dragoon", sprite: "assets/codex/classes/4 VALHALLAN/★ 6/dragoon.png" }] },
        { tier: 7, level: 150, classes: [{ name: "Grand Dragoon", subclass: "Tamer", sprite: "assets/codex/classes/4 VALHALLAN/★ 7/grand_dragoon.png" }] },
        { tier: 8, level: 175, classes: [{ name: "Freyr", sprite: "assets/codex/classes/4 VALHALLAN/★ 8/freyr.png" }] },
        { tier: 9, level: 200, classes: [{ name: "Bahamut", sprite: "assets/codex/classes/4 VALHALLAN/★ 9/bahamut.png" }, { name: "Bahamut Auriga", sprite: "assets/codex/classes/4 VALHALLAN/★ 9/bahamut_auriga.png" }, { name: "Bahamut Hydrus", sprite: "assets/codex/classes/4 VALHALLAN/★ 9/bahamut_hydrus.png" }] },
        { tier: 10, level: 225, classes: [{ name: "Beowulf", sprite: "assets/codex/classes/4 VALHALLAN/★ 10/beowulf.png" }, { name: "Beowulf Auriga", sprite: "assets/codex/classes/4 VALHALLAN/★ 10/beowulf_auriga.png" }, { name: "Beowulf Hydrus", sprite: "assets/codex/classes/4 VALHALLAN/★ 10/beowulf_hydrus.png" }] }
      ]
    },
    {
      name: "Elysian",
      pathEn: "Path of the Summoner",
      pathEs: "Senda del Invocador",
      color: "#F59E0B",
      tiers: [
        { tier: 7, level: 150, classes: [{ name: "Attuner", sprite: "assets/codex/classes/5 ELYSIAN/★ 7/attuner.png" }] },
        { tier: 8, level: 175, classes: [{ name: "Grand Attuner", sprite: "assets/codex/classes/5 ELYSIAN/★ 8/grand_attuner.png" }] },
        { tier: 9, level: 200, classes: [{ name: "Summoner", sprite: "assets/codex/classes/5 ELYSIAN/★ 9/summoner.png" }, { name: "Summoner Auriga", sprite: "assets/codex/classes/5 ELYSIAN/★ 9/summoner_auriga.png" }, { name: "Summoner Hydrus", sprite: "assets/codex/classes/5 ELYSIAN/★ 9/summoner_hydrus.png" }] },
        { tier: 10, level: 225, classes: [{ name: "Grand Summoner", sprite: "assets/codex/classes/5 ELYSIAN/★ 10/grand_summoner.png" }, { name: "Grand Summoner Auriga", sprite: "assets/codex/classes/5 ELYSIAN/★ 10/grand_summoner_auriga.png" }, { name: "Grand Summoner Hydrus", sprite: "assets/codex/classes/5 ELYSIAN/★ 10/grand_summoner_hydrus.png" }] }
      ]
    },
    {
      name: "The Old Gods",
      pathEn: "Path of the Gods",
      pathEs: "Senda de los Dioses",
      color: "#EF4444",
      tiers: [
        { tier: 8, level: 175, classes: [{ name: "Ifrit", sprite: "assets/codex/classes/6 THE OLD GODS/★ 8/ifrit.png" }, { name: "Leviathan", sprite: "assets/codex/classes/6 THE OLD GODS/★ 8/leviathan.png" }, { name: "Gaia", sprite: "assets/codex/classes/6 THE OLD GODS/★ 8/gaia.png" }, { name: "Taranis", sprite: "assets/codex/classes/6 THE OLD GODS/★ 8/taranis.png" }] },
        { tier: 9, level: 200, classes: [{ name: "Grand Ifrit", sprite: "assets/codex/classes/6 THE OLD GODS/★ 9/grand_ifrit.png" }, { name: "Grand Leviathan", sprite: "assets/codex/classes/6 THE OLD GODS/★ 9/grand_leviathan.png" }, { name: "Noble Gaia", sprite: "assets/codex/classes/6 THE OLD GODS/★ 9/noble_gaia.png" }, { name: "High Taranis", sprite: "assets/codex/classes/6 THE OLD GODS/★ 9/high_taranis.png" }] },
        { tier: 10, level: 225, classes: [{ name: "Deity", sprite: "assets/codex/classes/6 THE OLD GODS/★ 10/deity.png" }, { name: "Deity Ara", sprite: "assets/codex/classes/6 THE OLD GODS/★ 10/deity_ara.png" }, { name: "Deity Ursa", sprite: "assets/codex/classes/6 THE OLD GODS/★ 10/deity_ursa.png" }] }
      ]
    },
    {
      name: "The Elderred",
      pathEn: "The Ancient Path",
      pathEs: "La Senda Ancestral",
      color: "#78716C",
      tiers: [
        { tier: 2, level: 25, classes: [{ name: "Knight", sprite: "assets/codex/classes/7 THE ELDERRED/★ 2/knight.png" }] },
        { tier: 3, level: 50, classes: [{ name: "Battle Master", sprite: "assets/codex/classes/7 THE ELDERRED/★ 3/battle_master.png" }, { name: "Centurion", sprite: "assets/codex/classes/7 THE ELDERRED/★ 3/centurion.png" }, { name: "Sorcerer", sprite: "assets/codex/classes/7 THE ELDERRED/★ 3/sorcerer.png" }] },
        { tier: 5, level: 100, classes: [{ name: "Dragoon", sprite: "assets/codex/classes/7 THE ELDERRED/★ 5/dragoon.png" }, { name: "Druid", sprite: "assets/codex/classes/7 THE ELDERRED/★ 5/druid.png" }, { name: "Majestic", sprite: "assets/codex/classes/7 THE ELDERRED/★ 5/majestic.png" }] },
        { tier: 6, level: 125, classes: [{ name: "Battlemage", sprite: "assets/codex/classes/7 THE ELDERRED/★ 6/battlemage.png" }, { name: "Battlemaster", sprite: "assets/codex/classes/7 THE ELDERRED/★ 6/battlemaster.png" }] }
      ]
    }
  ];

  constructor(private router: Router, private settings: SettingsService) {
    addIcons({
      arrowBack,
      arrowForward,
      chevronDown,
      chevronBackOutline,
      chevronForwardOutline,
      close,
      heart,
      sparklesOutline,
      closeCircleOutline
    });
  }

  get currentFamily() {
    return this.families[this.currentFamilyIndex];
  }

  get currentLang(): 'es' | 'en' {
    return this.settings.currentLang === 'es' ? 'es' : 'en';
  }

  getStars(count: number): string {
    return '★'.repeat(count);
  }

  nextFamily() {
    if (this.currentFamilyIndex < this.families.length - 1) {
      this.currentFamilyIndex++;
    }
  }

  prevFamily() {
    if (this.currentFamilyIndex > 0) {
      this.currentFamilyIndex--;
    }
  }

  selectFamily(idx: number) {
    if (idx >= 0 && idx < this.families.length) {
      this.currentFamilyIndex = idx;
    }
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  goBack() {
    this.router.navigate(['/codex']);
  }
}

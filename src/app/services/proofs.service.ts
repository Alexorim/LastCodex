import { Injectable, inject } from '@angular/core';
import defaultCodexData from '../data/codex-items.json';

export interface ProofCurrency {
  id: string;
  key: string;
  nameEs: string;
  nameEn: string;
  guildEs: string;
  guildEn: string;
  rate: number; // Ratio multiplier per 100 base units
  icon: string;
  color?: string;
  bgGradient?: string;
}

export interface MaterialOption {
  id: string;
  name: string;
  nameEs: string;
  nameEn: string;
  tier: number;
  rarity: string;
  icon: string;
  baseRate: number;
  descriptionEs?: string;
  descriptionEn?: string;
}

export interface ProofCalculationResult {
  currency: ProofCurrency;
  cost: number;
  costFormatted: string;
}

export const BASE_DENOMINATOR = 100;

export const PROOF_CURRENCIES: ProofCurrency[] = [
  {
    id: 'proof-of-monument',
    key: 'proof-of-monument',
    nameEs: 'Prueba de Monumento',
    nameEn: 'Proof of Monument',
    guildEs: 'Gremio de Monumentos',
    guildEn: 'Monument Guild',
    rate: 10,
    icon: 'assets/codex/useables/proof_monument1.png',
    color: '#E5A93C',
    bgGradient: 'linear-gradient(135deg, rgba(229,169,60,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-anguish',
    key: 'proof-of-anguish',
    nameEs: 'Prueba de Angustia',
    nameEn: 'Proof of Anguish',
    guildEs: 'Círculo de la Angustia',
    guildEn: 'Circle of Anguish',
    rate: 1,
    icon: 'assets/codex/useables/proof_anguish.png',
    color: '#9C27B0',
    bgGradient: 'linear-gradient(135deg, rgba(156,39,176,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-agony',
    key: 'proof-of-agony',
    nameEs: 'Prueba de Agonía',
    nameEn: 'Proof of Agony',
    guildEs: 'Círculo de la Angustia',
    guildEn: 'Circle of Anguish',
    rate: 1,
    icon: 'assets/codex/useables/proof_agony.png',
    color: '#BA68C8',
    bgGradient: 'linear-gradient(135deg, rgba(186,104,200,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-despair',
    key: 'proof-of-despair',
    nameEs: 'Prueba de Desesperación',
    nameEn: 'Proof of Despair',
    guildEs: 'Círculo de la Angustia',
    guildEn: 'Circle of Anguish',
    rate: 1,
    icon: 'assets/codex/useables/proof_despair.png',
    color: '#7E57C2',
    bgGradient: 'linear-gradient(135deg, rgba(126,87,194,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-melancholy',
    key: 'proof-of-melancholy',
    nameEs: 'Prueba de Melancolía',
    nameEn: 'Proof of Melancholy',
    guildEs: 'Círculo de la Angustia',
    guildEn: 'Circle of Anguish',
    rate: 1,
    icon: 'assets/codex/useables/proof_melancholy.png',
    color: '#5C6BC0',
    bgGradient: 'linear-gradient(135deg, rgba(92,107,192,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-torment',
    key: 'proof-of-torment',
    nameEs: 'Prueba de Tormento',
    nameEn: 'Proof of Torment',
    guildEs: 'Círculo de la Angustia',
    guildEn: 'Circle of Anguish',
    rate: 1,
    icon: 'assets/codex/useables/proof_torment.png',
    color: '#AB47BC',
    bgGradient: 'linear-gradient(135deg, rgba(171,71,188,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'tower-shard',
    key: 'tower-shard',
    nameEs: 'Fragmento de Torre',
    nameEn: 'Tower Shard',
    guildEs: 'Torres Celestiales',
    guildEn: 'Celestial Towers',
    rate: 200,
    icon: 'assets/codex/useables/tower_fragment.png',
    color: '#4FC3F7',
    bgGradient: 'linear-gradient(135deg, rgba(79,195,247,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'coral',
    key: 'coral',
    nameEs: 'Coral',
    nameEn: 'Coral',
    guildEs: 'Gremio del Coral',
    guildEn: 'Coral Guild',
    rate: 20,
    icon: 'assets/codex/items/coral.png',
    color: '#FF7043',
    bgGradient: 'linear-gradient(135deg, rgba(255,112,67,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-sparring',
    key: 'proof-of-sparring',
    nameEs: 'Prueba de Entrenamiento',
    nameEn: 'Proof of Sparring',
    guildEs: 'Hojas de Destreza (PvP)',
    guildEn: 'Blades of Finesse',
    rate: 4,
    icon: 'assets/codex/useables/proof_blades1.png',
    color: '#4DB6AC',
    bgGradient: 'linear-gradient(135deg, rgba(77,182,172,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-felling',
    key: 'proof-of-felling',
    nameEs: 'Prueba de Derribo',
    nameEn: 'Proof of Felling',
    guildEs: 'Gremio de Tala',
    guildEn: 'Felling Guild',
    rate: 20,
    icon: 'assets/codex/useables/proof_monument2.png',
    color: '#8D6E63',
    bgGradient: 'linear-gradient(135deg, rgba(141,110,99,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'deepshard',
    key: 'deepshard',
    nameEs: 'Fragmento Profundo',
    nameEn: 'Deepshard',
    guildEs: 'Mazmorras Profundas',
    guildEn: 'Deep Dungeons',
    rate: 20,
    icon: 'assets/codex/items/dungeon_shard.png',
    color: '#26A69A',
    bgGradient: 'linear-gradient(135deg, rgba(38,166,154,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-trials',
    key: 'proof-of-trials',
    nameEs: 'Prueba de Desafíos',
    nameEn: 'Proof of Trials',
    guildEs: 'Gremio de Desafíos',
    guildEn: 'Trials Guild',
    rate: 2,
    icon: 'assets/codex/useables/proof_trials1.png',
    color: '#FFB74D',
    bgGradient: 'linear-gradient(135deg, rgba(255,183,77,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-effort',
    key: 'proof-of-effort',
    nameEs: 'Prueba de Esfuerzo',
    nameEn: 'Proof of Effort',
    guildEs: 'Gremio de Aventura',
    guildEn: 'Effort Guild',
    rate: 2,
    icon: 'assets/codex/useables/proof_adventure1.png',
    color: '#FFA726',
    bgGradient: 'linear-gradient(135deg, rgba(255,167,38,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  },
  {
    id: 'proof-of-remembrance',
    key: 'proof-of-remembrance',
    nameEs: 'Prueba de Memoria',
    nameEn: 'Proof of Remembrance',
    guildEs: 'Gremio de la Memoria',
    guildEn: 'Memory Guild',
    rate: 2,
    icon: 'assets/codex/useables/proof_memory1.png',
    color: '#D4E157',
    bgGradient: 'linear-gradient(135deg, rgba(212,225,87,0.15) 0%, rgba(35,33,31,0.95) 100%)'
  }
];

const RARITY_MULTIPLIER: Record<string, number> = {
  common: 0,
  común: 0,
  rare: 1,
  raro: 1,
  famed: 2,
  afamado: 2,
  legendary: 3,
  legendario: 3
};

@Injectable({
  providedIn: 'root'
})
export class ProofsService {
  private materialsCache: MaterialOption[] = [];

  constructor() {
    this.initMaterials();
  }

  private initMaterials(): void {
    const rawItems = defaultCodexData as any[];
    const map = new Map<string, MaterialOption>();

    for (const item of rawItems) {
      const isMaterial = item.subcategory === 'material' || item.category === 'materials';
      if (isMaterial) {
        const tier = item.tier || 1;
        const rarity = (item.rarity || 'common').toLowerCase();
        const baseRate = this.calculateBaseRate(tier, rarity);

        const opt: MaterialOption = {
          id: item.id || item.officialUrl || item.nameEn,
          name: item.name,
          nameEs: item.nameEs || item.name,
          nameEn: item.nameEn || item.name,
          tier: tier,
          rarity: rarity,
          icon: item.icon || 'assets/codex/materials/steel.png',
          baseRate: baseRate,
          descriptionEs: item.descriptionEs || item.description,
          descriptionEn: item.descriptionEn || item.description
        };

        const key = opt.nameEn.toLowerCase();
        if (!map.has(key)) {
          map.set(key, opt);
        }
      }
    }

    this.materialsCache = Array.from(map.values()).sort((a, b) => {
      if (b.tier !== a.tier) return b.tier - a.tier;
      return a.nameEn.localeCompare(b.nameEn);
    });
  }

  public getAllMaterials(): MaterialOption[] {
    return this.materialsCache;
  }

  public getCurrencies(): ProofCurrency[] {
    return PROOF_CURRENCIES;
  }

  public calculateBaseRate(tier: number, rarity?: string): number {
    const t = tier || 1;
    const r = (rarity || 'common').toLowerCase();
    const mult = RARITY_MULTIPLIER[r] ?? 0;
    return t * 10 + mult * 5;
  }

  public calculateProofCost(materialCount: number, currencyRate: number, baseRate: number): number {
    if (!materialCount || materialCount <= 0 || !baseRate) return 0;
    return Math.ceil((materialCount * currencyRate * baseRate) / BASE_DENOMINATOR);
  }

  public calculateMaterialCountFromProof(proofCount: number, currencyRate: number, baseRate: number): number {
    if (!proofCount || proofCount <= 0 || !currencyRate || !baseRate) return 0;
    return Math.floor((proofCount * BASE_DENOMINATOR) / (currencyRate * baseRate));
  }

  public calculateAll(materialCount: number, baseRate: number): ProofCalculationResult[] {
    return PROOF_CURRENCIES.map(curr => {
      const cost = this.calculateProofCost(materialCount, curr.rate, baseRate);
      return {
        currency: curr,
        cost: cost,
        costFormatted: cost.toLocaleString('en-US')
      };
    });
  }

  public findMaterial(query: string): MaterialOption | undefined {
    if (!query) return undefined;
    const clean = query.trim().toLowerCase();
    const alias = (clean === 'pure runestone' || clean === 'runita pura') ? 'perfect runestone' : clean;
    return this.materialsCache.find(m =>
      m.id.toLowerCase() === clean ||
      m.id.toLowerCase() === alias ||
      m.nameEn.toLowerCase() === clean ||
      m.nameEn.toLowerCase() === alias ||
      m.nameEs.toLowerCase() === clean ||
      m.nameEs.toLowerCase() === alias ||
      m.name.toLowerCase() === clean ||
      m.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-') === clean
    );
  }
}

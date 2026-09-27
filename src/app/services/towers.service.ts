import { Injectable } from '@angular/core';

export type TowerKind = 'selene' | 'eos' | 'oceanus' | 'themis' | 'prometheus';

export interface TowerMeta {
  kind: TowerKind;
  name: string;
  nameEs: string;
  nameEn: string;
  titanNameEs: string;
  titanNameEn: string;
  elementEs: string;
  elementEn: string;
  color: string;
  accentBg: string;
  iconUrl: string;
  loreEs: string;
  loreEn: string;
}

export interface TowerInfo {
  kind: TowerKind;
  name: string;
  title: string;
  titanName: string;
  element: string;
  color: string;
  accentBg: string;
  iconUrl: string;
  currentFloor: number;
  progressPercent: number;
  isMaxFloor: boolean;
  isNearMax: boolean;
  next50Date: Date | null;
  next50Formatted: string;
  timeUntil50: string;
}

export interface CheckpointProjection {
  time: Date;
  timeFormatted: string;
  dateFormatted: string;
  relativeTime: string;
  isToday: boolean;
  floors: Record<TowerKind, number>;
  has50Floor: boolean;
  towersAt50: TowerKind[];
}

export interface NextGrowthTimer {
  targetTime: Date;
  targetFormatted: string;
  remainingSecondsTotal: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
}

const KINDS: TowerKind[] = ['selene', 'eos', 'oceanus', 'themis', 'prometheus'];
const BASE_FLOORS: number[] = [35, 30, 25, 20, 15];
const BASE_DATE: Date = new Date(Date.UTC(2023, 11, 7, 0)); // Thu, 07 Dec 2023 00:00:00 GMT
const MINUTES_35_DAYS: number = 35 * 24 * 60;

const CHECKPOINTS_UTC: Array<[number, number]> = [
  [1, 0],
  [5, 0],
  [10, 0],
  [15, 0],
  [15, 36],
  [20, 0]
];

export const TOWERS_META: Record<TowerKind, TowerMeta> = {
  selene: {
    kind: 'selene',
    name: 'Selene',
    nameEs: 'Selene',
    nameEn: 'Selene',
    titanNameEs: 'Titán Selene',
    titanNameEn: 'Titan Selene',
    elementEs: 'Luna / Arcano',
    elementEn: 'Moon / Arcana',
    color: '#c084fc',
    accentBg: 'rgba(192, 132, 252, 0.12)',
    iconUrl: 'https://playorna.com/static/img/bosses/titan_selene.png',
    loreEs: 'La Torre de la Diosa de la Luna. Otorga esquirlas celestiales para báculos mágicos y clases de invocador.',
    loreEn: 'Tower of the Moon Goddess. Grants celestial shards for magical staves and summoner classes.'
  },
  eos: {
    kind: 'eos',
    name: 'Eos',
    nameEs: 'Eos',
    nameEn: 'Eos',
    titanNameEs: 'Titán Eos',
    titanNameEn: 'Titan Eos',
    elementEs: 'Luz / Amanecer',
    elementEn: 'Dawn / Holy',
    color: '#fbbf24',
    accentBg: 'rgba(251, 191, 36, 0.12)',
    iconUrl: 'https://playorna.com/static/img/bosses/titan_eos.png',
    loreEs: 'La Torre del Amanecer. Famosa por sus esquirlas para instrumentos celestiales y artefactos sagrados.',
    loreEn: 'Tower of the Dawn. Renowned for celestial instruments and sacred support artifacts.'
  },
  oceanus: {
    kind: 'oceanus',
    name: 'Oceanus',
    nameEs: 'Oceanus',
    nameEn: 'Oceanus',
    titanNameEs: 'Titán Oceanus',
    titanNameEn: 'Titan Oceanus',
    elementEs: 'Agua / Abismo',
    elementEn: 'Water / Abyss',
    color: '#38bdf8',
    accentBg: 'rgba(56, 189, 248, 0.12)',
    iconUrl: 'https://playorna.com/static/img/bosses/titan_oceanus.png',
    loreEs: 'La Torre de las Profundidades Abisales. Brinda esquirlas celestiales para dagas, arcos y equipo de destreza.',
    loreEn: 'Tower of the Abyssal Depths. Provides celestial shards for daggers, bows, and dexterity armor.'
  },
  themis: {
    kind: 'themis',
    name: 'Themis',
    nameEs: 'Themis',
    nameEn: 'Themis',
    titanNameEs: 'Titán Themis',
    titanNameEn: 'Titan Themis',
    elementEs: 'Justicia / Protección',
    elementEn: 'Justice / Ward',
    color: '#eab308',
    accentBg: 'rgba(234, 179, 8, 0.12)',
    iconUrl: 'https://playorna.com/static/img/bosses/titan_themis.png',
    loreEs: 'La Torre de la Justicia Divina. Otorga esquirlas celestiales ideales para escudos de barrera y armas defensivas.',
    loreEn: 'Tower of Divine Justice. Grants celestial shards favored for ward shields and defensive weapons.'
  },
  prometheus: {
    kind: 'prometheus',
    name: 'Prometheus',
    nameEs: 'Prometheus',
    nameEn: 'Prometheus',
    titanNameEs: 'Titán Prometeo',
    titanNameEn: 'Titan Prometheus',
    elementEs: 'Fuego / Guerra',
    elementEn: 'Fire / Combat',
    color: '#f87171',
    accentBg: 'rgba(248, 113, 113, 0.12)',
    iconUrl: 'https://playorna.com/static/img/bosses/titan_prometheus.png',
    loreEs: 'La Torre del Portador del Fuego. Sus esquirlas alimentan alabardas colosales, espadones y armaduras pesadas.',
    loreEn: 'Tower of the Firebringer. Its celestial shards empower massive polearms, greatswords, and heavy armor.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class TowersService {

  /**
   * Calculates the exact tower floors at any given Date.
   * Algorithm based on Knight411 & 67au/OrnaTowerTimer.
   */
  calculateRawFloors(time: Date): Record<TowerKind, number> {
    let minutes = (Math.abs(time.getTime() - BASE_DATE.getTime()) / (1000 * 60)) % MINUTES_35_DAYS;
    if (time.getTime() - BASE_DATE.getTime() < 0) {
      minutes = MINUTES_35_DAYS - minutes;
    }

    const day = Math.floor(minutes / (60 * 24));
    const hour = Math.floor((minutes - day * 60 * 24) / 60);
    const minute = Math.floor(minutes - day * 60 * 24 - hour * 60);

    let point = 0;
    if (hour > 0) point++;
    if (hour > 4) point++;
    if (hour > 9) point++;
    if (hour > 14) point += 2;
    if (hour === 15 && minute <= 35) point--;
    if (hour > 19) point++;

    const result: Partial<Record<TowerKind, number>> = {};
    KINDS.forEach((kind, index) => {
      const towerFloor = ((Math.abs(BASE_FLOORS[index] - 15 + day * 6) + point) % 35) + 15;
      const floor = towerFloor >= 48 || (towerFloor === 15 && !(day % 35 === 0 && hour === 0)) ? 50 : towerFloor;
      result[kind] = floor;
    });

    return result as Record<TowerKind, number>;
  }

  /**
   * Finds the next date when a given tower hits 50 floors.
   */
  findNext50FloorDate(kind: TowerKind, startTime: Date = new Date(), maxDays = 35): Date | null {
    let curr = new Date(startTime);
    for (let d = 0; d < maxDays; d++) {
      for (const [ch, cm] of CHECKPOINTS_UTC) {
        const checkDate = new Date(curr);
        checkDate.setUTCDate(curr.getUTCDate() + d);
        checkDate.setUTCHours(ch, cm, 0, 0);

        if (checkDate <= startTime) continue;

        const floors = this.calculateRawFloors(checkDate);
        if (floors[kind] === 50) {
          return checkDate;
        }
      }
    }
    return null;
  }

  /**
   * Returns current active info for all 5 towers with progress and projections.
   */
  getTowers(lang: 'es' | 'en' = 'es', time: Date = new Date()): TowerInfo[] {
    const rawFloors = this.calculateRawFloors(time);

    return KINDS.map((kind) => {
      const meta = TOWERS_META[kind];
      const floor = rawFloors[kind];
      const progressPercent = Math.min(100, Math.max(0, Math.floor(((floor - 15) / 35) * 100)));
      const isMaxFloor = floor >= 48;
      const isNearMax = floor >= 45;

      const next50Date = isMaxFloor ? null : this.findNext50FloorDate(kind, time);
      let next50Formatted = '';
      let timeUntil50 = '';

      if (isMaxFloor) {
        next50Formatted = lang === 'es' ? '¡Actualmente en 50 Pisos!' : 'Currently at 50 Floors!';
        timeUntil50 = lang === 'es' ? '¡Activa ahora!' : 'Active Now!';
      } else if (next50Date) {
        next50Formatted = next50Date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const diffMs = next50Date.getTime() - time.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        const remHours = diffHours % 24;

        if (diffDays > 0) {
          timeUntil50 = lang === 'es' ? `En ${diffDays}d ${remHours}h` : `In ${diffDays}d ${remHours}h`;
        } else {
          timeUntil50 = lang === 'es' ? `En ${diffHours}h` : `In ${diffHours}h`;
        }
      }

      return {
        kind,
        name: meta.name,
        title: lang === 'es' ? `Torre de ${meta.nameEs}` : `Tower of ${meta.nameEn}`,
        titanName: lang === 'es' ? meta.titanNameEs : meta.titanNameEn,
        element: lang === 'es' ? meta.elementEs : meta.elementEn,
        color: meta.color,
        accentBg: meta.accentBg,
        iconUrl: meta.iconUrl,
        currentFloor: floor,
        progressPercent,
        isMaxFloor,
        isNearMax,
        next50Date,
        next50Formatted,
        timeUntil50
      };
    });
  }

  /**
   * Calculates the countdown to the next growth checkpoint.
   */
  getNextGrowthCountdown(time: Date = new Date(), lang: 'es' | 'en' = 'es'): NextGrowthTimer {
    // Checkpoints in UTC: [1:00, 5:00, 10:00, 15:00, 15:36, 20:00]
    const candidates: Date[] = [];
    const checkDays = [0, 1];

    for (const d of checkDays) {
      for (const [ch, cm] of CHECKPOINTS_UTC) {
        const candidate = new Date(time);
        candidate.setUTCDate(time.getUTCDate() + d);
        candidate.setUTCHours(ch, cm, 0, 0);
        if (candidate.getTime() > time.getTime()) {
          candidates.push(candidate);
        }
      }
    }

    candidates.sort((a, b) => a.getTime() - b.getTime());
    const nextTarget = candidates[0] || new Date(time.getTime() + 3600000);

    const remainingMs = Math.max(0, nextTarget.getTime() - time.getTime());
    const remainingSecondsTotal = Math.floor(remainingMs / 1000);
    const hours = Math.floor(remainingSecondsTotal / 3600);
    const minutes = Math.floor((remainingSecondsTotal % 3600) / 60);
    const seconds = remainingSecondsTotal % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedCountdown = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    const targetFormatted = nextTarget.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      targetTime: nextTarget,
      targetFormatted,
      remainingSecondsTotal,
      hours,
      minutes,
      seconds,
      formattedCountdown
    };
  }

  /**
   * Returns future checkpoints with projected floors.
   */
  getProjections(time: Date = new Date(), count = 42, lang: 'es' | 'en' = 'es'): CheckpointProjection[] {
    const list: CheckpointProjection[] = [];
    const todayDateStr = time.toLocaleDateString();

    const maxDays = Math.ceil(count / 6) + 1;
    const allCheckpoints: Date[] = [];

    for (let d = 0; d < maxDays; d++) {
      for (const [ch, cm] of CHECKPOINTS_UTC) {
        const cd = new Date(time);
        cd.setUTCDate(time.getUTCDate() + d);
        cd.setUTCHours(ch, cm, 0, 0);
        if (cd.getTime() > time.getTime()) {
          allCheckpoints.push(cd);
        }
      }
    }

    allCheckpoints.sort((a, b) => a.getTime() - b.getTime());
    const sliced = allCheckpoints.slice(0, count);

    for (const cpTime of sliced) {
      const floors = this.calculateRawFloors(cpTime);
      const towersAt50: TowerKind[] = [];

      KINDS.forEach((k) => {
        if (floors[k] >= 48) {
          towersAt50.push(k);
        }
      });

      const diffMs = cpTime.getTime() - time.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const remH = diffHours % 24;

      let relativeTime = '';
      if (diffDays > 0) {
        relativeTime = lang === 'es' ? `+${diffDays}d ${remH}h` : `+${diffDays}d ${remH}h`;
      } else {
        relativeTime = lang === 'es' ? `+${diffHours}h` : `+${diffHours}h`;
      }

      const timeFormatted = cpTime.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const dateFormatted = cpTime.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      list.push({
        time: cpTime,
        timeFormatted,
        dateFormatted,
        relativeTime,
        isToday: cpTime.toLocaleDateString() === todayDateStr,
        floors,
        has50Floor: towersAt50.length > 0,
        towersAt50
      });
    }

    return list;
  }
}

export interface GuildStock {
  guildName: string;
  materials: string[];
}

export interface DayForecast {
  dateTitle: string;
  guilds: GuildStock[];
}

export interface MaterialGuildAppearance {
  guildName: string;
  nextDate: string;
  daysUntil: number | null;
}

export interface MaterialSearchResult {
  materialName: string;
  guildAppearances: MaterialGuildAppearance[];
}

export interface DayMaterials {
  date: Date;
  dateString: string;
  materials: string[];
  guild: string;
  done: boolean;
}

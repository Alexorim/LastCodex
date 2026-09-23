/**
 * Maps Orna guild names to their corresponding icon asset paths in assets/guilds/
 */
export function getGuildIcon(rawName: string): string {
  if (!rawName) return '';

  const lower = rawName.toLowerCase().trim();

  if (lower.includes('anguish')) return 'assets/guilds/proof_anguish.png';
  if (lower.includes('agony')) return 'assets/guilds/proof_agony.png';
  if (lower.includes('despair')) return 'assets/guilds/proof_despair.png';
  if (lower.includes('melancholy')) return 'assets/guilds/proof_melancholy.png';
  if (lower.includes('torment')) return 'assets/guilds/proof_torment.png';
  if (lower.includes('coral')) return 'assets/guilds/coral.png';
  if (lower.includes('deepshard') || lower.includes('shard') || lower.includes('dungeon')) return 'assets/guilds/dungeon_shard.png';
  if (lower.includes('monument')) return 'assets/guilds/proof_monument1.png';
  if (lower.includes('remembrance') || lower.includes('memory')) return 'assets/guilds/proof_memory1.png';
  if (lower.includes('sparring') || lower.includes('blade')) return 'assets/guilds/proof_blades1.png';
  if (lower.includes('trial')) return 'assets/guilds/proof_trials1.png';
  if (lower.includes('tower') || lower.includes('titan') || lower.includes('olympia')) return 'assets/guilds/tower_fragment.png';

  return '';
}

export function getGuildColor(rawName: string): string {
  if (!rawName) return '#78909c';
  const lower = rawName.toLowerCase();
  if (lower.includes('anguish')) return '#ff5252';
  if (lower.includes('agony')) return '#ff7043';
  if (lower.includes('despair')) return '#ab47bc';
  if (lower.includes('melancholy')) return '#5c6bc0';
  if (lower.includes('torment')) return '#26a69a';
  if (lower.includes('coral')) return '#ec407a';
  if (lower.includes('deepshard') || lower.includes('shard')) return '#42a5f5';
  if (lower.includes('remembrance') || lower.includes('memory')) return '#26c6da';
  if (lower.includes('sparring') || lower.includes('blade')) return '#66bb6a';
  if (lower.includes('trial')) return '#ffa726';
  if (lower.includes('tower') || lower.includes('titan')) return '#8d6e63';
  if (lower.includes('monument')) return '#7e57c2';
  return '#78909c';
}


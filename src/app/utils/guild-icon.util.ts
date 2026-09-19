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

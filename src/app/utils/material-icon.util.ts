/**
 * Maps Orna material names to local pixel-art asset paths
 */
export function getMaterialIcon(rawName: string): string {
  if (!rawName) return '';

  let name = rawName.toLowerCase().trim();

  // Remove prefixes / suffixes like '(Ort.)', ': Ort.', 'x5', etc.
  name = name.replace(/\(.*?\)/g, '').replace(/:.*$/g, '').trim();

  // Strip apostrophes/quotes (e.g. Wolf's Blood -> wolfs blood)
  name = name.replace(/['’"]/g, '');

  // Normalize spaces, hyphens and special characters
  let key = name.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  // Alias maps for common discrepancies
  const aliases: Record<string, string> = {
    'darkstone': 'dark_stone',
    'earthstone': 'earth_stone',
    'firestone': 'fire_stone',
    'lightningstone': 'lightning_stone',
    'waterstone': 'water_stone',
    'pure_dark_stone': 'pure_darkstone',
    'pure_light_stone': 'pure_lightstone',
    'pure_water_stone': 'pure_waterstone',
    'pure_drac': 'pure_draconite',
    'drac': 'draconite',
    'red_drac': 'red_draconite',
    'wolf_s_blood': 'wolf_blood',
    'wolfs_blood': 'wolf_blood',
    'wolfsblood': 'wolf_blood',
    'wolf_blood': 'wolf_blood',
    'eyestone': 'eye',
    'demonic_ore': 'demonstone',
    'deepshard': 'deepshards',
    'deepshards': 'deepshards',
    'broken_statues': 'broken_statue',
    'undead_bones': 'undead_bone',
    'bones': 'bone',
    'stones': 'stone',
    'woods': 'wood'
  };

  if (aliases[key]) {
    key = aliases[key];
  }

  return `assets/materials/${key}.png`;
}

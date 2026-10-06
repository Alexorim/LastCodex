const fs = require('fs');
const path = require('path');

// Colors per category
const CATEGORY_COLORS = {
  'Root': '#a855f7',
  '01 - General': '#3b82f6',
  '02 - Modulos': '#10b981',
  '03 - Servicios': '#06b6d4',
  '04 - Paginas': '#f59e0b',
  '05 - Modelos': '#ec4899',
  '06 - Plataformas': '#8b5cf6',
  '07 - Scripts': '#6366f1',
  '08 - Utilidades': '#14b8a6',
  '09 - Actualizaciones': '#f97316'
};

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { meta: {}, body: content };
  const yaml = match[1];
  const body = content.slice(match[0].length);
  const meta = {};
  yaml.split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      meta[key] = val;
    }
  });
  return { meta, body };
}

function extractWikilinks(text) {
  const links = [];
  const regex = /\[\[(.*?)\]\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    let target = match[1];
    if (target.includes('|')) {
      target = target.split('|')[0];
    }
    if (target.includes('#')) {
      target = target.split('#')[0];
    }
    target = target.trim();
    if (target && !links.includes(target)) {
      links.push(target);
    }
  }
  return links;
}

function buildVaultGraph() {
  const vaultDir = path.resolve(__dirname, '../../lastcodex-obsidian');
  const fallbackVaultDir = path.resolve(__dirname, '../obsidian/codex-vault');
  const targetDir = fs.existsSync(vaultDir) ? vaultDir : fallbackVaultDir;

  if (!fs.existsSync(targetDir)) {
    console.error('Vault directory not found:', targetDir);
    process.exit(1);
  }

  console.log('Reading Obsidian vault from:', targetDir);

  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  function scanDir(dir, currentCategory = 'Root') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith('.') || item.name.startsWith('_')) continue;
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanDir(fullPath, item.name);
      } else if (item.isFile() && item.name.endsWith('.md')) {
        const rawContent = fs.readFileSync(fullPath, 'utf-8');
        const { meta, body } = parseYamlFrontmatter(rawContent);
        const id = path.basename(item.name, '.md');
        const title = meta.title || id;
        const color = CATEGORY_COLORS[currentCategory] || '#a855f7';
        const wikilinks = extractWikilinks(rawContent);
        const relPath = path.relative(targetDir, fullPath).replace(/\\/g, '/');

        const node = {
          id,
          title,
          category: currentCategory,
          color,
          path: relPath,
          links: wikilinks,
          content: rawContent
        };
        nodes.push(node);
        nodeMap.set(id.toLowerCase(), id);
      }
    }
  }

  scanDir(targetDir);

  // Link resolution
  const linkSet = new Set();
  for (const node of nodes) {
    for (const targetName of node.links) {
      const resolvedTarget = nodeMap.get(targetName.toLowerCase());
      if (resolvedTarget && resolvedTarget !== node.id) {
        const linkKey = `${node.id}->${resolvedTarget}`;
        if (!linkSet.has(linkKey)) {
          linkSet.add(linkKey);
          links.push({
            source: node.id,
            target: resolvedTarget
          });
        }
      }
    }
  }

  const result = {
    generatedAt: new Date().toISOString(),
    totalNodes: nodes.length,
    totalLinks: links.length,
    nodes,
    links
  };

  // Output paths
  const appAssetPath = path.resolve(__dirname, '../src/assets/vault-graph.json');
  fs.writeFileSync(appAssetPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Generated ${nodes.length} nodes and ${links.length} links at:`, appAssetPath);

  // Also write to vault roots if existing
  const vaultGraphPath = path.join(targetDir, 'vault-graph.json');
  fs.writeFileSync(vaultGraphPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log('Saved vault-graph.json in vault root:', vaultGraphPath);
}

buildVaultGraph();

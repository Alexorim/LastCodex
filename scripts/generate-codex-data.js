const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, '..', 'resources');
const dataFile = path.join(__dirname, '..', 'src', 'app', 'data', 'codex-items.json');

const entries = [];

function toTitleCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const typeEsMap = {
    'armors': 'Armadura',
    'weapons': 'Arma',
    'adornment': 'Adorno',
    'currency': 'Moneda',
    'field': 'Campo',
    'fish': 'Pez',
    'material': 'Material',
    'useable': 'Consumible'
};

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath, callback);
        } else if (file.endsWith('.png')) {
            callback(fullPath, file);
        }
    }
}

// Process items
const itemsDir = path.join(resourcesDir, 'items');
if (fs.existsSync(itemsDir)) {
    const tierDirs = fs.readdirSync(itemsDir);
    for (const tierDir of tierDirs) {
        const match = tierDir.match(/★\s*(\d+)/);
        if (match) {
            const tier = parseInt(match[1], 10);
            const tierPath = path.join(itemsDir, tierDir);
            if (fs.statSync(tierPath).isDirectory()) {
                const subcats = fs.readdirSync(tierPath);
                for (const subcat of subcats) {
                    const subcatPath = path.join(tierPath, subcat);
                    if (fs.statSync(subcatPath).isDirectory()) {
                        walkDir(subcatPath, (filePath, fileName) => {
                            const nameWithoutExt = path.basename(fileName, '.png');
                            const id = `t${tier}-${subcat}-${nameWithoutExt.replace(/\s+/g, '-')}`.toLowerCase();
                            const name = toTitleCase(nameWithoutExt);
                            const type = subcat.charAt(0).toUpperCase() + subcat.slice(1);
                            const typeEs = typeEsMap[subcat] || type;
                            const typeEn = type;
                            
                            entries.push({
                                id,
                                name,
                                category: 'items',
                                subcategory: subcat,
                                tier,
                                icon: `assets/codex/items/${tierDir}/${subcat}/${fileName}`,
                                type,
                                descriptionEs: `Tier ${tier} — ${typeEs}`,
                                descriptionEn: `Tier ${tier} — ${typeEn}`,
                                officialUrl: "https://playorna.com/codex/"
                            });
                        });
                    }
                }
            }
        }
    }
}

// Process others
const others = ['bosses', 'monsters', 'buildings', 'dungeons'];
for (const category of others) {
    const catDir = path.join(resourcesDir, category);
    if (fs.existsSync(catDir)) {
        walkDir(catDir, (filePath, fileName) => {
            const relPath = path.relative(catDir, filePath).replace(/\\/g, '/');
            const nameWithoutExt = path.basename(fileName, '.png');
            const id = `t0-${category}-${nameWithoutExt.replace(/\s+/g, '-')}`.toLowerCase();
            const name = toTitleCase(nameWithoutExt);
            
            entries.push({
                id,
                name,
                category,
                subcategory: '',
                tier: 0,
                icon: `assets/codex/${category}/${relPath}`,
                type: category.charAt(0).toUpperCase() + category.slice(1),
                descriptionEs: '',
                descriptionEn: '',
                officialUrl: "https://playorna.com/codex/"
            });
        });
    }
}

entries.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name);
});

fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.writeFileSync(dataFile, JSON.stringify(entries, null, 2), 'utf8');

console.log(`Generated ${entries.length} entries in ${dataFile}`);

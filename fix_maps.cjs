const fs = require('fs');
const content = fs.readFileSync('src/data/maps.js', 'utf8');
const lines = content.split(/\r?\n/);
let currentMap = 'unknown';
let mapRows = {};

for (let i = 0; i < lines.length; i++) {
  const mapMatch = lines[i].match(/^\s+(\w+):\s*\{/);
  if (mapMatch) currentMap = mapMatch[1];
  const tileMatch = lines[i].match(/'([#.GTKDCPWARLSXNEH]+)'/);
  if (tileMatch && tileMatch[1].length > 10) {
    if (!mapRows[currentMap]) mapRows[currentMap] = [];
    mapRows[currentMap].push({ line: i+1, len: tileMatch[1].length });
  }
}

let allOk = true;
for (const [map, rows] of Object.entries(mapRows)) {
  const lengths = [...new Set(rows.map(r => r.len))];
  if (lengths.length > 1) {
    console.log('INCONSISTENT: ' + map + ' lengths: ' + lengths.join(', '));
    allOk = false;
  } else {
    console.log('OK: ' + map + ' (' + rows.length + ' rows, width=' + lengths[0] + ')');
  }
}
if (allOk) console.log('\nAll maps consistent!');

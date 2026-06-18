const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const resourceRoot = path.join(root, 'resource');
const outDir = path.join(root, 'client', 'public', 'resource');

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));
}

const majors = listImages(path.join(resourceRoot, 'arcani-maggiori'));
const minors = listImages(path.join(resourceRoot, 'arcani-minori'));

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const manifest = { majors, minors };
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Wrote manifest.json to', path.join(outDir, 'manifest.json'));

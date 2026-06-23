const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const resourceDir = path.join(root, 'client', 'public', 'resource');

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));
}

const majors = listImages(path.join(resourceDir, 'arcani-maggiori'));
const minors = listImages(path.join(resourceDir, 'arcani-minori'));

if (!fs.existsSync(resourceDir)) fs.mkdirSync(resourceDir, { recursive: true });

const manifest = { majors, minors };
fs.writeFileSync(path.join(resourceDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Wrote manifest.json to', path.join(resourceDir, 'manifest.json'));

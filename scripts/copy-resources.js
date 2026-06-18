const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const resourceRoot = path.join(root, 'resource');
const outRoot = path.join(root, 'client', 'public', 'resource');

function copyDir(src, dest){
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src);
  for (const it of items){
    const s = path.join(src, it);
    const d = path.join(dest, it);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else if (stat.isFile()) fs.copyFileSync(s, d);
  }
}

copyDir(path.join(resourceRoot, 'arcani-maggiori'), path.join(outRoot, 'arcani-maggiori'));
copyDir(path.join(resourceRoot, 'arcani-minori'), path.join(outRoot, 'arcani-minori'));

// Also copy top-level resource files (e.g. background image)
if (fs.existsSync(resourceRoot)) {
  const items = fs.readdirSync(resourceRoot);
  for (const it of items) {
    const s = path.join(resourceRoot, it);
    const d = path.join(outRoot, it);
    const stat = fs.statSync(s);
    if (stat.isFile() && /\.(jpe?g|png|webp|gif)$/i.test(it)) {
      if (!fs.existsSync(outRoot)) fs.mkdirSync(outRoot, { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

console.log('Resources copied to', outRoot);


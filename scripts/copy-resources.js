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
console.log('Resources copied to', outRoot);

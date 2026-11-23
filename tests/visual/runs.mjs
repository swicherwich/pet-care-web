// Допоміжний скрипт: порівнює вертикальні «смуги» вмісту в еталоні й у знімку (для підгонки відступів).
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [name, x0 = '0', x1 = '393'] = process.argv.slice(2);
const load = (p) => PNG.sync.read(readFileSync(p));
const runs = (img) => {
  const bg = [img.data[0], img.data[1], img.data[2]];
  const out = [];
  let start = -1;
  for (let y = 0; y < img.height; y++) {
    let hit = false;
    for (let x = +x0; x < +x1 && !hit; x++) {
      const i = (y * img.width + x) * 4;
      if (Math.abs(img.data[i] - bg[0]) + Math.abs(img.data[i + 1] - bg[1]) + Math.abs(img.data[i + 2] - bg[2]) > 24) hit = true;
    }
    if (hit && start < 0) start = y;
    if (!hit && start >= 0) {
      out.push([start, y - 1]);
      start = -1;
    }
  }
  if (start >= 0) out.push([start, img.height - 1]);
  return out;
};
const a = runs(load(`design/ref/${name}.png`));
const b = runs(load(`tests/visual/out/${name}.png`));
const n = Math.max(a.length, b.length);
for (let i = 0; i < n; i++) {
  const ra = a[i] ? `${a[i][0]}-${a[i][1]}` : '-';
  const rb = b[i] ? `${b[i][0]}-${b[i][1]}` : '-';
  console.log(String(i).padStart(2), ra.padEnd(12), rb.padEnd(12), a[i] && b[i] && (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) ? '<<' : '');
}

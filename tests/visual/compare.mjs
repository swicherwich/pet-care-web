// Піксельне порівняння сторінок застосунку з еталонами Figma (design/ref/*.png).
// Запуск: npm run build && npm run test:visual
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const OUT = 'tests/visual/out';
mkdirSync(OUT, { recursive: true });

const screens = [
  { name: 'today', path: '#/' },
  { name: 'profile', path: '#/pets' },
  { name: 'tips', path: '#/tips' },
  { name: 'more', path: '#/more' },
  { name: 'notifications', path: '#/notifications' },
  { name: 'sharing-a', path: '#/sharing' },
  { name: 'sharing-b', path: '#/sharing?state=invited' },
  { name: 'export-a', path: '#/export' },
  { name: 'export-b', path: '#/export?state=ready' },
];

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {}
  await wait(200);
}

const browser = await chromium.launch();
const rows = [];
try {
  for (const s of screens) {
    const ref = PNG.sync.read(readFileSync(`design/ref/${s.name}.png`));
    const ctx = await browser.newContext({ viewport: { width: ref.width, height: ref.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/?frame=device${s.path}`);
    await page.evaluate(() => document.fonts.ready);
    await wait(400);
    const shot = PNG.sync.read(await page.screenshot({ fullPage: false }));
    writeFileSync(`${OUT}/${s.name}.png`, PNG.sync.write(shot));
    const { width, height } = ref;
    const diff = new PNG({ width, height });
    const same = shot.width === width && shot.height === height;
    const n = same ? pixelmatch(ref.data, shot.data, diff.data, width, height, { threshold: 0.1, includeAA: false }) : width * height;
    writeFileSync(`${OUT}/${s.name}.diff.png`, PNG.sync.write(diff));
    const pct = (n / (width * height)) * 100;
    rows.push({ screen: s.name, size: `${width}x${height}`, diffPixels: n, diffPercent: +pct.toFixed(2), match: +(100 - pct).toFixed(2) });
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.table(rows);
writeFileSync(`${OUT}/summary.json`, JSON.stringify(rows, null, 2));

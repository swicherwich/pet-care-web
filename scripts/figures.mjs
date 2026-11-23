// Рисунки для звіту: порівняння з макетом, анімації, стани компонентів, адаптивність.
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '/home/claude/work/figs';
mkdirSync(OUT, { recursive: true });
const PORT = 4180;
const BASE = `http://localhost:${PORT}`;
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(3000);

const names = ['today', 'profile', 'tips', 'more', 'notifications', 'sharing-a', 'sharing-b', 'export-a', 'export-b'];
const label = async (text, w) =>
  sharp({
    create: { width: w, height: 36, channels: 3, background: '#ffffff' },
  })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="36"><text x="${w / 2}" y="24" font-family="Inter,Arial" font-size="20" text-anchor="middle" fill="#14201b">${text}</text></svg>`), left: 0, top: 0 }])
    .png()
    .toBuffer();

// 1. Порівняння: макет | реалізація | різниця
for (const n of names) {
  const ref = await sharp(`design/ref/${n}.png`).toBuffer();
  const impl = await sharp(`tests/visual/out/${n}.png`).toBuffer();
  const diff = await sharp(`tests/visual/out/${n}.diff.png`).toBuffer();
  const { width: w, height: h } = await sharp(ref).metadata();
  const gap = 24;
  const heads = await Promise.all([label('Макет Figma', w), label('Реалізація', w), label('Різниця', w)]);
  const W = w * 3 + gap * 2;
  await sharp({ create: { width: W, height: h + 36, channels: 3, background: '#ffffff' } })
    .composite([
      { input: heads[0], left: 0, top: 0 }, { input: heads[1], left: w + gap, top: 0 }, { input: heads[2], left: (w + gap) * 2, top: 0 },
      { input: ref, left: 0, top: 36 }, { input: impl, left: w + gap, top: 36 }, { input: diff, left: (w + gap) * 2, top: 36 },
    ])
    .png()
    .toFile(`${OUT}/cmp-${n}.png`);
}

const browser = await chromium.launch();

// 2. Анімації: S1 (скелетон і каскад)
{
  const page = await (await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1 })).newPage();
  await page.goto(`${BASE}/#/`);
  const frames = [];
  await wait(300);
  frames.push(await page.screenshot());
  await page.locator('.skeleton').first().waitFor({ state: 'detached', timeout: 4000 });
  // середину каскаду фіксуємо точно: ставимо анімації на паузу в момент 160 мс
  await page.evaluate(() => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 160; }));
  frames.push(await page.screenshot());
  await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
  await wait(100);
  frames.push(await page.screenshot());
  const w = 393, gap = 16;
  const heads = await Promise.all(['0,3 с: скелетон', '+160 мс: каскад у русі', 'Усі блоки на місці'].map((t) => label(t, w)));
  await sharp({ create: { width: w * 3 + gap * 2, height: 852 + 36, channels: 3, background: '#ffffff' } })
    .composite(frames.flatMap((f, i) => [{ input: heads[i], left: i * (w + gap), top: 0 }, { input: f, left: i * (w + gap), top: 36 }]))
    .png().toFile(`${OUT}/anim-s1.png`);
  await page.context().close();
}

// 3. Анімації: нова подія (S6, S9, S2, S7)
{
  const page = await (await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1 })).newPage();
  await page.goto(`${BASE}/#/`);
  await page.locator('.skeleton').first().waitFor({ state: 'detached', timeout: 4000 });
  await wait(700);
  await page.getByRole('button', { name: 'Додати подію' }).click();
  await wait(500);
  const f1 = await page.screenshot();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Зберегти' }).click();
  await wait(500);
  const f2 = await page.screenshot();
  await dialog.getByLabel('Назва події').fill('Щеплення від сказу');
  await dialog.getByRole('button', { name: 'Зберегти' }).click();
  await wait(400);
  const f3 = await page.screenshot();
  await page.locator('.toast').waitFor({ state: 'visible' });
  await wait(600);
  await page.evaluate(() => document.querySelector('.event-row[data-new="true"]')?.scrollIntoView({ block: 'center' }));
  await wait(200);
  const f4 = await page.screenshot();
  const w = 393, gap = 16;
  const heads = await Promise.all(['S6: панель відкрита', 'S9: помилка в полі', 'S2: «Збереження…»', 'S7: новий рядок і тост'].map((t) => label(t, w)));
  await sharp({ create: { width: w * 4 + gap * 3, height: 852 + 36, channels: 3, background: '#ffffff' } })
    .composite([f1, f2, f3, f4].flatMap((f, i) => [{ input: heads[i], left: i * (w + gap), top: 0 }, { input: f, left: i * (w + gap), top: 36 }]))
    .png().toFile(`${OUT}/anim-form.png`);
  await page.context().close();
}

// 4. Стани компонентів: звичайний, hover, фокус, натиснуто
{
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?frame=device#/`);
  await page.getByRole('heading', { level: 1 }).first().waitFor();
  await wait(300);
  const crop = async (loc, pad = 10) => {
    const b = await loc.boundingBox();
    return page.screenshot({ clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(393, b.width + pad * 2), height: b.height + pad * 2 } });
  };
  const rows = [];
  const targets = [
    { name: 'Кнопка (основна)', loc: page.getByRole('button', { name: 'Треба купити' }) },
    { name: 'Кнопка (додаткова)', loc: page.getByRole('button', { name: 'Вже є' }) },
    { name: 'Чип', loc: page.getByRole('radio', { name: 'Мурка' }) },
    { name: 'Рядок події', loc: page.locator('.event-row').nth(3) },
  ];
  for (const t of targets) {
    await t.loc.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.mouse.move(2, 2);
    await page.evaluate(() => document.activeElement?.blur());
    const normal = await crop(t.loc);
    await t.loc.hover();
    await wait(250);
    const hover = await crop(t.loc);
    await page.mouse.move(2, 2);
    await t.loc.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await wait(200);
    const focus = await crop(t.loc);
    await page.evaluate(() => document.activeElement?.blur());
    const b = await t.loc.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await wait(250);
    const pressed = await crop(t.loc);
    await page.mouse.move(2, 2);
    await page.mouse.up();
    rows.push({ name: t.name, shots: [normal, hover, focus, pressed] });
  }
  // склеюємо в таблицю
  const metas = await Promise.all(rows.flatMap((r) => r.shots).map((s) => sharp(s).metadata()));
  const colW = Math.max(...metas.map((m) => m.width)) + 20;
  const rowH = rows.map((r, i) => Math.max(...metas.slice(i * 4, i * 4 + 4).map((m) => m.height)) + 20);
  const labelW = 0;
  const headH = 44;
  const heads = ['Звичайний', 'Hover', 'Focus (клавіатура)', 'Pressed'];
  const W = colW * 4 + labelW;
  const H = headH + rowH.reduce((a, b) => a + b, 0);
  const comps = [];
  const svg = (t, w) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${headH}"><text x="${w / 2}" y="28" font-family="Inter,Arial" font-size="24" text-anchor="middle" fill="#14201b">${t}</text></svg>`);
  heads.forEach((h, i) => comps.push({ input: svg(h, colW), left: i * colW, top: 0 }));
  let y = headH;
  rows.forEach((r, ri) => {
    r.shots.forEach((s, ci) => comps.push({ input: s, left: ci * colW + 10, top: y + 10 }));
    y += rowH[ri];
  });
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } }).composite(comps).png().toFile(`${OUT}/states.png`);
  await ctx.close();
}

// 5. Адаптивність: Today на 4 ширинах
{
  const widths = [320, 393, 820, 1440];
  const shots = [];
  for (const w of widths) {
    const h = w >= 820 ? 900 : 760;
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    await page.goto(`${BASE}/#/`);
    await page.locator('.skeleton').first().waitFor({ state: 'detached', timeout: 4000 }).catch(() => undefined);
    await wait(900);
    shots.push({ w, h, buf: await page.screenshot() });
    await page.context().close();
  }
  const H = 700;
  const scaled = await Promise.all(shots.map(async (s) => {
    const sc = H / s.h;
    const width = Math.round(s.w * sc);
    return { w: s.w, width, buf: await sharp(s.buf).resize({ width, height: H }).png().toBuffer() };
  }));
  const gap = 20;
  const total = scaled.reduce((a, s) => a + s.width, 0) + gap * 3;
  let x = 0;
  const comps = [];
  for (const s of scaled) {
    comps.push({ input: await label(`${s.w} px`, s.width), left: x, top: 0 }, { input: s.buf, left: x, top: 36 });
    x += s.width + gap;
  }
  await sharp({ create: { width: total, height: H + 36, channels: 3, background: '#ffffff' } }).composite(comps).png().toFile(`${OUT}/responsive.png`);
}

await browser.close();
server.kill();
console.log('ok');

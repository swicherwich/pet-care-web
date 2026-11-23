// Наскрізні перевірки: сценарії, клавіатура, адаптивність, доступність (axe), три рушії браузерів.
// Запуск: npm run build && npm run test:e2e
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const PORT = 4174;
const BASE = `http://localhost:${PORT}`;
const OUT = 'tests/e2e/out';
mkdirSync(`${OUT}/shots`, { recursive: true });
const only = process.argv[2]; // необов'язково: chromium | firefox | webkit

const routes = [
  ['today', '#/'],
  ['schedule', '#/schedule'],
  ['profile', '#/pets'],
  ['more', '#/more'],
  ['tips', '#/tips'],
  ['notifications', '#/notifications'],
  ['sharing', '#/sharing'],
  ['sharing-invited', '#/sharing?state=invited'],
  ['export', '#/export'],
  ['export-ready', '#/export?state=ready'],
];

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {}
  await wait(200);
}

const results = [];
const record = (browser, group, name, ok, detail = '') => {
  results.push({ browser, group, name, ok, detail });
  if (!ok) console.log(`  FAIL [${browser}] ${group}: ${name} ${detail}`);
};

async function scenarios(browserName, browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, locale: 'uk-UA' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const check = (name, ok, detail) => record(browserName, 'Сценарії', name, !!ok, detail);

  // S1: скелетон, потім каскад
  await page.goto(`${BASE}/#/`);
  await wait(250);
  check('S1: скелетон видно одразу після відкриття', (await page.locator('.skeleton').count()) > 0);
  await page.locator('.skeleton').first().waitFor({ state: 'detached', timeout: 4000 });
  await wait(100);
  check(
    'S1: після скелетона з’являються блоки з каскадом',
    (await page.locator('.reveal').count()) >= 5,
    `reveal=${await page.locator('.reveal').count()}`,
  );
  await wait(600);

  // S8: відмітка події та лічильник
  const box = page.getByRole('checkbox', { name: 'Ліки від алергії' });
  await box.click();
  check('S8: подія позначається виконаною', (await box.getAttribute('aria-checked')) === 'true');
  check('S8: заголовок переходить у «Виконано · 2 з 3»', await page.getByRole('heading', { name: 'Виконано · 2 з 3' }).isVisible());
  check('P6: тост з кнопкою «Скасувати»', await page.locator('.toast').getByRole('button', { name: 'Скасувати' }).isVisible());
  await page.locator('.toast').getByRole('button', { name: 'Скасувати' }).click();
  check('P6: скасування повертає стан', (await box.getAttribute('aria-checked')) === 'false');

  // Фільтр улюбленців
  await page.getByRole('radio', { name: 'Барсик' }).click();
  check(
    'Фільтр: лишаються події Барсика',
    (await page.getByRole('checkbox').count()) === 2,
    `checkbox=${await page.getByRole('checkbox').count()}`,
  );
  await page.getByRole('radio', { name: 'Усі' }).click();

  // S6, S9, S2, S7: нова подія
  await page.getByRole('button', { name: 'Додати подію' }).click();
  const dialog = page.getByRole('dialog', { name: 'Нова подія' });
  await dialog.waitFor({ state: 'visible' });
  check('S6: панель нової події відкривається як модальне вікно', await dialog.isVisible());
  check('S6: фокус потрапляє в поле назви', await page.evaluate(() => document.activeElement?.getAttribute('name') === 'title'));
  await dialog.getByRole('button', { name: 'Зберегти' }).click();
  check('S9: порожня назва дає aria-invalid', (await dialog.getByLabel('Назва події').getAttribute('aria-invalid')) === 'true');
  check('S9: текст помилки лишається на екрані', await dialog.getByText('Вкажіть назву події').isVisible());
  await wait(600);
  check('S9: помилка не зникає сама', await dialog.getByText('Вкажіть назву події').isVisible());
  await dialog.getByLabel('Назва події').fill('Щеплення від сказу');
  await dialog.getByRole('button', { name: 'Зберегти' }).click();
  await wait(150);
  check('S2: проміжний стан «Збереження…»', await dialog.getByRole('button', { name: 'Збереження…' }).isVisible());
  await page.locator('.toast').getByText('Подію збережено').waitFor({ state: 'visible', timeout: 3000 });
  check('S2: тост «Подію збережено»', true);
  await wait(500);
  check('S7: новий рядок з’являється в списку', await page.getByRole('checkbox', { name: 'Щеплення від сказу' }).isVisible());
  await wait(1700);
  check('Тост з результатом лишається до закриття (WCAG 2.2.1)', await page.locator('.toast').isVisible());
  await page.locator('.toast').getByRole('button', { name: 'Закрити' }).click();
  await wait(400);
  check('Тост закривається кнопкою', (await page.locator('.toast').count()) === 0);

  // Escape закриває панель
  await page.getByRole('button', { name: 'Додати подію' }).click();
  await dialog.waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await wait(500);
  check(
    'Escape закриває панель, фокус повертається на кнопку «+»',
    !(await dialog.isVisible()) && (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Додати подію',
  );

  // Навігація
  await page.getByRole('link', { name: 'Сповіщення' }).first().click();
  await page.getByRole('heading', { name: 'Сповіщення', level: 1 }).waitFor();
  check('Навігація: дзвоник відкриває «Сповіщення»', true);
  check(
    'Навігація: у «Сповіщення» активна вкладка «Ще»',
    (await page.getByRole('navigation', { name: 'Основна навігація' }).getByRole('link', { name: 'Ще' }).getAttribute('aria-current')) !==
      null,
  );
  const sw = page.getByRole('switch', { name: 'Підсумок дня на пошту' });
  await sw.click();
  check('Перемикач «Підсумок на пошту» вмикається', (await sw.getAttribute('aria-checked')) === 'true');
  check('«Назад» названо за екраном-джерелом («Сьогодні»)', await page.getByRole('button', { name: 'Назад: Сьогодні' }).isVisible());
  await page.getByRole('button', { name: 'Назад: Сьогодні' }).click();
  await page.getByRole('heading', { name: 'Сьогодні', level: 1 }).waitFor();
  check('Кнопка «Назад» повертає на «Сьогодні»', true);
  await page.getByRole('navigation', { name: 'Основна навігація' }).getByRole('link', { name: 'Ще' }).click();
  await page.getByRole('heading', { name: 'Ще', level: 1, exact: true }).waitFor();
  await page.getByRole('link', { name: /Спільний доступ/ }).click();
  await page.getByRole('heading', { name: 'Спільний доступ', level: 1 }).waitFor();
  await page.getByRole('button', { name: 'Запросити учасника' }).click();
  check('Спільний доступ: банер «Запрошення надіслано»', await page.locator('.banner').getByText('Запрошення надіслано').isVisible());
  check('Спільний доступ: з’являється «Андрій» в очікуванні', await page.getByText('Андрій', { exact: true }).isVisible());
  await page.getByRole('button', { name: /Скасувати запрошення/ }).click();
  check('Спільний доступ: скасування повертає початковий стан', await page.getByRole('button', { name: 'Запросити учасника' }).isVisible());

  await page.goto(`${BASE}/#/export`);
  await page.getByRole('heading', { name: 'Експорт для ветеринара', level: 1 }).waitFor();
  await page.getByRole('radio', { name: 'Мурка' }).click();
  await page.getByRole('button', { name: 'Створити PDF' }).click();
  await wait(200);
  check('P3: проміжний стан «Створюю PDF…»', await page.getByRole('button', { name: 'Створюю PDF…' }).isVisible());
  await page.getByText('Файл готовий').waitFor({ state: 'visible', timeout: 4000 });
  check(
    'Експорт: банер «Файл готовий» з назвою улюбленця',
    await page
      .locator('.banner')
      .getByText(/Історія Мурки/)
      .isVisible(),
  );
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
    page.getByRole('button', { name: 'Зберегти на телефон' }).click(),
  ]);
  check('Експорт: «Зберегти на телефон» завантажує PDF', !!download, download ? download.suggestedFilename() : '');

  // Вкладки, заглушка, профіль
  await page.getByRole('navigation', { name: 'Основна навігація' }).getByRole('link', { name: 'Розклад' }).click();
  await page.getByText('Поза макетом').waitFor();
  check('Вкладка «Розклад» показує заглушку, позначену як поза макетом', true);
  await page.getByRole('navigation', { name: 'Основна навігація' }).getByRole('link', { name: 'Улюбленці' }).click();
  await page.getByRole('heading', { name: 'Рекс', level: 1 }).waitFor();
  check('Вкладка «Улюбленці» відкриває профіль Рекса', true);
  await page.getByRole('button', { name: 'Нотатки', exact: true }).click();
  await wait(700);
  check(
    'Профіль: «Нотатки» прокручує до розділу',
    await page.evaluate(() => window.scrollY > 300),
    `scrollY=${await page.evaluate(() => window.scrollY)}`,
  );
  await page.getByRole('button', { name: 'Усі нотатки' }).click();
  check(
    'Розділи поза макетом пояснюють це тостом',
    await page
      .locator('.toast')
      .getByText(/поза макетом/)
      .isVisible(),
  );

  // Поради
  await page.goto(`${BASE}/#/tips`);
  await page.getByRole('searchbox', { name: 'Пошук' }).fill('кіт');
  check(
    'Поради: пошук відфільтровує картки',
    (await page.locator('.media-card').count()) < 6,
    `cards=${await page.locator('.media-card').count()}`,
  );

  // Прямий вхід без історії
  await page.goto(`${BASE}/#/export`);
  await page.reload();
  await page.getByRole('button', { name: /Назад: Ще/ }).click();
  await page.getByRole('heading', { name: 'Ще', level: 1 }).waitFor({ timeout: 3000 });
  check('«Назад» без історії веде на запасний екран', true);

  check('У консолі немає помилок', errors.length === 0, errors.join(' | ').slice(0, 200));
  await ctx.close();
}

async function keyboard(browserName, browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, locale: 'uk-UA' });
  const page = await ctx.newPage();
  for (const [name, hash] of routes) {
    await page.goto('about:blank'); // чистий старт: фокус не переходить між прогонами
    await page.goto(`${BASE}/?frame=device${hash}`);
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    await wait(150);
    const stops = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30),
          outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2,
          shadow: cs.boxShadow !== 'none',
          within: el.closest('.search-field') !== null,
          key: el.tagName + (el.id || '') + r.x + r.y,
        };
      });
      if (!info) break;
      if (stops.some((s) => s.key === info.key)) break;
      stops.push(info);
    }
    const bad = stops.filter((s) => !s.outline && !s.shadow && !s.within);
    record(
      browserName,
      'Клавіатура',
      `${name}: ${stops.length} зупинок, кожна має видимий фокус`,
      bad.length === 0,
      bad.map((b) => b.label).join(', '),
    );
  }
  await ctx.close();
}

async function responsive(browserName, browser) {
  const widths = [320, 393, 820, 1440];
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w >= 820 ? 900 : 800 }, locale: 'uk-UA' });
    const page = await ctx.newPage();
    for (const [name, hash] of routes) {
      await page.goto('about:blank');
      await page.goto(`${BASE}/?frame=none${hash}`);
      await page.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 5000 });
      await wait(1500);
      const m = await page.evaluate(() => {
        const nav = document.querySelector('.nav').getBoundingClientRect();
        const wide = [...document.querySelectorAll('body *')].filter(
          (e) => e.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(e).position !== 'fixed',
        ).length;
        return {
          sw: document.documentElement.scrollWidth,
          iw: window.innerWidth,
          navLeft: nav.left,
          navTop: nav.top,
          navW: nav.width,
          navH: nav.height,
          wide,
        };
      });
      record(browserName, 'Адаптивність', `${w}px · ${name}: без горизонтального скролу`, m.sw <= m.iw, `scrollWidth=${m.sw}`);
      if (name === 'today') {
        const layoutOk =
          w < 768 ? m.navH <= 90 && m.navW === w : w < 1200 ? m.navW === 84 && m.navLeft === 0 : m.navW === 240 && m.navLeft === 0;
        record(
          browserName,
          'Адаптивність',
          `${w}px: навігація має правильний режим (${w < 768 ? 'нижня панель' : w < 1200 ? 'рейка 84 px' : 'бічна панель 240 px'})`,
          layoutOk,
          JSON.stringify({ navW: m.navW, navH: m.navH }),
        );
      }
      if (browserName === 'chromium' && ['today', 'profile', 'tips', 'export'].includes(name))
        await page.screenshot({ path: `${OUT}/shots/${w}-${name}.png`, fullPage: false });
    }
    await ctx.close();
  }
}

async function a11y(browserName, browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, locale: 'uk-UA' });
  const page = await ctx.newPage();
  const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];
  for (const [name, hash] of routes) {
    await page.goto('about:blank');
    await page.goto(`${BASE}/?frame=device${hash}`);
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    await wait(200);
    const r = await new AxeBuilder({ page }).withTags(tags).analyze();
    record(
      browserName,
      'axe (WCAG 2.1 A/AA)',
      `${name}: порушень ${r.violations.length}`,
      r.violations.length === 0,
      r.violations.map((v) => `${v.id}(${v.impact}) x${v.nodes.length}`).join(', '),
    );
    // цілі натискання: розмір елемента або зона натискання, що сягає 44 px (перевіряємо через elementFromPoint)
    const small = await page.evaluate(() => {
      const sel = 'a[href], button, input:not([type=hidden]), select, textarea, [role=switch], [role=radio], [role=checkbox]';
      const out = [];
      for (const e of document.querySelectorAll(sel)) {
        const r = e.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || e.classList.contains('skip-link')) continue;
        const label = (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 28);
        const hit = (x, y) => {
          const t = document.elementFromPoint(x, y);
          return !!t && (t === e || e.contains(t));
        };
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let okW = r.width >= 44;
        let okH = r.height >= 44;
        if (!okW) okW = hit(cx - 21.5, cy) && hit(cx + 21.5, cy);
        if (!okH) okH = hit(cx, cy - 21.5) && hit(cx, cy + 21.5);
        if (!okW || !okH) out.push(`${label} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      return out;
    });
    record(browserName, 'Цілі натискання', `${name}: усі елементи ≥ 44x44`, small.length === 0, small.join('; '));
  }
  // панель нової події
  await page.goto(`${BASE}/?frame=device#/`);
  await page.getByRole('button', { name: 'Додати подію' }).click();
  await page.getByRole('dialog').waitFor();
  await wait(400);
  const r = await new AxeBuilder({ page }).withTags(tags).analyze();
  record(
    browserName,
    'axe (WCAG 2.1 A/AA)',
    `панель «Нова подія»: порушень ${r.violations.length}`,
    r.violations.length === 0,
    r.violations.map((v) => `${v.id}(${v.impact}) x${v.nodes.length}`).join(', '),
  );
  await ctx.close();
}

async function motion(browserName, browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/#/`);
  await page.getByRole('heading', { name: 'Сьогодні', level: 1 }).waitFor({ timeout: 4000 });
  const v = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dist-md').trim());
  record(browserName, 'Рух', 'prefers-reduced-motion: зсуви анімацій обнуляються (--dist-md = 0)', v === '0px', `--dist-md=${v}`);
  await ctx.close();
}

async function textScale(browserName, browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?frame=device#/more`);
  await page.getByRole('heading', { level: 1 }).waitFor();
  const before = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.setting-row__title')).fontSize));
  await page.addStyleTag({ content: 'html{font-size:200% !important}' });
  await wait(100);
  const after = await page.evaluate(() => ({
    size: parseFloat(getComputedStyle(document.querySelector('.setting-row__title')).fontSize),
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
    clipped: [...document.querySelectorAll('.setting-row, .btn, .chip, .badge')].filter((e) => e.scrollHeight > e.clientHeight + 1).length,
  }));
  record(
    browserName,
    'Текст 200%',
    `розмір шрифту реагує на налаштування браузера (було ${before}px, стало ${after.size}px)`,
    after.size >= before * 1.9,
    '',
  );
  record(
    browserName,
    'Текст 200%',
    'без горизонтального скролу та обрізання тексту при 200%',
    after.sw <= after.iw && after.clipped === 0,
    `scrollWidth=${after.sw}/${after.iw}, обрізано=${after.clipped}`,
  );
  await ctx.close();
}

const engines = { chromium, firefox, webkit };
for (const [name, type] of Object.entries(engines)) {
  if (only && only !== name) continue;
  console.log(`== ${name}`);
  const browser = await type.launch();
  try {
    await scenarios(name, browser);
    await keyboard(name, browser);
    await responsive(name, browser);
    await motion(name, browser);
    await textScale(name, browser);
    if (name === 'chromium') await a11y(name, browser);
  } catch (e) {
    record(name, 'Збій прогону', e.message.split('\n').slice(0, 3).join(' '), false);
  } finally {
    await browser.close();
  }
}
server.kill();

const bad = results.filter((r) => !r.ok);
const byGroup = {};
for (const r of results) {
  const k = `${r.browser} · ${r.group}`;
  byGroup[k] ??= { ok: 0, fail: 0 };
  r.ok ? byGroup[k].ok++ : byGroup[k].fail++;
}
console.table(byGroup);
writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
console.log(`Усього перевірок: ${results.length}, невдалих: ${bad.length}`);
process.exit(bad.length ? 1 : 0);

// Генерує демонстраційний PDF для екрана «Експорт». Усі дані вигадані.
import { chromium } from 'playwright';

const html = `<!doctype html><html lang="uk"><meta charset="utf-8"><style>
body{font-family:Inter,Arial,sans-serif;color:#14201b;margin:40px}
h1{font-size:26px;margin:0 0 4px} p{color:#46524d;margin:0 0 20px}
h2{font-size:16px;margin:24px 0 8px;color:#137d63}
table{border-collapse:collapse;width:100%;font-size:13px} td,th{border-bottom:1px solid #dce3e0;padding:8px 6px;text-align:left}
.note{margin-top:32px;font-size:12px;color:#5b6863}
</style><h1>Рекс · історія</h1><p>Пес · лабрадор · 3 роки · чіп є</p>
<h2>Щеплення</h2><table><tr><th>Дата</th><th>Вакцина</th></tr>
<tr><td>12.03.2026</td><td>Комплексна вакцина</td></tr><tr><td>12.03.2026</td><td>Сказ</td></tr></table>
<h2>Обробки від паразитів</h2><table><tr><th>Дата</th><th>Засіб</th></tr>
<tr><td>25.09.2026</td><td>Краплі від бліх і кліщів</td></tr><tr><td>11.09.2026</td><td>Глистогонне</td></tr></table>
<h2>Візити до ветеринара</h2><table><tr><th>Дата</th><th>Нотатка</th></tr>
<tr><td>02.09.2026</td><td>Плановий огляд, алергія на курку</td></tr></table>
<p class="note">Демонстраційний файл навчального проєкту. Усі дані вигадані.</p></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.pdf({ path: 'public/files/demo-history.pdf', format: 'A4', printBackground: true });
await browser.close();
console.log('ok');

// Допоміжний скрипт: склеює фрагмент еталона й знімка поруч (x y w h), збільшення x2.
import sharp from 'sharp';
const [name, x, y, w, h] = process.argv.slice(2);
const box = { left: +x, top: +y, width: +w, height: +h };
const a = await sharp(`design/ref/${name}.png`)
  .extract(box)
  .resize({ width: box.width * 2, kernel: 'nearest' })
  .png()
  .toBuffer();
const b = await sharp(`tests/visual/out/${name}.png`)
  .extract(box)
  .resize({ width: box.width * 2, kernel: 'nearest' })
  .png()
  .toBuffer();
await sharp({ create: { width: box.width * 4 + 20, height: box.height * 2, channels: 3, background: '#ff00ff' } })
  .composite([
    { input: a, left: 0, top: 0 },
    { input: b, left: box.width * 2 + 20, top: 0 },
  ])
  .png()
  .toFile('/tmp/crop.png');

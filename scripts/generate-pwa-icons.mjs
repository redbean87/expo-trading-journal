import sharp from 'sharp';
import { mkdirSync } from 'fs';

const SRC = 'assets/icon.png';
const THEME = '#6200ee';
const PWA_SIZE = 512;
const ADAPTIVE_SIZE = 1024;
const SAFE_ZONE = 0.8;
const ADAPTIVE_SAFE_ZONE = 0.66;

function centeredComposite(size, innerSize, bgAlpha = 0) {
  const offset = Math.round((size - innerSize) / 2);
  return (buf) =>
    sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: buf, left: offset, top: offset }])
      .png()
      .toBuffer();
}

mkdirSync('public/icons', { recursive: true });

const srcBuffer = await sharp(SRC).toBuffer();

// --- PWA icons ---
await sharp(srcBuffer).resize(192, 192).toFile('public/icons/icon-192.png');
await sharp(srcBuffer)
  .resize(PWA_SIZE, PWA_SIZE)
  .toFile('public/icons/icon-512.png');

const pwaInnerSize = Math.round(PWA_SIZE * SAFE_ZONE);
await sharp(srcBuffer)
  .resize(pwaInnerSize, pwaInnerSize, { fit: 'inside' })
  .flatten({ background: THEME })
  .toBuffer()
  .then(centeredComposite(PWA_SIZE, pwaInnerSize))
  .then((buf) => sharp(buf).toFile('public/icons/icon-512-maskable.png'));

// --- App icon (maintain source resolution) ---
await sharp(srcBuffer)
  .resize(ADAPTIVE_SIZE, ADAPTIVE_SIZE)
  .toFile('assets/icon.png');

// --- Favicon ---
await sharp(srcBuffer).resize(48, 48).toFile('assets/favicon.png');

// --- Android adaptive icon (foreground only, tighter safe zone) ---
const adaptiveInner = Math.round(ADAPTIVE_SIZE * ADAPTIVE_SAFE_ZONE);
await sharp(srcBuffer)
  .resize(adaptiveInner, adaptiveInner, { fit: 'inside' })
  .toBuffer()
  .then(centeredComposite(ADAPTIVE_SIZE, adaptiveInner))
  .then((buf) => sharp(buf).toFile('assets/adaptive-icon.png'));

// --- Splash icon (centered on transparent, 1024x1024 canvas) ---
const splashInner = Math.round(ADAPTIVE_SIZE * SAFE_ZONE);
await sharp(srcBuffer)
  .resize(splashInner, splashInner, { fit: 'inside' })
  .toBuffer()
  .then(centeredComposite(ADAPTIVE_SIZE, splashInner))
  .then((buf) => sharp(buf).toFile('assets/splash-icon.png'));

console.log('All icons generated (PWA, favicon, adaptive, splash).');

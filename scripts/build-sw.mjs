import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SW_SRC = path.join(ROOT_DIR, 'scripts', 'sw-template.js');
const SW_DEST = path.join(DIST_DIR, 'sw.js');

const TEN_MB_BYTES = 10 * 1024 * 1024;

async function buildSW() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(
      '❌ dist/ directory not found. Run "expo export --platform web" first.'
    );
    process.exit(1);
  }

  const { injectManifest } = await import('workbox-build');

  const { count, size, warnings } = await injectManifest({
    globDirectory: 'dist',
    globPatterns: ['offline.html'],
    maximumFileSizeToCacheInBytes: TEN_MB_BYTES,
    swSrc: SW_SRC,
    swDest: SW_DEST,
  });

  if (warnings.length > 0) {
    console.warn('⚠️ Workbox warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  console.log(`✅ Service worker generated at dist/sw.js`);
  console.log(
    `   Precached ${count} files (${(size / 1024).toFixed(1)} KB total)`
  );
}

buildSW().catch((err) => {
  console.error('❌ Failed to generate service worker:', err);
  process.exit(1);
});

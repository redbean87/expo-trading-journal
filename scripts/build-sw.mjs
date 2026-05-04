import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SW_DEST = path.join(DIST_DIR, 'sw.js');

const SKIP_WAITING_SNIPPET = `
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;

async function buildSW() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(
      '❌ dist/ directory not found. Run "expo export --platform web" first.'
    );
    process.exit(1);
  }

  const { generateSW } = await import('workbox-build');

  const { count, size, warnings } = await generateSW({
    globDirectory: 'dist',
    globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,woff,woff2,ico,json}'],
    swDest: 'dist/sw.js',
    skipWaiting: false,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    navigateFallback: '/offline.html',
    navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
    maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MB
    sourcemap: false,
  });

  // Inject custom SKIP_WAITING message handler
  const swContent = fs.readFileSync(SW_DEST, 'utf8');
  fs.writeFileSync(SW_DEST, SKIP_WAITING_SNIPPET + swContent);

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

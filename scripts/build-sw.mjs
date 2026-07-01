import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SW_DEST = path.join(DIST_DIR, 'sw.js');
const VERSION_PATH = path.join(DIST_DIR, 'version.json');

const TEN_MB_BYTES = 10 * 1024 * 1024;

const SKIP_WAITING_SNIPPET = `
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;

function getGitHash() {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

function writeVersionFile() {
  const version = {
    version: getGitHash(),
    buildTime: new Date().toISOString(),
  };
  fs.writeFileSync(VERSION_PATH, JSON.stringify(version, null, 2));
}

async function buildSW() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(
      '❌ dist/ directory not found. Run "expo export --platform web" first.'
    );
    process.exit(1);
  }

  writeVersionFile();

  const { generateSW } = await import('workbox-build');

  const { count, size, warnings } = await generateSW({
    globDirectory: 'dist',
    globPatterns: ['offline.html', 'version.json'],
    maximumFileSizeToCacheInBytes: TEN_MB_BYTES,
    swDest: SW_DEST,
    skipWaiting: false,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    sourcemap: false,
    runtimeCaching: [
      {
        urlPattern: /^\/_expo\/static\/.*\.(?:js|css)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'expo-static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 31536000,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern:
          /^\/assets\/.*\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|ico)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'app-assets',
          expiration: {
            maxEntries: 300,
            maxAgeSeconds: 31536000,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^\/(?:manifest\.json|favicon\.ico|icons\/.*)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'pwa-assets',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 31536000,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  });

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

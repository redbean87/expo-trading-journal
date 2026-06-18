import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('build-sw', () => {
  const rootDir = path.resolve(__dirname, '..', '..');
  const distDir = path.join(rootDir, 'dist');
  const swPath = path.join(distDir, 'sw.js');

  beforeEach(() => {
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, 'offline.html'), '<html></html>');
    fs.mkdirSync(path.join(distDir, '_expo', 'static', 'js', 'web'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(distDir, '_expo', 'static', 'js', 'web', 'entry-test.js'),
      'console.log("test")'
    );
  });

  afterEach(() => {
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
  });

  it('generates a service worker that precaches offline.html but not index.html', () => {
    execSync('node scripts/build-sw.mjs', {
      cwd: rootDir,
      stdio: 'pipe',
    });

    const swContent = fs.readFileSync(swPath, 'utf8');

    expect(swContent).toContain('offline.html');
    expect(swContent).not.toContain('index.html');
    expect(swContent).toContain('self.skipWaiting()');
    expect(swContent).toContain('clientsClaim()');
  });

  it('caches static assets with CacheFirst', () => {
    execSync('node scripts/build-sw.mjs', {
      cwd: rootDir,
      stdio: 'pipe',
    });

    const swContent = fs.readFileSync(swPath, 'utf8');

    expect(swContent).toContain('CacheFirst');
    expect(swContent).toContain('expo-static-assets');
    expect(swContent).toContain('app-assets');
  });
});

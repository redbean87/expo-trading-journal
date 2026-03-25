import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const src = 'assets/icon.png';
await sharp(src).resize(192, 192).toFile('public/icons/icon-192.png');
await sharp(src).resize(512, 512).toFile('public/icons/icon-512.png');
console.log('PWA icons generated.');

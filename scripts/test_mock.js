import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');

console.log('--- 1. Testing Static Assets in app/public ---');
const publicDir = path.join(appDir, 'public');
const expectedFiles = [
  'DefaultImage.jpg',
  'DefaultVideo.mp4',
  'camera_1.jpg',
  'camera_2.jpg',
  'camera_3.jpg',
  'camera_4.jpg',
  'video_1.mp4',
  'video_2.mp4',
  'video_3.mp4',
  'video_4.mp4',
];

for (const f of expectedFiles) {
  const filePath = path.join(publicDir, f);
  assert(fs.existsSync(filePath), `Missing public file: ${f}`);
  const stats = fs.statSync(filePath);
  assert(stats.size > 0, `File is empty: ${f}`);
  console.log(`  ✓ ${f} (${stats.size} bytes)`);
}

console.log('\n--- 2. Testing Mock Implementation and Logic ---');
// Dynamically import compiled bundle or test mock logic
const mockPath = path.join(appDir, 'src', 'modules', 'mock.ts');
assert(fs.existsSync(mockPath), 'mock.ts must exist');
const mockContent = fs.readFileSync(mockPath, 'utf8');

assert(mockContent.includes('CAMERAS_MOCK'), 'Must export CAMERAS_MOCK');
assert(mockContent.includes('getPublishedCameras'), 'Must export getPublishedCameras');
assert(mockContent.includes('getNextCameraId'), 'Must export getNextCameraId');
assert(mockContent.includes('DEFAULT_IMAGE'), 'Must export DEFAULT_IMAGE');
assert(mockContent.includes('DEFAULT_VIDEO'), 'Must export DEFAULT_VIDEO');
console.log('  ✓ Mock exports verified');

// Test domain models count
assert(mockContent.includes('DS-2CE16D8T-ITE'), 'Camera 1 present');
assert(mockContent.includes('DS-2CD2123G0-IS'), 'Camera 2 present');
assert(mockContent.includes('DS-2CD50C5G0-AP'), 'Camera 3 present');
assert(mockContent.includes('DS-2CD2025FWD-I'), 'Camera 4 present');
console.log('  ✓ Domain cameras from Theme 9 verified');

console.log('\n--- 3. Testing Component Files Existence ---');
const componentFiles = [
  'src/components/BottomNavBar.tsx',
  'src/components/BottomNavBar.css',
  'src/components/CameraCard.tsx',
  'src/components/CameraCard.css',
  'src/components/PowerFilter.tsx',
  'src/components/PowerFilter.css',
  'src/pages/CameraCatalogPage.tsx',
  'src/pages/CameraCatalogPage.css',
  'src/pages/CameraFeedPage.tsx',
  'src/pages/CameraFeedPage.css',
  'src/AppLayout.tsx',
  'src/AppLayout.css',
  'src/App.tsx',
  'src/main.tsx',
  'src/index.css',
];

for (const cf of componentFiles) {
  const fullP = path.join(appDir, cf);
  assert(fs.existsSync(fullP), `Component file missing: ${cf}`);
  console.log(`  ✓ ${cf}`);
}

console.log('\n--- 4. Testing Build Artifacts ---');
const distHtml = path.join(appDir, 'dist', 'index.html');
assert(fs.existsSync(distHtml), 'dist/index.html must exist after build');
console.log('  ✓ dist/index.html verified');

console.log('\nAll automated mock and architecture tests passed successfully!');

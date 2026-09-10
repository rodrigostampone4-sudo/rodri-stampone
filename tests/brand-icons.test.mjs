import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

async function readPngDimensions(path) {
  const file = await readFile(path);
  assert.deepEqual(file.subarray(0, 8), pngSignature);

  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  };
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

test('public pages share the complete 4side favicon metadata', async () => {
  const [brandHead, indexPage] = await Promise.all([
    readFile('src/components/BrandHead.astro', 'utf8'),
    readFile('src/pages/index.astro', 'utf8'),
  ]);

  for (const reference of [
    '/favicon.ico',
    '/favicon.svg',
    '/favicon-96.png',
    '/apple-touch-icon.png',
    '/manifest.webmanifest',
  ]) {
    assert.match(brandHead, new RegExp(reference.replace('.', '\\.')));
  }

  assert.match(indexPage, /<BrandHead\s*\/>/);
});

test('generated PNG assets have the declared square dimensions', async () => {
  for (const [path, size] of [
    ['public/favicon-96.png', 96],
    ['public/favicon-192.png', 192],
    ['public/favicon-512.png', 512],
    ['public/apple-touch-icon.png', 180],
  ]) {
    assert.deepEqual(await readPngDimensions(path), {
      width: size,
      height: size,
    });
  }
});

test('ICO contains 16, 32 and 48 pixel brand variants', async () => {
  const file = await readFile('public/favicon.ico');
  assert.equal(file.readUInt16LE(0), 0);
  assert.equal(file.readUInt16LE(2), 1);
  assert.equal(file.readUInt16LE(4), 3);
  assert.deepEqual(
    [file[6], file[22], file[38]],
    [16, 32, 48],
  );
});

test('Studio overrides every built-in Sanity favicon with the public brand set', async () => {
  for (const name of [
    'favicon.ico',
    'favicon.svg',
    'favicon-96.png',
    'favicon-192.png',
    'favicon-512.png',
    'apple-touch-icon.png',
  ]) {
    assert.equal(
      await sha256(`studio/static/${name}`),
      await sha256(`public/${name}`),
      `${name} must be identical across public and Studio surfaces`,
    );
  }

  const [config, icon] = await Promise.all([
    readFile('studio/sanity.config.ts', 'utf8'),
    readFile('studio/src/components/FourSideIcon.tsx', 'utf8'),
  ]);
  assert.match(config, /icon: FourSideIcon/);
  assert.match(config, /import \{ PinIcon \} from '@sanity\/icons\/Pin';/);
  assert.match(config, /title\('Venues'\)[\s\S]*?\.icon\(PinIcon\)/);
  assert.match(icon, /<svg[\s\S]*?viewBox="0 0 128 128"/);
  assert.match(icon, /href="\/static\/4side-isotipo-white\.png"/);
  assert.match(icon, /fill="currentColor"/);
  assert.match(icon, /mask="url\(#four-side-icon-mask\)"/);

  const studioIcon = await readFile('studio/static/4side-isotipo-white.png');
  assert.deepEqual(studioIcon.subarray(0, 8), pngSignature);
  assert.equal(studioIcon[25], 6, 'Studio icon must retain an alpha channel');
  assert.deepEqual(await readPngDimensions('studio/static/4side-isotipo-white.png'), {
    width: 128,
    height: 128,
  });
});

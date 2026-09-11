import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { inflateSync } from 'node:zlib';

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

async function readPngDimensions(path) {
  const file = await readFile(path);
  return readPngDetails(file);
}

function readPngDetails(file) {
  assert.deepEqual(file.subarray(0, 8), pngSignature);
  assert.equal(file[24], 8, 'PNG must use 8-bit channels');
  assert.equal(file[25], 6, 'PNG must retain an alpha channel');
  assert.equal(file[28], 0, 'PNG must not be interlaced');

  const imageData = [];
  let offset = 8;
  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') {
      imageData.push(file.subarray(offset + 8, offset + 8 + length));
    }
    offset += length + 12;
    if (type === 'IEND') break;
  }

  const pixels = inflateSync(Buffer.concat(imageData));
  assert.ok(pixels[0] <= 4, 'PNG must use a supported row filter');

  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
    cornerAlpha: pixels[4],
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
    const details = await readPngDimensions(path);
    assert.equal(details.width, size);
    assert.equal(details.height, size);
    assert.equal(details.cornerAlpha, 0, `${path} must have a transparent background`);
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

  for (let index = 0; index < 3; index += 1) {
    const entryOffset = 6 + index * 16;
    const imageSize = file.readUInt32LE(entryOffset + 8);
    const imageOffset = file.readUInt32LE(entryOffset + 12);
    assert.equal(
      readPngDetails(file.subarray(imageOffset, imageOffset + imageSize)).cornerAlpha,
      0,
      `ICO variant ${index + 1} must have a transparent background`,
    );
  }
});

test('SVG favicon embeds the transparent brand image without a background layer', async () => {
  const svg = await readFile('public/favicon.svg', 'utf8');
  const embeddedPng = svg.match(/href="data:image\/png;base64,([^"]+)"/);

  assert.ok(embeddedPng, 'SVG must embed the brand PNG');
  assert.doesNotMatch(svg, /<rect\b|background|fill="(?:#0{3,6}|black)"/i);
  assert.equal(
    readPngDetails(Buffer.from(embeddedPng[1], 'base64')).cornerAlpha,
    0,
    'SVG image must have a transparent background',
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
  const studioIconDetails = await readPngDimensions('studio/static/4side-isotipo-white.png');
  assert.equal(studioIconDetails.width, 128);
  assert.equal(studioIconDetails.height, 128);
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [actions, config, input, landingLinkIcon, schema, studioLinkIcon] = await Promise.all([
  readFile(new URL('../studio/src/lib/document-actions.ts', import.meta.url), 'utf8'),
  readFile(new URL('../studio/sanity.config.ts', import.meta.url), 'utf8'),
  readFile(new URL('../studio/src/components/SiteSettingsInput.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/PermanentLinkIcon.astro', import.meta.url), 'utf8'),
  readFile(new URL('../studio/schemaTypes/siteSettings.ts', import.meta.url), 'utf8'),
  readFile(new URL('../studio/src/components/PermanentLinkIcon.tsx', import.meta.url), 'utf8'),
]);

test('Links and Perfil open the native site settings document directly', () => {
  assert.match(config, /const profilePane = \(\) =>\s*S\.document\(\)[\s\S]*?\.id\('profile'\)[\s\S]*?\.documentId\('siteSettings'\)/);
  assert.match(config, /const linksPane = \(\) =>\s*S\.document\(\)[\s\S]*?\.id\('links'\)[\s\S]*?\.documentId\('siteSettings'\)/);
  assert.doesNotMatch(config, /LinksPane|ProfilePane/);
});

test('the singleton form exposes only the fields for the selected panel destination', () => {
  assert.match(schema, /components:\s*\{\s*input: SiteSettingsInput/);
  assert.match(input, /fieldNames: \['links'\]/);
  assert.match(input, /fieldNames: \['name', 'instagramHandle', 'profileImage', 'bio'\]/);
  assert.match(input, /props\.onFieldGroupSelect\(section\)/);
  assert.match(input, /props\.renderDefault\(\{ \.\.\.props, groups: \[\], members: visibleFields \}\)/);
  assert.match(input, /Edición directa/);
});

test('site settings cannot be created, duplicated, unpublished or deleted accidentally', () => {
  assert.match(actions, /blockedSingletonActions = new Set\(\['delete', 'duplicate', 'unpublish'\]\)/);
  assert.match(actions, /schemaType === 'siteSettings'/);
  assert.match(config, /resolveDocumentActions\(previousActions, context\.schemaType\)/);
  assert.match(
    config,
    /templates: \(previousTemplates\) =>[\s\S]*?template\.schemaType !== 'siteSettings'/,
  );
});

test('profile images expose an editable non-blocking alt text warning', () => {
  assert.match(schema, /name: 'profileImage'[\s\S]*?name: 'alt'/);
  assert.match(schema, /Rule\.required\(\)[\s\S]*?\.warning\(/);
});

test('links expose one semantic personal Instagram destination at most', () => {
  assert.match(schema, /title: 'Instagram personal', value: 'profileInstagram'/);
  assert.match(schema, /link\?\.kind === 'profileInstagram'/);
  assert.match(schema, /profileLinks\.length <= 1/);
});

test('Studio link previews reuse the landing icon for each semantic kind', () => {
  assert.match(schema, /kind: 'kind'/);
  assert.match(schema, /media: renderPermanentLinkIcon\(kind\)/);
  assert.match(
    studioLinkIcon,
    /iconKind === 'profileInstagram' \|\| iconKind === 'instagram'/,
  );

  for (const kind of ['whatsapp', 'tables', 'whatsappGroup', 'custom']) {
    assert.match(studioLinkIcon, new RegExp(`iconKind === '${kind}'`));
  }

  const extractShapes = (source) =>
    [...source.matchAll(/<(?:rect|circle|path)\b[^>]*\/>/g)].map(([shape]) => shape);

  assert.deepEqual(extractShapes(studioLinkIcon), extractShapes(landingLinkIcon));
});

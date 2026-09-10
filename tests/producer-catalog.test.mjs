import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [
  producerSchema,
  eventSchema,
  managedReferenceInput,
  schemaIndex,
  studioConfig,
  studioPackage,
  seedData,
  eventSeed,
] = await Promise.all([
    readFile(new URL('../studio/schemaTypes/producer.ts', import.meta.url), 'utf8'),
    readFile(new URL('../studio/schemaTypes/event.ts', import.meta.url), 'utf8'),
    readFile(
      new URL('../studio/src/components/ManagedReferenceInput.tsx', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../studio/schemaTypes/index.ts', import.meta.url), 'utf8'),
    readFile(new URL('../studio/sanity.config.ts', import.meta.url), 'utf8'),
    readFile(new URL('../studio/package.json', import.meta.url), 'utf8'),
    readFile(new URL('../studio/scripts/producer-seed-data.ts', import.meta.url), 'utf8'),
    readFile(new URL('../studio/scripts/seed-content.ts', import.meta.url), 'utf8'),
  ]);

test('Studio exposes an editable producer catalog', () => {
  assert.match(producerSchema, /name: 'producer'/);
  assert.match(producerSchema, /title: 'Productora'/);
  assert.match(producerSchema, /name: 'name'[\s\S]*?Rule\.required\(\)/);
  assert.match(schemaIndex, /import producer from '\.\/producer'/);
  assert.match(schemaIndex, /schemaTypes = \[siteSettings, event, venue, producer\]/);
  assert.match(studioConfig, /title\('Productoras'\)[\s\S]*?documentTypeList\('producer'\)/);
});

test('events select a producer from the managed catalog', () => {
  assert.match(eventSchema, /name: 'producer'[\s\S]*?type: 'reference'/);
  assert.match(eventSchema, /to: \[\{ type: 'producer' \}\]/);
  assert.match(
    eventSchema,
    /name: 'producer'[\s\S]*?components: \{ input: ManagedReferenceInput \}/,
  );
  assert.match(eventSchema, /name: 'producer'[\s\S]*?Rule\.required\(\)/);
});

test('managed references reopen the native selector and allow new catalog options', () => {
  assert.match(managedReferenceInput, /props\.onPathFocus\(\['_ref'\]\)/);
  assert.match(managedReferenceInput, /disableNew=\{false\}/);
  assert.doesNotMatch(eventSchema, /disableNew: true/);
  assert.match(
    eventSchema,
    /name: 'venue'[\s\S]*?components: \{ input: ManagedReferenceInput \}/,
  );
});

test('producer seed prepares the 4SIDE and Elements options', () => {
  const scripts = JSON.parse(studioPackage).scripts;

  assert.equal(
    scripts['seed:producers'],
    'sanity exec scripts/seed-producers.ts --with-user-token',
  );
  assert.match(seedData, /_id: 'producer-4side'/);
  assert.match(seedData, /name: '4SIDE'/);
  assert.match(seedData, /_id: 'producer-elements'/);
  assert.match(seedData, /name: 'Elements'/);
});

test('starter events use managed producer references without a one-time migration command', () => {
  const scripts = JSON.parse(studioPackage).scripts;

  assert.equal(scripts['assign:event-producers'], undefined);
  assert.doesNotMatch(eventSeed, /venue: '[^']+'/);
  assert.equal(
    [...eventSeed.matchAll(/producer: \{ _type: 'reference', _ref: 'producer-elements' \}/g)]
      .length,
    5,
  );
});

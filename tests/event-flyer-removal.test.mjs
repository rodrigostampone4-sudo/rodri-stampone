import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [eventSchema, queries, eventType, landing, styles] = await Promise.all([
  readFile(new URL('../studio/schemaTypes/event.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/lib/sanity/queries.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/types/content.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8'),
]);

test('events do not accept or render flyer images', () => {
  assert.doesNotMatch(eventSchema, /name: 'image'/);
  assert.doesNotMatch(eventSchema, /title: 'Flyer'/);
  assert.doesNotMatch(queries, /"image": image\$\{imageProjection\}/);
  assert.doesNotMatch(eventType, /image\?: SanityImage/);
  assert.doesNotMatch(landing, /eventImageUrl|event-thumb/);
  assert.doesNotMatch(styles, /\.event-thumb/);
});

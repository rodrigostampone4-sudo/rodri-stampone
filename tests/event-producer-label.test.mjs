import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [queries, contentTypes, landing, styles, readme, architecture] = await Promise.all([
  readFile(new URL('../src/lib/sanity/queries.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/types/content.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8'),
  readFile(new URL('../README.md', import.meta.url), 'utf8'),
  readFile(new URL('../docs/architecture.md', import.meta.url), 'utf8'),
]);

test('the landing projects and types the managed event producer', () => {
  assert.match(queries, /"producerId": producer->_id/);
  assert.match(queries, /"producer": producer->name/);
  assert.match(contentTypes, /export interface Event \{[\s\S]*?producerId: string;[\s\S]*?producer: string;/);
});

test('event cards render the producer as non-interactive metadata', () => {
  assert.match(
    landing,
    /class="event-meta"[\s\S]*?class="event-venue event-venue--maps"[\s\S]*?class:list=\{\[[\s\S]*?'event-producer'/,
  );
  assert.doesNotMatch(landing, /wrapsMobileVenue|event-meta--wrapped-venue/);
  assert.match(landing, /productora \$\{event\.producer\}/);
  assert.match(
    styles,
    /\.event-meta \{[\s\S]*?grid-template-columns: minmax\(0, 6\.5rem\) auto;[\s\S]*?justify-content: start;[\s\S]*?column-gap: 0\.5rem;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 42rem\) \{[\s\S]*?\.event-meta \{[\s\S]*?grid-column: 2 \/ 4;[\s\S]*?grid-row: 2;[\s\S]*?display: grid;[\s\S]*?grid-template-columns: minmax\(0, 1fr\);[\s\S]*?align-items: start;[\s\S]*?justify-items: start;[\s\S]*?row-gap: 0\.25rem;[\s\S]*?padding-right: 6\.75rem;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 42rem\) \{[\s\S]*?\.event-venue,[\s\S]*?\.event-producer \{[\s\S]*?white-space: nowrap;/,
  );
  assert.match(
    styles,
    /\.event-producer \{[\s\S]*?justify-self: start;[\s\S]*?border: 1px solid var\(--color-border\);[\s\S]*?border-left-color: var\(--color-accent\);[\s\S]*?font-family: var\(--font-sans\);[\s\S]*?font-size: 0\.625rem;[\s\S]*?text-transform: uppercase;/,
  );
  assert.doesNotMatch(styles, /\.event-meta--wrapped-venue/);
  assert.match(
    styles,
    /@media \(max-width: 42rem\) \{[\s\S]*?\.event-arrow \{[\s\S]*?width: 1\.25rem;[\s\S]*?height: 1\.25rem;/,
  );
  assert.doesNotMatch(landing, /<a[^>]*class="event-producer"/);
});

test('only 4SIDE receives the continuous orbiting border reflection', () => {
  assert.match(
    landing,
    /'event-producer--4side': event\.producerId === 'producer-4side'/,
  );
  assert.match(
    styles,
    /\.event-producer--4side::after \{[\s\S]*?conic-gradient\([\s\S]*?animation: event-producer-orbit 8s linear infinite;/,
  );
  assert.match(styles, /@keyframes event-producer-orbit \{[\s\S]*?--event-producer-orbit-angle: 1turn;/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.event-producer--4side::after \{[\s\S]*?animation: none;/,
  );
});

test('mobile event titles wrap without competing with actions or metadata', () => {
  assert.match(
    styles,
    /@media \(max-width: 42rem\) \{[\s\S]*?\.event-ticket-link \{[\s\S]*?column-gap: 0\.5rem;[\s\S]*?row-gap: 0\.25rem;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 22rem\) \{[\s\S]*?\.event-ticket-link \{[\s\S]*?grid-template-columns: 2\.5rem minmax\(0, 1fr\) auto;[\s\S]*?column-gap: 0\.375rem;[\s\S]*?row-gap: 0\.25rem;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 23\.4375rem\) and \(max-width: 27rem\) \{[\s\S]*?\.event-title \{[\s\S]*?max-inline-size: clamp\(8\.125rem, 35vw, 9\.5rem\);/,
  );
});

test('producer publications are documented as landing rebuild triggers', () => {
  assert.match(readme, /siteSettings`, `event`, `venue` o\s+`producer`/);
  assert.match(architecture, /_type == "producer"/);
});

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

test('event cards render the sketch hierarchy without changing link semantics', () => {
  assert.match(
    landing,
    /class="event-info"[\s\S]*?class="event-title"[\s\S]*?class="event-venue event-venue--maps"[\s\S]*?class:list=\{\[[\s\S]*?'event-producer'[\s\S]*?class="event-actions"[\s\S]*?class="event-cta event-ticket-cta"[\s\S]*?class="event-tables-cta"/,
  );
  assert.match(landing, /productora \$\{event\.producer\}/);
  assert.doesNotMatch(landing, /event-meta|event-arrow/);
  assert.doesNotMatch(landing, /<a[^>]*class="event-producer"/);
});

test('event cards preserve the measured sketch spacing and top alignment', () => {
  assert.match(
    styles,
    /\.events-list \{[\s\S]*?--event-leading-column-width: 3\.8125rem;[\s\S]*?display: grid;[\s\S]*?grid-template-columns: var\(--event-leading-column-width\) minmax\(0, 1fr\);[\s\S]*?column-gap: 8px;/,
  );
  assert.match(
    styles,
    /\.event-item \{[\s\S]*?grid-column: 1 \/ -1;[\s\S]*?grid-template-columns: var\(--event-leading-column-width\) minmax\(0, 1fr\);[\s\S]*?grid-template-rows: auto minmax\(24px, 1fr\) auto;[\s\S]*?column-gap: 8px;[\s\S]*?align-items: start;[\s\S]*?padding: 20px;/,
  );
  assert.match(
    styles,
    /@supports \(grid-template-columns: subgrid\) \{[\s\S]*?\.event-item \{[\s\S]*?grid-template-columns: subgrid;/,
  );
  assert.match(
    styles,
    /\.event-info \{[\s\S]*?grid-column: 2;[\s\S]*?grid-row: 1;[\s\S]*?display: grid;[\s\S]*?align-content: start;[\s\S]*?row-gap: 12px;/,
  );
  assert.match(
    styles,
    /\.event-producer \{[\s\S]*?grid-column: 1;[\s\S]*?grid-row: 3;[\s\S]*?align-self: end;[\s\S]*?justify-self: start;/,
  );
  assert.match(
    styles,
    /\.event-actions \{[\s\S]*?top: 20px;[\s\S]*?right: 20px;[\s\S]*?width: 6\.25rem;[\s\S]*?flex-direction: column;/,
  );
});

test('event actions balance a larger Tickets label with a secondary Mesas link', () => {
  assert.match(
    styles,
    /\.event-cta \{[\s\S]*?min-height: 2\.75rem;[\s\S]*?padding: 0\.375rem 0\.625rem;[\s\S]*?font-size: 0\.75rem;/,
  );
  assert.match(
    styles,
    /\.event-tables-cta \{[\s\S]*?min-height: 2\.75rem;[\s\S]*?display: inline-flex;[\s\S]*?pointer-events: auto;[\s\S]*?text-decoration: underline;/,
  );
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

test('mobile cards retain the same sketch grid at narrow widths', () => {
  assert.match(
    styles,
    /@media \(max-width: 42rem\) \{[\s\S]*?\.event-item \{[\s\S]*?grid-template-rows: auto minmax\(24px, 1fr\) auto;[\s\S]*?padding: 20px;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 42rem\) \{[\s\S]*?\.event-actions \{[\s\S]*?top: 20px;[\s\S]*?right: 20px;[\s\S]*?width: 5\.5rem;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 22rem\) \{[\s\S]*?\.event-item \{[\s\S]*?padding-right: calc\(20px \+ 5\.25rem \+ 12px\);[\s\S]*?\.event-actions \{[\s\S]*?width: 5\.25rem;/,
  );
});

test('producer publications are documented as landing rebuild triggers', () => {
  assert.match(readme, /siteSettings`, `event`, `venue` o\s+`producer`/);
  assert.match(architecture, /_type == "producer"/);
});

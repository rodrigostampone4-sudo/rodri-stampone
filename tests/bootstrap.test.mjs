import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { initialEvents } from '../studio/scripts/seed-content.ts';

const [seedScript, verificationScript] = await Promise.all([
  readFile(new URL('../studio/scripts/seed.ts', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/verify-sanity-seed.mjs', import.meta.url), 'utf8'),
]);

test('starter events satisfy the current venue and producer reference schema', () => {
  for (const event of initialEvents) {
    assert.equal(event.venue._type, 'reference');
    assert.match(event.venue._ref, /^venue-/);
    assert.equal(event.producer._type, 'reference');
    assert.match(event.producer._ref, /^producer-/);
  }
});

test('bootstrap creates the complete starter set only in an empty managed dataset', () => {
  assert.match(seedScript, /\.\.\.initialVenues[\s\S]*?\.\.\.initialProducers/);
  assert.match(seedScript, /managedDocumentCount > 0 && missingDocuments\.length > 0/);
  assert.match(seedScript, /Review the dataset instead of mixing starter content into it/);
  assert.match(seedScript, /transaction\.createIfNotExists<[\s\S]*?>\([\s\S]*?document as SeedDocument/);
});

test('bootstrap verification checks structure without requiring exact editorial content', () => {
  assert.match(verificationScript, /Sanity bootstrap structure OK/);
  assert.match(verificationScript, /actual\.venueType === 'venue'/);
  assert.match(verificationScript, /actual\.producerType === 'producer'/);
  assert.doesNotMatch(verificationScript, /isDeepStrictEqual|events\.length === initialEvents\.length/);
});

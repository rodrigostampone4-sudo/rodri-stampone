import assert from 'node:assert/strict';
import test from 'node:test';

import { SANITY_API_VERSION, createSanityConfig } from '../src/lib/sanity/config.ts';

test('the static landing reads published Sanity content from the origin', () => {
  const config = createSanityConfig({
    projectId: 'project-id',
    dataset: 'custom-dataset',
  });

  assert.deepEqual(config, {
    projectId: 'project-id',
    dataset: 'custom-dataset',
    apiVersion: SANITY_API_VERSION,
    perspective: 'published',
    useCdn: false,
  });
});

test('the static landing defaults to the production dataset', () => {
  assert.equal(createSanityConfig({}).dataset, 'production');
});

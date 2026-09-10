import { createClient } from '@sanity/client';
import { createSanityConfig } from '../src/lib/sanity/config.ts';
import { initialProducers } from '../studio/scripts/producer-seed-data.ts';
import { initialEvents, initialSiteSettings } from '../studio/scripts/seed-content.ts';
import { initialVenues } from '../studio/scripts/venue-seed-data.ts';

const config = createSanityConfig({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
});

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  assert(config.projectId, 'PUBLIC_SANITY_PROJECT_ID is not configured.');

  const client = createClient({
    ...config,
    projectId: config.projectId,
  });
  const expectedDocuments = [
    ...initialVenues,
    ...initialProducers,
    initialSiteSettings,
    ...initialEvents,
  ];
  const ids = expectedDocuments.map((document) => document._id);
  const documents = await client.fetch(
    `*[_id in $ids]{
      _id,
      _type,
      "venueType": venue->_type,
      "producerType": producer->_type
    }`,
    { ids },
  );
  const documentsById = new Map(documents.map((document) => [document._id, document]));

  for (const expected of expectedDocuments) {
    const actual = documentsById.get(expected._id);
    assert(actual, `Starter document ${expected._id} was not found.`);
    assert(actual._type === expected._type, `Starter document ${expected._id} has the wrong type.`);

    if (expected._type === 'event') {
      assert(actual.venueType === 'venue', `Starter event ${expected._id} has no valid venue reference.`);
      assert(
        actual.producerType === 'producer',
        `Starter event ${expected._id} has no valid producer reference.`,
      );
    }
  }

  console.log('Sanity bootstrap structure OK');
  console.log(`Starter documents: ${expectedDocuments.length}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown Sanity bootstrap error.';
  console.error(`Sanity bootstrap verification failed: ${message}`);
  process.exitCode = 1;
});

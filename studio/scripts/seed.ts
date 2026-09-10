import { getCliClient } from 'sanity/cli';

import { SANITY_API_VERSION } from '../src/lib/sanity-api';
import { initialProducers, type SeedProducer } from './producer-seed-data';
import {
  initialEvents,
  initialSiteSettings,
  type SeedEvent,
  type SeedSiteSettings,
} from './seed-content';
import { initialVenues, type SeedVenue } from './venue-seed-data';

const client = getCliClient({ apiVersion: SANITY_API_VERSION });

type SeedDocument = SeedVenue | SeedProducer | SeedSiteSettings | SeedEvent;

const seedDocuments: SeedDocument[] = [
  ...initialVenues,
  ...initialProducers,
  initialSiteSettings,
  ...initialEvents,
];
const seedIds = seedDocuments.map((document) => document._id);
const managedTypes = ['siteSettings', 'event', 'venue', 'producer'];

interface ExistingDocument {
  _id: string;
  _type: string;
}

const existing = await client.fetch<{
  documents: ExistingDocument[];
  managedDocumentCount: number;
}>(
  `{
    "documents": *[_id in $seedIds]{_id, _type},
    "managedDocumentCount": count(*[_type in $managedTypes && !(_id in path("drafts.**"))])
  }`,
  { seedIds, managedTypes },
);

const existingById = new Map(existing.documents.map((document) => [document._id, document]));
const typeConflicts = seedDocuments.flatMap((expected) => {
  const actual = existingById.get(expected._id);
  return actual && actual._type !== expected._type
    ? [`${expected._id} (${actual._type}, expected ${expected._type})`]
    : [];
});

if (typeConflicts.length > 0) {
  throw new Error(`Bootstrap aborted: conflicting document types: ${typeConflicts.join(', ')}.`);
}

const missingDocuments = seedDocuments.filter((document) => !existingById.has(document._id));

if (existing.managedDocumentCount > 0 && missingDocuments.length > 0) {
  throw new Error(
    `Bootstrap aborted: the dataset already contains managed content and is missing starter documents: ${missingDocuments
      .map((document) => document._id)
      .join(', ')}. Review the dataset instead of mixing starter content into it.`,
  );
}

if (missingDocuments.length > 0) {
  const transaction = client.transaction();

  for (const document of seedDocuments) {
    transaction.createIfNotExists<Record<string, unknown>>(
      document as SeedDocument & Record<string, unknown>,
    );
  }

  await transaction.commit();
}

console.log(
  missingDocuments.length > 0
    ? `Bootstrap complete: ${seedDocuments.length} starter documents created.`
    : `Bootstrap already present: ${seedDocuments.length} starter documents preserved.`,
);

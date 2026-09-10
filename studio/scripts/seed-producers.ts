import { getCliClient } from 'sanity/cli';

import { SANITY_API_VERSION } from '../src/lib/sanity-api';
import { initialProducers } from './producer-seed-data';

const client = getCliClient({ apiVersion: SANITY_API_VERSION });

const transaction = client.transaction();
for (const producer of initialProducers) {
  transaction.createIfNotExists(producer);
}

await transaction.commit();

console.log(
  `Producers list ready: ${initialProducers.map((producer) => producer.name).join(', ')}.`,
);

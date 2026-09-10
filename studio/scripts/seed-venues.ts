import { getCliClient } from 'sanity/cli';

import { SANITY_API_VERSION } from '../src/lib/sanity-api';
import { initialVenues } from './venue-seed-data';

const client = getCliClient({ apiVersion: SANITY_API_VERSION });

const transaction = client.transaction();
for (const venue of initialVenues) {
  transaction.createIfNotExists(venue);
}

await transaction.commit();

console.log(`Venues list ready: ${initialVenues.map((venue) => venue.name).join(', ')}.`);

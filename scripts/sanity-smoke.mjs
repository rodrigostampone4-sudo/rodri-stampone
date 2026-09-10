import { createClient } from '@sanity/client';
import { createSanityConfig } from '../src/lib/sanity/config.ts';
import {
  eventsByDateQuery,
  siteSettingsCountQuery,
  siteSettingsQuery,
} from '../src/lib/sanity/queries.ts';
import { permanentLinkKinds } from '../src/types/content.ts';

const config = createSanityConfig({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
});
const allowedLinkKinds = new Set(permanentLinkKinds);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function assertHttpUrl(value, label) {
  assert(isNonEmptyString(value), `${label} is missing.`);

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} is not a valid URL.`);
  }

  assert(url.protocol === 'http:' || url.protocol === 'https:', `${label} must use HTTP or HTTPS.`);
}

function validateSiteSettings(siteSettings) {
  assert(siteSettings?._id === 'siteSettings', 'The stable siteSettings document was not found.');
  assert(isNonEmptyString(siteSettings.name), 'siteSettings.name is missing.');
  assert(Array.isArray(siteSettings.links), 'siteSettings.links must be an array.');

  siteSettings.links.forEach((link, index) => {
    const label = `siteSettings.links[${index}]`;
    assert(isNonEmptyString(link?.label), `${label}.label is missing.`);
    assertHttpUrl(link?.url, `${label}.url`);
    assert(allowedLinkKinds.has(link?.kind), `${label}.kind is invalid.`);
    assert(typeof link?.enabled === 'boolean', `${label}.enabled must be a boolean.`);
  });

  const profileInstagramLinks = siteSettings.links.filter(
    (link) => link?.kind === 'profileInstagram',
  );
  assert(
    profileInstagramLinks.length <= 1,
    'siteSettings.links must contain at most one profile Instagram link.',
  );
}

function validateEvents(events) {
  assert(Array.isArray(events), 'Events query did not return an array.');

  events.forEach((event, index) => {
    const label = `events[${index}]`;
    assert(isNonEmptyString(event?._id), `${label}._id is missing.`);
    assert(isNonEmptyString(event?.title), `${label}.title is missing.`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(event?.date ?? ''), `${label}.date is invalid.`);
    assert(isNonEmptyString(event?.venue), `${label}.venue is missing.`);
    assertHttpUrl(event?.url, `${label}.url`);
    assert(typeof event?.visible === 'boolean', `${label}.visible must be a boolean.`);
    assert(typeof event?.featured === 'boolean', `${label}.featured must be a boolean.`);

    if (event?.expiresAt) {
      assert(!Number.isNaN(Date.parse(event.expiresAt)), `${label}.expiresAt is invalid.`);
    }

    if (index > 0) {
      assert(events[index - 1].date <= event.date, 'Events are not ordered chronologically.');
    }
  });
}

async function main() {
  assert(config.projectId, 'PUBLIC_SANITY_PROJECT_ID is not configured.');

  const client = createClient({
    ...config,
    projectId: config.projectId,
  });

  const [siteSettingsCount, siteSettings, events] = await Promise.all([
    client.fetch(siteSettingsCountQuery),
    client.fetch(siteSettingsQuery),
    client.fetch(eventsByDateQuery),
  ]);

  assert(siteSettingsCount === 1, `Expected one siteSettings document, received ${siteSettingsCount}.`);
  validateSiteSettings(siteSettings);
  validateEvents(events);

  console.log('Sanity connection OK');
  console.log(`Site settings: ${siteSettings.name}`);
  console.log(`Permanent links: ${siteSettings.links.length}`);
  console.log(`Events: ${events.length}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown Sanity smoke error.';
  console.error(`Sanity smoke failed: ${message}`);
  process.exitCode = 1;
});

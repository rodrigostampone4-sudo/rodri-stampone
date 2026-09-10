import { createClient, type SanityClient } from '@sanity/client';
import { createSanityConfig } from './config';

export const sanityConfig = createSanityConfig({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
});

const projectId = sanityConfig.projectId;

/**
 * Remains null until a real Sanity project ID is supplied through the
 * environment. This keeps local Astro builds independent from Sanity setup.
 */
export const sanityClient: SanityClient | null = projectId
  ? createClient({
      ...sanityConfig,
      projectId,
    })
  : null;

export function getSanityClient(): SanityClient {
  if (!sanityClient) {
    throw new Error(
      'Sanity is not configured. Set PUBLIC_SANITY_PROJECT_ID before querying content.',
    );
  }

  return sanityClient;
}

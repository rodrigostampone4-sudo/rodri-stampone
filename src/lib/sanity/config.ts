export const SANITY_API_VERSION = '2025-01-01' as const;

export interface SanityEnvironment {
  projectId?: string;
  dataset?: string;
}

export interface SanityConfig {
  apiVersion: typeof SANITY_API_VERSION;
  dataset: string;
  perspective: 'published';
  useCdn: false;
  projectId?: string;
}

export function createSanityConfig({
  projectId: rawProjectId,
  dataset: rawDataset,
}: SanityEnvironment): SanityConfig {
  const projectId = rawProjectId?.trim();

  return {
    apiVersion: SANITY_API_VERSION,
    dataset: rawDataset?.trim() || 'production',
    perspective: 'published',
    // Astro reads this client only while building static pages. Bypassing the
    // CDN ensures a webhook-triggered rebuild sees the document just published.
    useCdn: false,
    ...(projectId ? { projectId } : {}),
  };
}

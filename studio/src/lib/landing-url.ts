const fallbackLandingUrl = 'https://rodri-stampone.vercel.app/';

export function resolveLandingUrl(value: string | undefined): string {
  if (!value?.trim()) {
    return fallbackLandingUrl;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' || url.username || url.password) {
      return fallbackLandingUrl;
    }

    return url.toString();
  } catch {
    return fallbackLandingUrl;
  }
}

export const landingUrl = resolveLandingUrl(import.meta.env.SANITY_STUDIO_LANDING_URL);

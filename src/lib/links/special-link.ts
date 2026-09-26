import type { ActiveSpecialLink, SpecialLink } from '../../types/content.ts';

export function getActiveSpecialLink(link?: SpecialLink | null): ActiveSpecialLink | null {
  if (link?.enabled !== true) {
    return null;
  }

  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
  const title = text(link.title);
  const url = text(link.url);
  const producer = text(link.producer);
  const venue = text(link.venue);

  if (!title || !url || !producer || !venue) {
    return null;
  }

  try {
    const destination = new URL(url);
    if (destination.protocol !== 'https:' || destination.username || destination.password) {
      return null;
    }
  } catch {
    return null;
  }

  const venueMapsUrl = text(link.venueMapsUrl);
  return {
    title,
    url,
    producer,
    venue,
    ...(venueMapsUrl ? { venueMapsUrl } : {}),
  };
}

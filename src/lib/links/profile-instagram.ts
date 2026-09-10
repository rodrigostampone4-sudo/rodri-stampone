import type { PermanentLink } from '../../types/content';

export function findProfileInstagramLink(
  links: PermanentLink[],
): PermanentLink | undefined {
  return links.find(
    (link) => link.enabled && link.kind === 'profileInstagram',
  );
}

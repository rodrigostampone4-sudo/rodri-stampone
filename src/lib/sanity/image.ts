import { createImageUrlBuilder } from '@sanity/image-url';

import type { SanityImage } from '../../types/content';
import { sanityConfig } from './client';

const builder = sanityConfig.projectId
  ? createImageUrlBuilder({
      projectId: sanityConfig.projectId,
      dataset: sanityConfig.dataset,
    })
  : undefined;

export function buildSanityImageUrl(
  image: SanityImage | undefined,
  width: number,
  quality = 82,
): string | undefined {
  if (!builder || !image?.asset?.url) {
    return undefined;
  }

  return builder
    .image(image)
    .width(width)
    .height(width)
    .fit('crop')
    .auto('format')
    .quality(quality)
    .url();
}

export function buildSanityImageSrcSet(
  image: SanityImage | undefined,
  widths: number[],
  quality = 82,
): string | undefined {
  const candidates = widths.flatMap((width) => {
    const url = buildSanityImageUrl(image, width, quality);
    return url ? [`${url} ${width}w`] : [];
  });

  return candidates.length > 0 ? candidates.join(', ') : undefined;
}

export const permanentLinkKinds = [
  'profileInstagram',
  'instagram',
  'whatsapp',
  'tables',
  'whatsappGroup',
  'custom',
] as const;

export type PermanentLinkKind = (typeof permanentLinkKinds)[number];

export interface SanityImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface SanityImage {
  _type: 'image';
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      dimensions?: SanityImageDimensions;
    };
  };
  alt?: string;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PermanentLink {
  label: string;
  url: string;
  kind: PermanentLinkKind;
  enabled: boolean;
}

export interface SiteSettings {
  name: string;
  instagramHandle?: string;
  profileImage?: SanityImage;
  bio?: string;
  links: PermanentLink[];
}

export interface Event {
  title: string;
  date: string;
  producerId: string;
  producer: string;
  venue: string;
  venueMapsUrl?: string;
  url: string;
  visible: boolean;
  featured: boolean;
  expiresAt?: string;
}

export interface EventRecord {
  _id: string;
  title?: string;
  date?: string;
  venue?: string;
  url?: string;
  visible?: boolean;
  featured?: boolean;
  expiresAt?: string;
}

export interface PermanentLinkRecord {
  _key?: string;
  label?: string;
  url?: string;
  kind?: string;
  enabled?: boolean;
}

export interface SiteSettingsRecord {
  name?: string;
  instagramHandle?: string;
  bio?: string;
  profileImage?: SanityImageReference;
  links?: PermanentLinkRecord[];
}

export interface SanityImageReference {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

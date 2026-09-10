export interface SeedLink {
  _key: string;
  label: string;
  url: string;
  kind: string;
  enabled: boolean;
}

export interface SeedSiteSettings {
  _id: string;
  _type: 'siteSettings';
  name: string;
  instagramHandle: string;
  links: SeedLink[];
}

export interface SeedReference {
  _type: 'reference';
  _ref: string;
}

export interface SeedEvent {
  _id: string;
  _type: 'event';
  title: string;
  date: string;
  venue: SeedReference;
  producer: SeedReference;
  url: string;
  visible: boolean;
  featured: boolean;
}

export const initialSiteSettings: SeedSiteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  name: 'Rodrigo Stampone',
  instagramHandle: '@rodri.stampone',
  links: [
    {
      _key: 'instagram',
      label: 'Instagram',
      url: 'https://www.instagram.com/rodri.stampone/',
      kind: 'profileInstagram',
      enabled: true,
    },
    {
      _key: 'whatsapp',
      label: 'WhatsApp',
      url: 'https://api.whatsapp.com/send?phone=5491126280658',
      kind: 'whatsapp',
      enabled: true,
    },
    {
      _key: 'tables',
      label: 'Mesas',
      url: 'https://api.whatsapp.com/send?phone=5491126280658&text=Hola%2C%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20mesas.',
      kind: 'tables',
      enabled: true,
    },
    {
      _key: 'whatsappGroup',
      label: 'Grupo de WhatsApp',
      url: 'https://chat.whatsapp.com/BCdUnJBNoUvGybGACduVF1',
      kind: 'whatsappGroup',
      enabled: true,
    },
    {
      _key: 'fourSideInstagram',
      label: '4SIDE',
      url: 'https://www.instagram.com/4side.prod/',
      kind: 'instagram',
      enabled: true,
    },
    {
      _key: 'fourTalentInstagram',
      label: '4Talent',
      url: 'https://www.instagram.com/4talent.agency/',
      kind: 'instagram',
      enabled: true,
    },
  ],
};

export const initialEvents: SeedEvent[] = [
  {
    _id: 'event-joris-voorn-2026-08-29',
    _type: 'event',
    title: 'JORIS VOORN',
    date: '2026-08-29',
    venue: { _type: 'reference', _ref: 'venue-amerika' },
    producer: { _type: 'reference', _ref: 'producer-elements' },
    url: 'https://planout.ar/eventos/es/comprarEvento?idEvento=1026&affId=rodrigostampone',
    visible: true,
    featured: false,
  },
  {
    _id: 'event-emiliano-de-marco-2026-09-05',
    _type: 'event',
    title: 'EMILIANO DE MARCO',
    date: '2026-09-05',
    venue: { _type: 'reference', _ref: 'venue-the-bow' },
    producer: { _type: 'reference', _ref: 'producer-elements' },
    url: 'https://wearebombo.app.link/EixaMwkST2b',
    visible: true,
    featured: false,
  },
  {
    _id: 'event-adam-sellouk-2026-09-11',
    _type: 'event',
    title: 'ADAM SELLOUK',
    date: '2026-09-11',
    venue: { _type: 'reference', _ref: 'venue-crobar' },
    producer: { _type: 'reference', _ref: 'producer-elements' },
    url: 'https://wearebombo.app.link/tSn5ewieV5b',
    visible: true,
    featured: false,
  },
  {
    _id: 'event-pavel-petrov-2026-09-25',
    _type: 'event',
    title: 'PAVEL PETROV',
    date: '2026-09-25',
    venue: { _type: 'reference', _ref: 'venue-elements-club' },
    producer: { _type: 'reference', _ref: 'producer-elements' },
    url: 'https://venti.live/evento/elements-X-external-pres-pavel-patrol',
    visible: true,
    featured: false,
  },
  {
    _id: 'event-then-2026-10-16',
    _type: 'event',
    title: 'TH;EN',
    date: '2026-10-16',
    venue: { _type: 'reference', _ref: 'venue-the-bow' },
    producer: { _type: 'reference', _ref: 'producer-elements' },
    url: 'https://wearebombo.app.link/hslL2aozT5b',
    visible: true,
    featured: false,
  },
];

export interface SeedVenue {
  _id: string;
  _type: 'venue';
  name: string;
}

export const initialVenues: SeedVenue[] = [
  { _id: 'venue-amerika', _type: 'venue', name: 'Amerika' },
  { _id: 'venue-the-bow', _type: 'venue', name: 'The Bow' },
  { _id: 'venue-palacio-alsina', _type: 'venue', name: 'Palacio Alsina' },
  { _id: 'venue-elements-club', _type: 'venue', name: 'Elements Club' },
  { _id: 'venue-native', _type: 'venue', name: 'Native' },
  { _id: 'venue-the-lift', _type: 'venue', name: 'The Lift' },
  { _id: 'venue-crobar', _type: 'venue', name: 'Crobar' },
];

export interface SeedProducer {
  _id: string;
  _type: 'producer';
  name: string;
}

export const initialProducers: SeedProducer[] = [
  { _id: 'producer-4side', _type: 'producer', name: '4SIDE' },
  { _id: 'producer-elements', _type: 'producer', name: 'Elements' },
];

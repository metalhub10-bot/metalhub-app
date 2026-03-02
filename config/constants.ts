export const METALS = [
  'Cobre',
  'Aluminio',
  'Hierro',
  'Bronce',
  'Acero',
  'Plomo',
  'Zinc',
  'Inoxidable',
  'Chatarra Mixta',
  'Otro',
] as const;

export const SORT_OPTIONS = [
  { id: 'recent', label: 'Más reciente' },
  { id: 'price_asc', label: 'Menor precio' },
  { id: 'price_desc', label: 'Mayor precio' },
  { id: 'reputation', label: 'Mejor reputación' },
  { id: 'volume', label: 'Mayor volumen' },
] as const;

export const DELIVERY_OPTIONS: { id: string; label: string; icon: 'cube-outline' | 'calendar-outline' | 'car-outline' }[] = [
  { id: 'pickup_now', label: 'Retiro inmediato', icon: 'cube-outline' },
  { id: 'pickup_coord', label: 'Coordinar retiro', icon: 'calendar-outline' },
  { id: 'shipping', label: 'Envío disponible', icon: 'car-outline' },
];

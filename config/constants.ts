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

export const METAL_GROUPS = [
  { id: 'cobre', label: 'Cobre', variants: ['1ra', '2da'] },
  { id: 'bronce', label: 'Bronce', variants: ['Colorado', 'Latón', 'Trafilado', 'Común'] },
  { id: 'aluminios', label: 'Aluminios', variants: ['Blando', 'Llantas', 'Duro', 'Latitas', 'Perfil'] },
  { id: 'estannado', label: 'Estañado', variants: ['Calefón'] },
  { id: 'plomo', label: 'Plomo', variants: ['Balanceo', 'Cañería'] },
  { id: 'baterias', label: 'Baterías', variants: ['Secas', 'Llenas', 'De gel'] },
  { id: 'bochas', label: 'Bochas' },
  { id: 'niquel', label: 'Níquel' },
  { id: 'radiador', label: 'Radiador', variants: ['Mixtos', 'Panel de bronce', 'Aluminio'] },
  { id: 'pasta', label: 'Pasta' },
  { id: 'viruta', label: 'Viruta', variants: ['Aluminio', 'Bronce', 'Hierro'] },
  { id: 'chatarra_electronica', label: 'Chatarra electrónica' },
  { id: 'mercurio', label: 'Mercurio' },
  { id: 'maquinarias', label: 'Maquinarias en desuso' },
  { id: 'hierro', label: 'Hierro', variants: ['Chatarra', 'Pesado', 'Chico'] },
  { id: 'carton', label: 'Cartón', variants: ['Blanco', 'Afiche', 'Conos', 'Diarios'] },
  { id: 'plastico', label: 'Plástico' },
  { id: 'otro', label: 'Otro' },
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

export const REGIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque',
  'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou',
];

export const PROPERTY_TYPES = ['maison', 'appartement', 'terrain', 'plan'];

export const TYPE_LABELS: Record<string, string> = {
  maison: 'Maison', appartement: 'Appartement', terrain: 'Terrain', plan: 'Plan archi.',
};

export const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', draft: 'outline', sold: 'destructive', suspended: 'secondary',
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Actif', draft: 'Brouillon', sold: 'Vendu', suspended: 'Suspendu',
};

export const formatPrice = (price: number | string) => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
};

export const formatDate = (date: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (date: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

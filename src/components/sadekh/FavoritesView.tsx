'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import PropertyCard from './PropertyCard';
import type { Property, FavItem } from '@/lib/types';

export default function FavoritesView({
  favorites,
  favoriteIds,
  compareIds,
  onToggleFavorite,
  onToggleCompare,
  onOpenProperty,
}: {
  favorites: FavItem[] | undefined;
  favoriteIds: Set<string>;
  compareIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpenProperty: (p: Property) => void;
}) {
  const { lang, setView } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-7 h-7 text-red-500" />
        <h1 className="text-2xl font-bold">{t('favorites.title', lang)}</h1>
        <Badge variant="secondary">{(favorites || []).length}</Badge>
      </div>
      {!favorites || favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('favorites.empty', lang)}</h3>
          <p className="text-muted-foreground mb-6">{t('favorites.empty.desc', lang)}</p>
          <Button onClick={() => setView('listing')}>{t('nav.properties', lang)}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((f: FavItem) => (
            <PropertyCard
              key={f.id}
              p={f.property}
              favoriteIds={favoriteIds}
              compareIds={compareIds}
              onToggleFavorite={onToggleFavorite}
              onToggleCompare={onToggleCompare}
              onOpen={onOpenProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import PropertyCard from './PropertyCard';
import Filters from './Filters';
import MapView from './MapView';
import type { Property } from '@/lib/types';

export default function Listing({
  properties,
  pagination,
  loadingProperties,
  favoriteIds,
  compareIds,
  onToggleFavorite,
  onToggleCompare,
  onOpenProperty,
}: {
  properties: Property[];
  pagination: any;
  loadingProperties: boolean;
  favoriteIds: Set<string>;
  compareIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpenProperty: (p: Property) => void;
}) {
  const { lang, listingView, page, setPage, filters, setFilters, setSearchQuery, resetFilters } = useStore();

  return (
    <div className="min-h-screen">
      <Filters total={pagination.total} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {listingView === 'map' ? (
          <div className="rounded-xl overflow-hidden border border-border shadow-lg" style={{ height: 'calc(100vh - 200px)' }}>
            <MapView properties={properties} lang={lang} onPropertyClick={onOpenProperty} />
          </div>
        ) : loadingProperties ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('common.noResults', lang)}</h3>
            <Button variant="outline" onClick={resetFilters}>
              {t('common.retry', lang)}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  p={p}
                  favoriteIds={favoriteIds}
                  compareIds={compareIds}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  onOpen={onOpenProperty}
                />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="w-9">
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="icon" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

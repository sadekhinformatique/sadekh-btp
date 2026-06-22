'use client';

import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPinned, HandCoins, ArrowUpDown, LayoutGrid, MapIcon } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import type { PropertyType } from '@/lib/types';

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou'];

export default function Filters({ total }: { total: number }) {
  const { lang, filters, updateFilter, listingView, setListingView } = useStore();

  return (
    <div className="bg-card border-b border-border sticky top-[68px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-muted rounded-lg p-0.5 mr-2">
            <button onClick={() => setListingView('grid')} className={`p-1.5 rounded-md transition-all ${listingView === 'grid' ? 'bg-white shadow-sm' : ''}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setListingView('map')} className={`p-1.5 rounded-md transition-all ${listingView === 'map' ? 'bg-white shadow-sm' : ''}`}>
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex bg-muted rounded-lg p-0.5">
            {(['all', 'maison', 'appartement', 'terrain', 'plan'] as PropertyType[]).map((type) => (
              <button
                key={type}
                onClick={() => updateFilter('type', type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filters.type === type ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`filter.${type}`, lang)}
              </button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <Select value={filters.region} onValueChange={(v) => updateFilter('region', v)}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <MapPinned className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder={t('filter.region', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filter.all', lang)}</SelectItem>
              {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.maxPrice} onValueChange={(v) => updateFilter('maxPrice', v)}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <HandCoins className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder={t('filter.price', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filter.all', lang)}</SelectItem>
              <SelectItem value="20000000">20M FCFA</SelectItem>
              <SelectItem value="50000000">50M FCFA</SelectItem>
              <SelectItem value="75000000">75M FCFA</SelectItem>
              <SelectItem value="100000000">100M FCFA</SelectItem>
              <SelectItem value="150000000">150M FCFA</SelectItem>
              <SelectItem value="200000000">200M FCFA</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sort} onValueChange={(v) => updateFilter('sort', v)}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder={t('filter.sort', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('filter.sort.recent', lang)}</SelectItem>
              <SelectItem value="priceAsc">{t('filter.sort.priceAsc', lang)}</SelectItem>
              <SelectItem value="priceDesc">{t('filter.sort.priceDesc', lang)}</SelectItem>
              <SelectItem value="views">{t('filter.sort.views', lang)}</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto text-sm text-muted-foreground">
            {total} {t('filter.results', lang)}
          </div>
        </div>
      </div>
    </div>
  );
}

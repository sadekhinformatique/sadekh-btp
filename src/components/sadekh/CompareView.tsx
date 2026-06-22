'use client';

import { Check, X, Crown, ArrowUpDown } from 'lucide-react';
import { t, formatPrice } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import type { Property } from '@/lib/types';

export default function CompareView({
  properties,
  compareIds,
}: {
  properties: Property[];
  compareIds: string[];
}) {
  const { lang } = useStore();
  const compareProperties = properties.filter((p) => compareIds.includes(p.id));

  if (compareIds.length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ArrowUpDown className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('compare.title', lang)}</h2>
        <p className="text-muted-foreground">{t('compare.empty', lang)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('compare.title', lang)}</h1>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-3 text-left w-40" />
              {compareProperties.map((p) => (
                <th key={p.id} className="p-3 text-left min-w-[250px]">
                  <img src={p.images[0]} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />
                  <div className="font-semibold">{p.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Prix', render: (p: Property) => formatPrice(p.price, lang) },
              { label: 'Type', render: (p: Property) => t(`filter.${p.type}`, lang) },
              { label: 'Surface', render: (p: Property) => p.surfaceM2 ? `${p.surfaceM2} m²` : '—' },
              { label: 'Pièces', render: (p: Property) => p.rooms || '—' },
              { label: 'Région', render: (p: Property) => p.region },
              { label: 'Quartier', render: (p: Property) => p.quartier },
              { label: 'Titre foncier', render: (p: Property) => p.titleFoncier ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-400" /> },
              { label: 'Négociable', render: (p: Property) => p.priceNegotiable ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-400" /> },
              { label: 'Vues', render: (p: Property) => p.viewsCount },
              { label: 'Premium', render: (p: Property) => p.isPremium ? <Crown className="w-5 h-5 text-amber-500" /> : <X className="w-5 h-5 text-muted-foreground" /> },
            ].map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="p-3 font-medium text-sm text-muted-foreground">{row.label}</td>
                {compareProperties.map((p) => (
                  <td key={p.id} className="p-3 text-sm">{row.render(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

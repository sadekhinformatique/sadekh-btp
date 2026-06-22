'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search, Grid3X3, Home, Building2, MapPin, FileText } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import type { PropertyType } from '@/lib/types';

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou'];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  maison: <Home className="w-5 h-5" />,
  appartement: <Building2 className="w-5 h-5" />,
  terrain: <MapPin className="w-5 h-5" />,
  plan: <FileText className="w-5 h-5" />,
};

export default function Hero({ stats }: { stats?: any }) {
  const { lang, filters, updateFilter, setView, handleSearch, siteSettings } = useStore();
  const [query, setQuery] = useState('');

  return (
    <section className="hero-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-300 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 max-w-4xl">
            {lang === 'wo'
              ? (siteSettings?.heroTitleWo || t('hero.title', lang))
              : (siteSettings?.heroTitleFr || t('hero.title', lang))}
          </h1>
          <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-2xl">
            {lang === 'wo'
              ? (siteSettings?.heroSubtitleWo || t('hero.subtitle', lang))
              : (siteSettings?.heroSubtitleFr || t('hero.subtitle', lang))}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-2xl">
          <div className="flex bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('hero.search.placeholder', lang)}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                className="w-full h-14 pl-12 pr-4 text-gray-900 text-base outline-none"
              />
            </div>
            <Button
              onClick={() => handleSearch(query)}
              className="h-14 px-6 bg-primary hover:bg-primary/90 text-white rounded-none text-base font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              {t('hero.search.btn', lang)}
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-3 mt-8">
          {(['all', 'maison', 'appartement', 'terrain', 'plan'] as PropertyType[]).map((type) => (
            <button
              key={type}
              onClick={() => { updateFilter('type', type); setView('listing'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                filters.type === type
                  ? 'bg-white text-primary shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
              }`}
            >
              {TYPE_ICONS[type] || <Grid3X3 className="w-4 h-4" />}
              {t(`filter.${type}`, lang)}
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-8 mt-12">
          {[
            { value: stats?.totalProperties || 16, label: t('hero.stats.properties', lang) },
            { value: stats?.totalUsers || 6, label: t('hero.stats.agents', lang) },
            { value: REGIONS.length, label: t('hero.stats.regions', lang) },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-green-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

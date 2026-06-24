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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0000] via-[#1a0000] to-[#2a0000]">
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-red-500 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 right-10 w-[600px] h-[600px] bg-red-600 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-5 max-w-4xl tracking-tight">
            {lang === 'wo'
              ? (siteSettings?.heroTitleWo || t('hero.title', lang))
              : (siteSettings?.heroTitleFr || t('hero.title', lang))}
          </h1>
          <p className="text-lg sm:text-xl text-red-200/90 mb-10 max-w-2xl leading-relaxed">
            {lang === 'wo'
              ? (siteSettings?.heroSubtitleWo || t('hero.subtitle', lang))
              : (siteSettings?.heroSubtitleFr || t('hero.subtitle', lang))}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-xl">
          <div className="flex bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden ring-1 ring-white/10">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
              className="h-14 px-7 bg-primary hover:bg-red-700 text-white rounded-none text-base font-semibold rounded-r-2xl"
            >
              {t('hero.search.btn', lang)}
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-2 mt-8">
          {(['all', 'maison', 'appartement', 'terrain', 'plan'] as PropertyType[]).map((type) => (
            <button
              key={type}
              onClick={() => { updateFilter('type', type); setView('listing'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                filters.type === type
                  ? 'bg-white text-red-700 shadow-lg shadow-red-500/20'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm border border-white/10'
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
              <div className="text-red-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Building2, MapPin, FileText, Heart, ArrowUpDown, Crown, MapPinIcon, Ruler, DoorOpen, Eye, Gavel, Shield } from 'lucide-react';
import { t, formatPrice } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import type { Property } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  maison: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  appartement: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
  terrain: 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
  plan: 'bg-gray-300 text-gray-900 dark:bg-gray-600/50 dark:text-gray-200',
};

export default function PropertyCard({
  p,
  favoriteIds,
  compareIds,
  onToggleFavorite,
  onToggleCompare,
  onOpen,
}: {
  p: Property;
  favoriteIds: Set<string>;
  compareIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpen: (p: Property) => void;
}) {
  const { lang } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="property-card overflow-hidden border border-border h-full flex flex-col group cursor-pointer" onClick={() => onOpen(p)}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={p.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'}
            alt={p.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge className={TYPE_COLORS[p.type] || ''}>{t(`filter.${p.type}`, lang)}</Badge>
            {p.isPremium && (
              <Badge className="bg-red-600 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                <span className="premium-badge font-bold">Premium</span>
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.id); }}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${favoriteIds.has(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(p.id); }}
              className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors ${compareIds.includes(p.id) ? 'ring-2 ring-primary' : ''}`}
            >
              <ArrowUpDown className={`w-4 h-4 ${compareIds.includes(p.id) ? 'text-primary' : 'text-gray-600'}`} />
            </button>
          </div>
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg">
              <div className="font-bold text-lg">{formatPrice(p.price, lang)}</div>
              {p.priceNegotiable && <div className="text-xs text-red-300">{t('property.negotiable', lang)}</div>}
            </div>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col gap-2">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{p.quartier}, {p.city || p.region}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {p.surfaceM2 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <Ruler className="w-3 h-3" /> {p.surfaceM2} m²
              </span>
            )}
            {p.rooms && p.rooms > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <DoorOpen className="w-3 h-3" /> {p.rooms} {t('property.rooms', lang)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Eye className="w-3 h-3" /> {p.viewsCount}
            </span>
            {p.titleFoncier && (
              <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30 px-2 py-1 rounded-md">
                <Gavel className="w-3 h-3" /> {t('property.titleFoncier', lang)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {(p.user?.profile?.fullName || p.user?.name || '?')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{p.user?.profile?.fullName || p.user?.name}</div>
              {p.user?.profile?.agencyName && <div className="text-xs text-muted-foreground truncate">{p.user.profile.agencyName}</div>}
            </div>
            {p.user?.profile?.verified && <Shield className="w-4 h-4 text-primary shrink-0" />}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

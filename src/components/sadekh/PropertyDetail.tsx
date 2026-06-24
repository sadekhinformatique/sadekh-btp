'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Crown, MapPinIcon, Ruler, DoorOpen, Eye, Check, Building, Shield, MessageCircle, Send, CreditCard, Zap, ArrowUpDown, Share2, Flag, X } from 'lucide-react';
import { t, formatPrice } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import type { Property } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  maison: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  appartement: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
  terrain: 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
  plan: 'bg-gray-300 text-gray-900 dark:bg-gray-600/50 dark:text-gray-200',
};

export default function PropertyDetail({
  p,
  favoriteIds,
  onToggleFavorite,
  onSetPayment,
}: {
  p: Property | null;
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSetPayment: (p: Property, type: 'boost' | 'plan' | 'premium') => void;
}) {
  const { lang, showDetail, setShowDetail, setView } = useStore();
  if (!p) return null;

  return (
    <Dialog open={showDetail} onOpenChange={setShowDetail}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          <div className="aspect-[16/9] sm:aspect-[2/1] w-full overflow-hidden rounded-t-lg">
            <img
              src={p.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop'}
              alt={p.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={TYPE_COLORS[p.type] || ''}>{t(`filter.${p.type}`, lang)}</Badge>
            {p.isPremium && <Badge className="bg-red-600 text-white"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
          </div>
          <div className="absolute top-4 right-4">
            <button onClick={() => onToggleFavorite(p.id)} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white">
              <Heart className={`w-5 h-5 ${favoriteIds.has(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
          {p.images.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2 overflow-x-auto max-w-[80%]">
              {p.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-16 h-12 rounded-md object-cover border-2 border-white/50 cursor-pointer hover:border-white transition-colors" />
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{p.title}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPinIcon className="w-4 h-4" />
                <span>{p.quartier}, {p.city || p.region}, Sénégal</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-primary">{formatPrice(p.price, lang)}</div>
              {p.priceNegotiable && <Badge variant="secondary" className="mt-1">{t('property.negotiable', lang)}</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {p.surfaceM2 && (
              <div className="bg-muted rounded-lg p-3 text-center">
                <Ruler className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="font-bold text-lg">{p.surfaceM2} m²</div>
                <div className="text-xs text-muted-foreground">Surface</div>
              </div>
            )}
            {p.rooms && p.rooms > 0 && (
              <div className="bg-muted rounded-lg p-3 text-center">
                <DoorOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="font-bold text-lg">{p.rooms}</div>
                <div className="text-xs text-muted-foreground">{t('property.rooms', lang)}</div>
              </div>
            )}
            <div className="bg-muted rounded-lg p-3 text-center">
              <Eye className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="font-bold text-lg">{p.viewsCount}</div>
              <div className="text-xs text-muted-foreground">{t('property.views', lang)}</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <MapPinIcon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="font-bold text-lg">{p.region}</div>
              <div className="text-xs text-muted-foreground">{t('detail.location', lang)}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {p.titleFoncier && (
              <Badge variant="outline" className="border-red-500 text-red-700 dark:text-red-400 gap-1 py-1">
                <Check className="w-3 h-3" /> {t('property.titleFoncier', lang)}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1 py-1">
              <Building className="w-3 h-3" /> {t(`filter.${p.type}`, lang)}
            </Badge>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">{t('detail.description', lang)}</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{p.description}</p>
          </div>

          <div className="bg-muted rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                {(p.user?.profile?.fullName || p.user?.name || '?')[0]}
              </div>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {p.user?.profile?.fullName || p.user?.name}
                  {p.user?.profile?.verified && (
                    <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                      <Shield className="w-3 h-3" /> {t('detail.verified', lang)}
                    </Badge>
                  )}
                </div>
                {p.user?.profile?.agencyName && <div className="text-sm text-muted-foreground">{p.user.profile.agencyName}</div>}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {p.user?.profile?.whatsapp && (
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2 h-12 text-base"
                onClick={() => window.open(`https://wa.me/${p.user.profile.whatsapp.replace('+', '')}?text=Bonjour, je suis intéressé par: ${encodeURIComponent(p.title)}`, '_blank')}
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </Button>
            )}
            <Button variant="outline" className="flex-1 gap-2 h-12" onClick={() => setView('messages')}>
              <Send className="w-5 h-5" /> {t('property.contact', lang)}
            </Button>
            {p.type === 'plan' && (
              <Button variant="outline" className="flex-1 gap-2 h-12 border-red-500 text-red-700" onClick={() => onSetPayment(p, 'plan')}>
                <CreditCard className="w-5 h-5" /> {t('detail.downloadPlan', lang)} — {formatPrice(p.price, lang)}
              </Button>
            )}
            {p.type !== 'plan' && (
              <Button variant="outline" size="icon" className="h-12 w-12 text-red-600 border-red-300 hover:bg-red-50" onClick={() => onSetPayment(p, 'boost')} title="Booster cette annonce">
                <Zap className="w-5 h-5" />
              </Button>
            )}
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 text-destructive hover:text-destructive">
              <Flag className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

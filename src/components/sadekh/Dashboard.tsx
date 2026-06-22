'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Building, Eye, MessageCircle, HandCoins, Plus, CreditCard, Zap, Crown, FileText } from 'lucide-react';
import { t, formatPrice } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import PropertyCard from './PropertyCard';
import type { Property, Message } from '@/lib/types';

export default function Dashboard({
  stats,
  paymentsList,
  properties,
  messages,
  favoriteIds,
  compareIds,
  onToggleFavorite,
  onToggleCompare,
  onOpenProperty,
}: {
  stats: any;
  paymentsList: any[];
  properties: Property[];
  messages: Message[];
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
        <BarChart3 className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold">{t('dashboard.title', lang)}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('dashboard.activeProperties', lang), value: stats?.activeProperties || 16, icon: <Building className="w-5 h-5" />, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
          { label: t('dashboard.totalViews', lang), value: stats?.totalViews || 0, icon: <Eye className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { label: t('dashboard.totalContacts', lang), value: stats?.totalMessages || 4, icon: <MessageCircle className="w-5 h-5" />, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
          { label: t('dashboard.payments', lang), value: stats?.premiumProperties || 0, icon: <HandCoins className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {paymentsList.length > 0 && (
        <Card className="p-4 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-600" /> {lang === 'fr' ? 'Historique des paiements' : 'Historiq pajamaan'}</h2>
          <div className="space-y-3">
            {paymentsList.slice(0, 5).map((pay: any) => (
              <div key={pay.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${pay.type === 'boost' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : pay.type === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {pay.type === 'boost' ? <Zap className="w-4 h-4" /> : pay.type === 'premium' ? <Crown className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{pay.type === 'boost' ? 'Boost' : pay.type === 'premium' ? 'Premium' : 'Plan'} · <span className={`font-mono text-xs ${pay.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>{pay.status}</span></div>
                  <div className="text-xs text-muted-foreground">{pay.method === 'wave' ? 'Wave' : 'Orange Money'} · {pay.refWave || pay.id?.slice(0, 12)}</div>
                </div>
                <div className="text-sm font-bold text-primary shrink-0">{formatPrice(pay.amount, lang)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('dashboard.myProperties', lang)}</h2>
          <Button size="sm" onClick={() => setView('publish')} className="gap-1"><Plus className="w-4 h-4" /> {t('nav.publish', lang)}</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.slice(0, 6).map((p) => (
            <PropertyCard key={p.id} p={p} favoriteIds={favoriteIds} compareIds={compareIds} onToggleFavorite={onToggleFavorite} onToggleCompare={onToggleCompare} onOpen={onOpenProperty} />
          ))}
        </div>
      </div>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">{t('dashboard.recentMessages', lang)}</h2>
        <div className="space-y-3">
          {(messages || []).slice(0, 5).map((m: Message) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {(m.sender?.profile?.fullName || m.sender?.name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{m.sender?.profile?.fullName || m.sender?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{m.content}</div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

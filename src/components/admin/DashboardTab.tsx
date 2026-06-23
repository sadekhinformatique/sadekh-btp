'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3, Building2, Home, Users, MessageSquare, Crown, Star, Eye,
  TrendingUp, CircleDollarSign,
} from 'lucide-react';
import { PROPERTY_TYPES, TYPE_LABELS, formatPrice } from './constants';

interface Props {
  stats: any;
  isLoading: boolean;
}

export default function DashboardTab({ stats, isLoading }: Props) {
  const s = stats || {};
  const chartData = PROPERTY_TYPES.map((t) => ({
    label: TYPE_LABELS[t],
    value: s.byType?.[t] || 0,
  }));
  const maxVal = Math.max(...chartData.map((d) => d.value), 1);
  const topAnnonces = s.topAnnonces || [];

  const statCards = [
    { label: 'Total biens', value: s.totalProperties ?? 0, icon: <Building2 className="h-5 w-5" />, color: 'text-blue-600 bg-blue-100' },
    { label: 'Biens actifs', value: s.activeProperties ?? 0, icon: <Home className="h-5 w-5" />, color: 'text-green-600 bg-green-100' },
    { label: 'Utilisateurs', value: s.totalUsers ?? 0, icon: <Users className="h-5 w-5" />, color: 'text-purple-600 bg-purple-100' },
    { label: 'Messages', value: s.totalMessages ?? 0, icon: <MessageSquare className="h-5 w-5" />, color: 'text-orange-600 bg-orange-100' },
    { label: 'Premium', value: s.premiumProperties ?? 0, icon: <Crown className="h-5 w-5" />, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Favoris', value: s.totalFavorites ?? 0, icon: <Star className="h-5 w-5" />, color: 'text-pink-600 bg-pink-100' },
    { label: 'Vues totales', value: s.totalViews ?? 0, icon: <Eye className="h-5 w-5" />, color: 'text-cyan-600 bg-cyan-100' },
    { label: 'Revenus estimés', value: s.estimatedRevenue ?? 0, icon: <CircleDollarSign className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-100', isPrice: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre marketplace</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card key={card.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-2xl font-bold mt-1">
                        {(card as any).isPrice ? formatPrice(card.value) : (card.value as number).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${card.color}`}>{card.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Biens par type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.map((d) => (
                    <div key={d.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{d.label}</span>
                        <span className="font-medium">{d.value}</span>
                      </div>
                      <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.value / maxVal) * 100}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: '#1B5E20' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top annonces
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topAnnonces.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {topAnnonces.slice(0, 5).map((a: any, i: number) => (
                      <div key={a.id || i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                          <span className="text-sm truncate">{a.title || 'Sans titre'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                          <Eye className="h-3.5 w-3.5" />
                          {a.views || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

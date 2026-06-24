'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, Eye, Crown, MessageSquare, Heart, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  totalProperties: number;
  activeProperties: number;
  totalUsers: number;
  totalViews: number;
  premiumProperties: number;
  totalMessages: number;
  totalFavorites: number;
  propertiesByType: { type: string; _count: { id: number } }[];
  recentProperties: { id: string; title: string; type: string; price: number; viewsCount: number }[];
  revenue?: number;
}

const TYPE_LABELS: Record<string, string> = {
  maison: 'Maison',
  appartement: 'Appartement',
  terrain: 'Terrain',
  plan: 'Plan',
};

export default function OverviewSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erreur de chargement : {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Propriétés', value: stats.totalProperties, icon: Building2, color: 'text-blue-600 bg-blue-100' },
    { label: 'Actives', value: stats.activeProperties, icon: Clock, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Premium', value: stats.premiumProperties, icon: Crown, color: 'text-amber-600 bg-amber-100' },
    { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'text-purple-600 bg-purple-100' },
    { label: 'Vues', value: stats.totalViews, icon: Eye, color: 'text-rose-600 bg-rose-100' },
    { label: 'Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-cyan-600 bg-cyan-100' },
    { label: 'Favoris', value: stats.totalFavorites, icon: Heart, color: 'text-pink-600 bg-pink-100' },
    { label: 'Revenus', value: stats.revenue ? `${(stats.revenue / 1000).toFixed(0)}k` : '—', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenue dans votre panneau d'administration</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value?.toLocaleString('fr-FR')}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties by type */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Biens par type</h2>
          <div className="space-y-3">
            {stats.propertiesByType?.map((item) => {
              const max = Math.max(...stats.propertiesByType.map((b) => b._count.id), 1);
              const pct = (item._count.id / max) * 100;
              return (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{TYPE_LABELS[item.type] || item.type}</span>
                    <span className="font-medium">{item._count.id}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!stats.propertiesByType || stats.propertiesByType.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Aucune donnée</p>
            )}
          </div>
        </div>

        {/* Recent properties */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Dernières annonces</h2>
          <div className="space-y-2">
            {stats.recentProperties?.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{TYPE_LABELS[p.type] || p.type}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium">{p.price?.toLocaleString('fr-FR')} F</p>
                  <p className="text-xs text-gray-400">{p.viewsCount} vues</p>
                </div>
              </div>
            ))}
            {(!stats.recentProperties || stats.recentProperties.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Aucune annonce</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, Eye, Crown, MessageSquare, Heart, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';

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
  maison: 'Maison', appartement: 'Appartement', terrain: 'Terrain', plan: 'Plan',
};

const CARDS = [
  { label: 'Propriétés', key: 'totalProperties' as const, icon: Building2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  { label: 'Actives', key: 'activeProperties' as const, icon: Clock, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { label: 'Premium', key: 'premiumProperties' as const, icon: Crown, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
  { label: 'Utilisateurs', key: 'totalUsers' as const, icon: Users, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
  { label: 'Vues totales', key: 'totalViews' as const, icon: Eye, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-600' },
  { label: 'Messages', key: 'totalMessages' as const, icon: MessageSquare, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { label: 'Favoris', key: 'totalFavorites' as const, icon: Heart, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-600' },
];

export default function OverviewSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => { if (data.error) throw new Error(data.error); setStats(data); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-green-100/50" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl animate-pulse border border-green-100/50" />
      </div>
    );
  }

  if (error) return <ErrorDisplay message={error} />;
  if (!stats) return null;

  const maxTypeCount = Math.max(...(stats.propertiesByType?.map((b) => b._count.id) || [1]), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Vue d'ensemble</h1>
          <p className="text-sm text-green-600 mt-1">Bienvenue dans votre panneau d'administration</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-green-100 text-sm text-green-600 shadow-sm">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const val = stats[card.key];
          return (
            <div key={card.label} className="group bg-white rounded-2xl border border-green-100/70 p-5 hover:shadow-lg hover:shadow-green-100/50 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-green-900 mt-1.5">
                    {typeof val === 'number' ? val.toLocaleString('fr-FR') : val || '—'}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${card.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-green-100/70 p-6 shadow-sm">
          <h2 className="font-bold text-green-900 mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-green-600 rounded-full" />
            Biens par type
          </h2>
          <div className="space-y-4">
            {stats.propertiesByType?.map((item) => {
              const pct = (item._count.id / maxTypeCount) * 100;
              const colors: Record<string, string> = {
                maison: 'bg-emerald-500', appartement: 'bg-blue-500',
                terrain: 'bg-amber-500', plan: 'bg-purple-500',
              };
              return (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-green-800">{TYPE_LABELS[item.type] || item.type}</span>
                    <span className="font-bold text-green-600">{item._count.id}</span>
                  </div>
                  <div className="h-2.5 bg-green-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${colors[item.type] || 'bg-green-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!stats.propertiesByType || stats.propertiesByType.length === 0) && (
              <p className="text-sm text-green-400 text-center py-6">Aucune donnée</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-green-100/70 p-6 shadow-sm">
          <h2 className="font-bold text-green-900 mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-green-600 rounded-full" />
            Dernières annonces
          </h2>
          <div className="space-y-1">
            {stats.recentProperties?.slice(0, 6).map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between py-3 ${i < 5 ? 'border-b border-green-50' : ''} hover:bg-green-50/50 rounded-lg px-2 -mx-2 transition-colors`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-bold text-green-400 w-5 shrink-0">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-green-900 truncate">{p.title}</p>
                    <p className="text-xs text-green-500">{TYPE_LABELS[p.type] || p.type}</p>
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-sm font-bold text-green-800">{p.price?.toLocaleString('fr-FR')} F</p>
                  <p className="text-xs text-green-400 flex items-center gap-1 justify-end">
                    <Eye className="w-3 h-3" /> {p.viewsCount}
                  </p>
                </div>
              </div>
            ))}
            {(!stats.recentProperties || stats.recentProperties.length === 0) && (
              <p className="text-sm text-green-400 text-center py-8">Aucune annonce récente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-green-900 mb-2">Erreur de chargement</h2>
        <p className="text-sm text-green-600 mb-4">{message}</p>
        <button onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors shadow-md shadow-green-200">
          Réessayer
        </button>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Shield, Users, Building, AlertTriangle, TrendingUp, Eye, Home, Building2, MapPin, FileText } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  maison: <Home className="w-5 h-5" />,
  appartement: <Building2 className="w-5 h-5" />,
  terrain: <MapPin className="w-5 h-5" />,
  plan: <FileText className="w-5 h-5" />,
};

export default function AdminView({ stats }: { stats: any }) {
  const { lang, currentUser } = useStore();

  if (!currentUser || currentUser.profile?.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('admin.accessDenied', lang)}</h2>
        <p className="text-muted-foreground">{t('admin.notAdmin', lang)}</p>
        <p className="text-sm text-muted-foreground mt-2">{t('admin.loginRequired', lang)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold">{t('admin.title', lang)}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('admin.users', lang), value: stats?.totalUsers || 6, icon: <Users className="w-5 h-5" /> },
          { label: t('hero.stats.properties', lang), value: stats?.totalProperties || 16, icon: <Building className="w-5 h-5" /> },
          { label: t('admin.reports', lang), value: 0, icon: <AlertTriangle className="w-5 h-5" /> },
          { label: t('admin.revenue', lang), value: `${((stats?.premiumProperties || 0) * 5000).toLocaleString()} F`, icon: <TrendingUp className="w-5 h-5" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">{stat.icon} {stat.label}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </Card>
        ))}
      </div>

      {stats?.propertiesByType && (
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.stats', lang)}</h2>
          <div className="space-y-3">
            {stats.propertiesByType.map((item: any) => (
              <div key={item.type} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-32">
                  {TYPE_ICONS[item.type]}
                  <span className="text-sm font-medium">{t(`filter.${item.type}`, lang)}</span>
                </div>
                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item._count.id / (stats.totalProperties || 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <span className="text-sm font-bold w-8 text-right">{item._count.id}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Top annonces</h2>
        <div className="space-y-3">
          {(stats?.recentProperties || []).map((p: any, i: number) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground">{t(`filter.${p.type}`, lang)} · {new Intl.NumberFormat('fr-FR').format(p.price)} FCFA</div>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {p.viewsCount}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

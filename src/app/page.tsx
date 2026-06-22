'use client';

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Crown, ChevronRight, MapPinIcon, Search, Heart, MessageCircle, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';

import Header from '@/components/sadekh/Header';
import AlertPanel from '@/components/sadekh/AlertPanel';
import Chatbot from '@/components/sadekh/Chatbot';
import Footer from '@/components/sadekh/Footer';
import AuthModal from '@/components/sadekh/AuthModal';
import PaymentModal from '@/components/sadekh/PaymentModal';
import Listing from '@/components/sadekh/Listing';
import PropertyCard from '@/components/sadekh/PropertyCard';
import PropertyDetail from '@/components/sadekh/PropertyDetail';
import Hero from '@/components/sadekh/Hero';
import PublishForm from '@/components/sadekh/PublishForm';
import Dashboard from '@/components/sadekh/Dashboard';
import AdminView from '@/components/sadekh/AdminView';
import FavoritesView from '@/components/sadekh/FavoritesView';
import MessagesView from '@/components/sadekh/MessagesView';
import CompareView from '@/components/sadekh/CompareView';
const MapView = dynamic(() => import('@/components/sadekh/MapView'), { ssr: false });
import type { Property, FavItem, Message, PropertiesResponse, Pagination } from '@/lib/types';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

function SadekhApp() {
  const {
    lang, view, setView, filters, page, searchQuery, compareIds, setCompareIds,
    setSearchQuery, selectedProperty, showDetail, setShowDetail,
    currentUser, setCurrentUser, showAuth, setShowAuth, paymentProperty, setPaymentProperty,
    paymentType, setPaymentType, isOffline, setIsOffline, updateFilter,
    siteSettings, setSiteSettings, setChatMessages, openProperty,
  } = useStore();

  // Check auth session on mount
  useEffect(() => {
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'session' }) })
      .then(r => r.json())
      .then(data => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, [setCurrentUser]);

  // Check offline status
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handler = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => { window.removeEventListener('online', handler); window.removeEventListener('offline', handler); };
  }, [setIsOffline]);

  // Load site settings
  const { data: settingsData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => { const r = await fetch('/api/admin/settings'); return r.json(); },
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    if (settingsData && !settingsData.error) {
      React.startTransition(() => setSiteSettings(settingsData));
    }
  }, [settingsData, setSiteSettings]);

  // Update chatbot welcome message when site settings load
  useEffect(() => {
    if (siteSettings?.siteName) {
      setChatMessages([{
        role: 'assistant',
        content: `Bienvenue sur ${siteSettings.siteName} !\nJe suis votre assistant immobilier. Posez-moi vos questions sur :\n- Les prix au Sénégal\n- Les quartiers et régions\n- Le paiement Wave / Orange Money\n- Les documents (titre foncier)\n- La publication d'une annonce\n- Les plans architecturaux`,
      }]);
    }
  }, [siteSettings?.siteName, setChatMessages]);

  // Fetch properties
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ['properties', filters, page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.region !== 'all') params.set('region', filters.region);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.minSurface) params.set('minSurface', filters.minSurface);
      if (filters.rooms) params.set('rooms', filters.rooms);
      if (filters.sort) params.set('sort', filters.sort);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(page));
      params.set('limit', '12');
      const res = await fetch(`/api/properties?${params}`);
      return res.json() as Promise<PropertiesResponse>;
    },
  });

  // Fetch favorites
  const { data: favorites, refetch: refetchFav } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => { const res = await fetch('/api/favorites'); return res.json() as Promise<FavItem[]>; },
    enabled: !!currentUser,
  });

  // Fetch messages
  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => { const res = await fetch('/api/messages'); return res.json() as Promise<Message[]>; },
    enabled: !!currentUser,
  });

  // Fetch alerts
  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => { const res = await fetch('/api/alerts'); return res.json(); },
    enabled: !!currentUser,
  });

  // Fetch payments
  const { data: paymentsData } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => { const res = await fetch('/api/payments'); return res.json(); },
    enabled: !!currentUser,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => { const res = await fetch('/api/stats'); return res.json(); },
  });

  const properties: Property[] = propertiesData?.properties || [];
  const pagination: Pagination = propertiesData?.pagination || { page: 1, limit: 12, total: 0, pages: 1 };
  const paymentsList: any[] = Array.isArray(paymentsData) ? paymentsData : [];
  const favoriteIds = useMemo(
    () => new Set((Array.isArray(favorites) ? favorites : []).map((f: FavItem) => f.propertyId)),
    [favorites]
  );

  const toggleFavorite = async (propertyId: string) => {
    await fetch('/api/favorites', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId }),
    });
    refetchFav();
  };

  const handleSetPayment = (p: Property, type: 'boost' | 'plan' | 'premium') => {
    setPaymentProperty(p);
    setPaymentType(type);
  };

  const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Hero stats={stats} />

              {/* Premium properties */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Crown className="w-6 h-6 text-amber-500" /> {lang === 'fr' ? 'Annonces Premium' : 'Waxtu Premium'}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{lang === 'fr' ? 'Biens vérifiés et mis en avant par nos agents certifiés' : 'Waxtu yu jàpp, agent yu sertifikat wooynu wane'}</p>
                  </div>
                  <Button variant="outline" onClick={() => setView('listing')} className="gap-1">
                    {t('common.seeAll', lang)} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {loadingProperties ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden"><Skeleton className="aspect-[4/3]" /><CardContent className="p-4 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.filter((p) => p.isPremium).slice(0, 3).map((p) => (
                      <PropertyCard key={p.id} p={p} favoriteIds={favoriteIds} compareIds={compareIds} onToggleFavorite={toggleFavorite} onToggleCompare={useStore.getState().toggleCompare} onOpen={openProperty} />
                    ))}
                  </div>
                )}
              </section>

              {/* Recent properties */}
              <section className="bg-muted/50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Dernières annonces</h2>
                      <p className="text-muted-foreground text-sm mt-1">{lang === 'fr' ? 'Découvrez les biens récemment publiés' : 'Waxtu yu bees tànneewun'}</p>
                    </div>
                    <Button variant="outline" onClick={() => { updateFilter('sort', 'recent'); setView('listing'); }} className="gap-1">
                      {t('common.seeAll', lang)} <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {properties.slice(0, 8).map((p) => (
                      <PropertyCard key={p.id} p={p} favoriteIds={favoriteIds} compareIds={compareIds} onToggleFavorite={toggleFavorite} onToggleCompare={useStore.getState().toggleCompare} onOpen={openProperty} />
                    ))}
                  </div>
                </div>
              </section>

              {/* How it works */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <h2 className="text-2xl font-bold text-center mb-10">Comment ça marche ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { icon: <Search className="w-7 h-7" />, title: 'Recherchez', desc: 'Parcourez des centaines de maisons, appartements et terrains au Sénégal' },
                    { icon: <Heart className="w-7 h-7" />, title: 'Sauvegardez', desc: 'Ajoutez vos biens préférés aux favoris et créez des alertes' },
                    { icon: <MessageCircle className="w-7 h-7" />, title: 'Contactez', desc: 'Discutez directement avec les vendeurs via WhatsApp ou messagerie' },
                    { icon: <Check className="w-7 h-7" />, title: 'Conclusion', desc: 'Finalisez votre achat en toute sécurité avec les paiements mobiles' },
                  ].map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                      <Card className="p-6 text-center h-full">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">{step.icon}</div>
                        <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Regions */}
              <section className="bg-muted/50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <h2 className="text-2xl font-bold text-center mb-8">{lang === 'fr' ? 'Explorez par région' : 'Seet ci région'}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {REGIONS.slice(0, 6).map((region) => (
                      <button
                        key={region}
                        onClick={() => { updateFilter('region', region); setView('listing'); }}
                        className="p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all text-center"
                      >
                        <MapPinIcon className="w-6 h-6 mx-auto text-primary mb-2" />
                        <span className="font-medium text-sm">{region}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {view === 'listing' && (
            <motion.div key="listing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Listing
                properties={properties}
                pagination={pagination}
                loadingProperties={loadingProperties}
                favoriteIds={favoriteIds}
                compareIds={compareIds}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={useStore.getState().toggleCompare}
                onOpenProperty={openProperty}
              />
            </motion.div>
          )}

          {view === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <h1 className="text-2xl font-bold">{lang === 'fr' ? 'Vue carte' : 'Kaart'}</h1>
                  <Badge variant="secondary">{properties.filter(p => p.lat && p.lng).length} biens géolocalisés</Badge>
                </div>
                <div className="rounded-xl overflow-hidden border border-border shadow-lg" style={{ height: 'calc(100vh - 200px)' }}>
                  <MapView properties={properties} lang={lang} onPropertyClick={openProperty} />
                </div>
              </div>
            </motion.div>
          )}

          {view === 'favorites' && (
            <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FavoritesView
                favorites={favorites}
                favoriteIds={favoriteIds}
                compareIds={compareIds}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={useStore.getState().toggleCompare}
                onOpenProperty={openProperty}
              />
            </motion.div>
          )}

          {view === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MessagesView messages={messages} />
            </motion.div>
          )}

          {view === 'publish' && (
            <motion.div key="publish" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PublishForm />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard
                stats={stats}
                paymentsList={paymentsList}
                properties={properties}
                messages={Array.isArray(messages) ? messages : []}
                favoriteIds={favoriteIds}
                compareIds={compareIds}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={useStore.getState().toggleCompare}
                onOpenProperty={openProperty}
              />
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminView stats={stats} />
            </motion.div>
          )}

          {view === 'compare' && (
            <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CompareView properties={properties} compareIds={compareIds} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <PropertyDetail
        p={selectedProperty}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onSetPayment={handleSetPayment}
      />

      <Chatbot />

      {paymentProperty && (
        <PaymentModal
          property={paymentProperty}
          lang={lang}
          open={true}
          onClose={() => setPaymentProperty(null)}
          type={paymentType}
        />
      )}

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        lang={lang}
        onLogin={setCurrentUser}
      />

      <AlertPanel />

      {isOffline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Mode hors ligne
        </div>
      )}

      {compareIds.length >= 2 && view !== 'compare' && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4"
        >
          <span className="text-sm font-medium">{compareIds.length} biens sélectionnés</span>
          <Button size="sm" onClick={() => setView('compare')} className="gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"/><path d="M18 2l3 3-3 3"/><path d="M16 11V7h-4"/><path d="M21 3l-5 5"/></svg>
            {t('nav.compare', lang)}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCompareIds([])}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SadekhApp />
    </QueryClientProvider>
  );
}

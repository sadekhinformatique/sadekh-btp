'use client';

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { t, formatPrice, type Lang } from '@/lib/i18n';
import dynamic from 'next/dynamic';

// Lazy-loaded heavy components
const MapView = dynamic(() => import("@/components/sadekh/MapView"), { ssr: false, loading: () => <div className="h-[500px] bg-muted animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Chargement de la carte...</div> });
import PaymentModal from '@/components/sadekh/PaymentModal';
import AuthModal from '@/components/sadekh/AuthModal';
const GpsPicker = dynamic(() => import('@/components/sadekh/GpsPicker'), { ssr: false, loading: () => <div className="h-[350px] bg-muted animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Chargement de la carte...</div> });

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search, Home, Building2, MapPin, FileText, Heart, MessageCircle, Send,
  Plus, Menu, X, ChevronDown, Star, Eye, Phone, Globe, Shield,
  BarChart3, Users, TrendingUp, MapPinned, MessageSquare, Bot,
  ArrowUpDown, Filter, Grid3X3, List, ChevronLeft, ChevronRight,
  Check, Crown, AlertTriangle, Download, Share2, Flag, Gavel,
  Zap, Building, HandCoins, Bell, Settings, LogOut, LogIn, Image as ImageIcon,
  Droplets, Ruler, DoorOpen, MapPinIcon, ChevronUp, Sparkles,
  MapIcon, LayoutGrid, CreditCard
} from 'lucide-react';

/* ─── TYPES ─── */
interface Property {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  price: number;
  priceNegotiable: boolean;
  surfaceM2: number | null;
  rooms: number | null;
  region: string;
  city: string;
  quartier: string;
  lat: number | null;
  lng: number | null;
  images: string[];
  titleFoncier: boolean;
  status: string;
  isPremium: boolean;
  viewsCount: number;
  user: {
    id: string;
    name: string;
    email: string;
    profile: {
      fullName: string | null;
      phone: string | null;
      whatsapp: string | null;
      agencyName: string | null;
      verified: boolean;
    } | null;
  };
}

interface FavItem {
  id: string;
  userId: string;
  propertyId: string;
  property: Property;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId: string | null;
  content: string;
  readAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; profile: { fullName: string | null; avatar: string | null } | null };
  receiver: { id: string; name: string; profile: { fullName: string | null; avatar: string | null } | null };
}

type View = 'home' | 'listing' | 'favorites' | 'messages' | 'publish' | 'dashboard' | 'admin' | 'compare' | 'plans' | 'map';
type PropertyType = 'all' | 'maison' | 'appartement' | 'terrain' | 'plan';
type ListingView = 'grid' | 'map';

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou'];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  maison: <Home className="w-5 h-5" />,
  appartement: <Building2 className="w-5 h-5" />,
  terrain: <MapPin className="w-5 h-5" />,
  plan: <FileText className="w-5 h-5" />,
};

const TYPE_COLORS: Record<string, string> = {
  maison: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  appartement: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  terrain: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  plan: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

/* ─── MAIN APP ─── */
function SadekhApp() {
  const [lang, setLang] = useState<Lang>('fr');
  const [view, setView] = useState<View>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    type: PropertyType;
    region: string;
    maxPrice: string;
    minSurface: string;
    rooms: string;
    sort: string;
  }>({
    type: 'all',
    region: 'all',
    maxPrice: '',
    minSurface: '',
    rooms: '',
    sort: 'recent',
  });
  const [page, setPage] = useState(1);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Bienvenue sur SADEKH BTP ! 👋\nJe suis votre assistant immobilier. Posez-moi vos questions sur :\n• Les prix au Sénégal\n• Les quartiers et régions\n• Le paiement Wave / Orange Money\n• Les documents (titre foncier)\n• La publication d\'une annonce\n• Les plans architecturaux' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [publishStep, setPublishStep] = useState(1);
  const [publishForm, setPublishForm] = useState({ type: 'maison', title: '', description: '', price: '', surfaceM2: '', rooms: '', region: 'Dakar', city: '', quartier: '', lat: '', lng: '', titleFoncier: false, priceNegotiable: false });
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [listingView, setListingView] = useState<ListingView>('grid');
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paymentProperty, setPaymentProperty] = useState<Property | null>(null);
  const [paymentType, setPaymentType] = useState<'boost' | 'plan' | 'premium'>('boost');
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: 'all', region: 'Dakar', maxPrice: '' });
  const [alertCreating, setAlertCreating] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'session' }) })
      .then(r => r.json())
      .then(data => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

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
      return res.json();
    },
  });

  // Fetch favorites
  const { data: favorites, refetch: refetchFav } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites');
      return res.json() as Promise<FavItem[]>;
    },
  });

  // Fetch messages
  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await fetch('/api/messages');
      return res.json() as Promise<Message[]>;
    },
  });

  // Fetch alerts
  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch('/api/alerts');
      return res.json();
    },
    enabled: !!currentUser,
  });

  // Fetch payments
  const { data: paymentsData } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await fetch('/api/payments');
      return res.json();
    },
  });

  const paymentsList: any[] = paymentsData || [];

  // Check offline status
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handler = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => { window.removeEventListener('online', handler); window.removeEventListener('offline', handler); };
  }, []);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      return res.json();
    },
  });

  const properties: Property[] = propertiesData?.properties || [];
  const pagination = propertiesData?.pagination || { page: 1, pages: 1, total: 0 };
  const favoriteIds = useMemo(
    () => new Set((favorites || []).map((f: FavItem) => f.propertyId)),
    [favorites]
  );
  const unreadCount = (messages || []).filter((m: Message) => !m.readAt && m.receiverId !== 'demo-buyer').length;

  const toggleFavorite = async (propertyId: string) => {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });
    refetchFav();
  };

  const openProperty = (p: Property) => {
    setSelectedProperty(p);
    setShowDetail(true);
    setView('listing');
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
    if (view === 'home') setView('listing');
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  /* ─── HEADER ─── */
  const renderHeader = () => (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-border">
      <div className="senegal-stripe" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => { setView('home'); setPage(1); setSearchQuery(''); setFilters({ type: 'all', region: 'all', maxPrice: '', minSurface: '', rooms: '', sort: 'recent' }); }} className="flex items-center gap-2 shrink-0">
            <img src="/logo-sadekh.png" alt="SADEKH BTP" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-bold text-lg tracking-tight text-primary hidden sm:block">SADEKH <span className="text-amber-600">BTP</span></span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'home' as View, label: 'nav.home', icon: <Home className="w-4 h-4" /> },
              { id: 'listing' as View, label: 'nav.properties', icon: <Building2 className="w-4 h-4" /> },
              { id: 'map' as View, label: 'Vue carte', icon: <MapIcon className="w-4 h-4" /> },
              { id: 'plans' as View, label: 'nav.plans', icon: <FileText className="w-4 h-4" /> },
              { id: 'favorites' as View, label: 'nav.favorites', icon: <Heart className="w-4 h-4" /> },
              { id: 'messages' as View, label: 'nav.messages', icon: <MessageCircle className="w-4 h-4" /> },
              { id: 'dashboard' as View, label: 'nav.dashboard', icon: <BarChart3 className="w-4 h-4" /> },
              ...(currentUser?.profile?.role === 'admin' ? [{ id: 'admin' as View, label: 'nav.admin', icon: <Shield className="w-4 h-4" /> }] : []),
            ].map((item) => (
              <Button
                key={item.id}
                variant={view === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setView(item.id); if (item.id === 'plans') { updateFilter('type', 'plan'); setView('listing'); } if (item.id === 'listing') { updateFilter('type', 'all'); } if (item.id === 'map') { updateFilter('type', 'all'); } }}
                className="gap-1.5 text-sm"
              >
                {item.icon}
                {t(item.label, lang)}
              </Button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Alerts */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" onClick={() => setShowAlertPanel(!showAlertPanel)}>
                    <Bell className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{lang === 'fr' ? 'Alertes' : 'Alart'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Auth */}
            {currentUser ? (
              <Button variant="outline" size="sm" onClick={async () => {
                try { await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }); } catch {}
                setCurrentUser(null);
              }} className="gap-1.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                  {currentUser.profile?.fullName?.[0] || currentUser.name?.[0] || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.profile?.fullName || currentUser.name}</span>
                {currentUser.profile?.role === 'admin' && (
                  <Badge variant="default" className="text-[9px] px-1 h-4">Admin</Badge>
                )}
                <LogOut className="w-3 h-3" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAuth(true)} className="gap-1.5">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.login', lang)}</span>
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLang(lang === 'fr' ? 'wo' : 'fr')}
                    className="gap-1 text-xs font-bold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {lang === 'fr' ? 'Wolof' : 'FR'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{lang === 'fr' ? 'Wax ci Wolof' : 'Switch to French'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button size="sm" onClick={() => setView('publish')} className="gap-1.5 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.publish', lang)}</span>
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileMenu} onOpenChange={setMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src="/logo-sadekh.png" alt="SADEKH BTP" className="h-8 w-8 rounded-full" />
                    SADEKH BTP
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  {[
                    { id: 'home' as View, label: 'nav.home', icon: <Home className="w-5 h-5" /> },
                    { id: 'listing' as View, label: 'nav.properties', icon: <Building2 className="w-5 h-5" /> },
                    { id: 'plans' as View, label: 'nav.plans', icon: <FileText className="w-5 h-5" /> },
                    { id: 'favorites' as View, label: 'nav.favorites', icon: <Heart className="w-5 h-5" /> },
                    { id: 'messages' as View, label: 'nav.messages', icon: <MessageCircle className="w-5 h-5" /> },
                    { id: 'publish' as View, label: 'nav.publish', icon: <Plus className="w-5 h-5" /> },
                    { id: 'dashboard' as View, label: 'nav.dashboard', icon: <BarChart3 className="w-5 h-5" /> },
                    ...(currentUser?.profile?.role === 'admin' ? [{ id: 'admin' as View, label: 'nav.admin', icon: <Shield className="w-5 h-5" /> }] : []),
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={view === item.id ? 'secondary' : 'ghost'}
                      className="justify-start gap-3 h-12 text-base"
                      onClick={() => { setView(item.id); if (item.id === 'plans') { updateFilter('type', 'plan'); setView('listing'); } setMobileMenu(false); }}
                    >
                      {item.icon}
                      {t(item.label, lang)}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );

  /* ─── HERO ─── */
  const renderHero = () => (
    <section className="hero-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-300 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 max-w-4xl">
            {t('hero.title', lang)}
          </h1>
          <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-2xl">
            {t('hero.subtitle', lang)}
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-2xl">
          <div className="flex bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('hero.search.placeholder', lang)}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="w-full h-14 pl-12 pr-4 text-gray-900 text-base outline-none"
              />
            </div>
            <Button
              onClick={() => handleSearch(searchQuery)}
              className="h-14 px-6 bg-primary hover:bg-primary/90 text-white rounded-none text-base font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              {t('hero.search.btn', lang)}
            </Button>
          </div>
        </motion.div>

        {/* Quick type filters */}
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

        {/* Stats */}
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

  /* ─── PROPERTY CARD ─── */
  const renderPropertyCard = (p: Property) => (
    <motion.div
      key={p.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="property-card overflow-hidden border border-border h-full flex flex-col group cursor-pointer" onClick={() => openProperty(p)}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={p.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'}
            alt={p.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge className={TYPE_COLORS[p.type] || ''}>{t(`filter.${p.type}`, lang)}</Badge>
            {p.isPremium && (
              <Badge className="bg-amber-500 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                <span className="premium-badge font-bold">Premium</span>
              </Badge>
            )}
          </div>
          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${favoriteIds.has(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleCompare(p.id); }}
              className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors ${compareIds.includes(p.id) ? 'ring-2 ring-primary' : ''}`}
            >
              <ArrowUpDown className={`w-4 h-4 ${compareIds.includes(p.id) ? 'text-primary' : 'text-gray-600'}`} />
            </button>
          </div>
          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg">
              <div className="font-bold text-lg">{formatPrice(p.price, lang)}</div>
              {p.priceNegotiable && <div className="text-xs text-green-300">{t('property.negotiable', lang)}</div>}
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col gap-2">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{p.quartier}, {p.city || p.region}</span>
          </div>
          {/* Tags */}
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
              <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30 px-2 py-1 rounded-md">
                <Gavel className="w-3 h-3" /> {t('property.titleFoncier', lang)}
              </span>
            )}
          </div>
          {/* Seller */}
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

  /* ─── FILTERS BAR ─── */
  const renderFilters = () => (
    <div className="bg-card border-b border-border sticky top-[68px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Map / Grid toggle */}
          <div className="flex bg-muted rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setListingView('grid')}
              className={`p-1.5 rounded-md transition-all ${listingView === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setListingView('map'); if (view !== 'listing' && view !== 'map') setView('listing'); }}
              className={`p-1.5 rounded-md transition-all ${listingView === 'map' ? 'bg-white shadow-sm' : ''}`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Type tabs */}
          <div className="flex bg-muted rounded-lg p-0.5">
            {(['all', 'maison', 'appartement', 'terrain', 'plan'] as PropertyType[]).map((type) => (
              <button
                key={type}
                onClick={() => updateFilter('type', type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filters.type === type
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`filter.${type}`, lang)}
              </button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Region */}
          <Select value={filters.region} onValueChange={(v) => updateFilter('region', v)}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <MapPinned className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder={t('filter.region', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filter.all', lang)}</SelectItem>
              {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Max Price */}
          <Select value={filters.maxPrice} onValueChange={(v) => updateFilter('maxPrice', v)}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <HandCoins className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder={t('filter.price', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filter.all', lang)}</SelectItem>
              <SelectItem value="20000000">20M FCFA</SelectItem>
              <SelectItem value="50000000">50M FCFA</SelectItem>
              <SelectItem value="75000000">75M FCFA</SelectItem>
              <SelectItem value="100000000">100M FCFA</SelectItem>
              <SelectItem value="150000000">150M FCFA</SelectItem>
              <SelectItem value="200000000">200M FCFA</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={filters.sort} onValueChange={(v) => updateFilter('sort', v)}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder={t('filter.sort', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('filter.sort.recent', lang)}</SelectItem>
              <SelectItem value="priceAsc">{t('filter.sort.priceAsc', lang)}</SelectItem>
              <SelectItem value="priceDesc">{t('filter.sort.priceDesc', lang)}</SelectItem>
              <SelectItem value="views">{t('filter.sort.views', lang)}</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto text-sm text-muted-foreground">
            {pagination.total} {t('filter.results', lang)}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── LISTING VIEW ─── */
  const renderListing = () => (
    <div className="min-h-screen">
      {renderFilters()}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {listingView === 'map' ? (
          <div className="rounded-xl overflow-hidden border border-border shadow-lg" style={{ height: 'calc(100vh - 200px)' }}>
            <MapView properties={properties} lang={lang} onPropertyClick={openProperty} />
          </div>
        ) : loadingProperties ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('common.noResults', lang)}</h3>
            <Button variant="outline" onClick={() => { setFilters({ type: 'all', region: 'all', maxPrice: '', minSurface: '', rooms: '', sort: 'recent' }); setSearchQuery(''); }}>
              {t('common.retry', lang)}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(renderPropertyCard)}
            </div>
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="w-9">
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="icon" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  /* ─── PROPERTY DETAIL MODAL ─── */
  const renderPropertyDetail = () => {
    if (!selectedProperty) return null;
    const p = selectedProperty;
    return (
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {/* Image gallery */}
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
              {p.isPremium && <Badge className="bg-amber-500 text-white"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
            </div>
            <div className="absolute top-4 right-4">
              <button onClick={() => toggleFavorite(p.id)} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white">
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
            {/* Title + Price */}
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

            {/* Characteristics */}
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

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {p.titleFoncier && (
                <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400 gap-1 py-1">
                  <Check className="w-3 h-3" /> {t('property.titleFoncier', lang)}
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 py-1">
                <Building className="w-3 h-3" /> {t(`filter.${p.type}`, lang)}
              </Badge>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">{t('detail.description', lang)}</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{p.description}</p>
            </div>

            {/* Seller */}
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

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {p.user?.profile?.whatsapp && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 h-12 text-base"
                  onClick={() => window.open(`https://wa.me/${p.user.profile.whatsapp.replace('+', '')}?text=Bonjour, je suis intéressé par: ${encodeURIComponent(p.title)}`, '_blank')}
                >
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </Button>
              )}
              <Button variant="outline" className="flex-1 gap-2 h-12" onClick={() => setView('messages')}>
                <Send className="w-5 h-5" /> {t('property.contact', lang)}
              </Button>
              {p.type === 'plan' && (
                <Button variant="outline" className="flex-1 gap-2 h-12 border-amber-500 text-amber-700" onClick={() => { setPaymentProperty(p); setPaymentType('plan'); }}>
                  <CreditCard className="w-5 h-5" /> {t('detail.downloadPlan', lang)} — {formatPrice(p.price, lang)}
                </Button>
              )}
              {p.type !== 'plan' && (
                <Button variant="outline" size="icon" className="h-12 w-12 text-amber-600 border-amber-300 hover:bg-amber-50" onClick={() => { setPaymentProperty(p); setPaymentType('boost'); }} title="Booster cette annonce">
                  <Zap className="w-5 h-5" />
                </Button>
              )}
              <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => { toggleCompare(p.id); }}>
                <ArrowUpDown className="w-5 h-5" />
              </Button>
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
  };

  /* ─── FAVORITES VIEW ─── */
  const renderFavorites = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-7 h-7 text-red-500" />
        <h1 className="text-2xl font-bold">{t('favorites.title', lang)}</h1>
        <Badge variant="secondary">{(favorites || []).length}</Badge>
      </div>
      {!favorites || favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('favorites.empty', lang)}</h3>
          <p className="text-muted-foreground mb-6">{t('favorites.empty.desc', lang)}</p>
          <Button onClick={() => setView('listing')}>{t('nav.properties', lang)}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((f: FavItem) => renderPropertyCard(f.property))}
        </div>
      )}
    </div>
  );

  /* ─── MESSAGES VIEW ─── */
  const renderMessages = () => {
    const conversations = (messages || []).reduce((acc: any, m: Message) => {
      const key = [m.senderId, m.receiverId].sort().join('-');
      if (!acc[key]) acc[key] = { partner: m.senderId === 'demo-buyer' ? m.receiver : m.sender, messages: [] };
      acc[key].messages.push(m);
      return acc;
    }, {});

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold">{t('messages.title', lang)}</h1>
          {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
        </div>
        <div className="grid md:grid-cols-3 gap-4 h-[500px]">
          {/* Conversation list */}
          <Card className="overflow-hidden">
            <ScrollArea className="h-full">
              {Object.values(conversations).map((conv: any, i: number) => (
                <button
                  key={i}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {(conv.partner?.profile?.fullName || conv.partner?.name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{conv.partner?.profile?.fullName || conv.partner?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{conv.messages[conv.messages.length - 1]?.content}</div>
                  </div>
                </button>
              ))}
              {Object.keys(conversations).length === 0 && (
                <div className="p-6 text-center text-muted-foreground text-sm">{t('messages.empty', lang)}</div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat area */}
          <Card className="md:col-span-2 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="font-semibold">Conversation</div>
            </div>
            <ScrollArea className="flex-1 p-4">
              {(messages || []).map((m: Message) => (
                <div key={m.id} className={`flex mb-4 ${m.senderId === 'demo-buyer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.senderId === 'demo-buyer'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-4 border-t border-border flex gap-2">
              <Input placeholder={t('messages.placeholder', lang)} className="flex-1" value={msgText} onChange={(e) => setMsgText(e.target.value)} onKeyDown={async (e) => {
                if (e.key === 'Enter' && msgText.trim()) {
                  setSendingMsg(true);
                  try {
                    await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: msgText, receiverId: messages?.[0]?.receiverId || messages?.[0]?.senderId }) });
                    setMsgText('');
                  } catch {}
                  setSendingMsg(false);
                }
              }} />
              <Button size="icon" disabled={sendingMsg || !msgText.trim()}><Send className="w-4 h-4" /></Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  /* ─── PUBLISH FORM ─── */
  const renderPublish = () => {
    const step = publishStep;
    const form = publishForm;

    const handleSubmit = async () => {
      setPublishing(true);
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setPublishing(false);
      setPublishSuccess(true);
      setTimeout(() => { setPublishSuccess(false); setView('listing'); }, 2000);
    };

    if (publishSuccess) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('publish.success', lang)}</h2>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Plus className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold">{t('publish.title', lang)}</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>{s}</div>
              {s < 4 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </React.Fragment>
          ))}
        </div>

        <Card className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">{t('publish.step1', lang)}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['maison', 'appartement', 'terrain', 'plan'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPublishForm({ ...form, type })}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      form.type === type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {TYPE_ICONS[type]}
                    <span className="text-sm font-medium">{t(`filter.${type}`, lang)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('publish.step2', lang)}</h3>
              <div>
                <Label>{t('publish.title.label', lang)}</Label>
                <Input className="mt-1" value={form.title} onChange={(e) => setPublishForm({ ...form, title: e.target.value })} placeholder="Villa 4 chambres — Almadies" />
              </div>
              <div>
                <Label>{t('publish.description.label', lang)}</Label>
                <Textarea className="mt-1" rows={4} value={form.description} onChange={(e) => setPublishForm({ ...form, description: e.target.value })} placeholder="Décrivez votre bien..." />
                <Button variant="ghost" size="sm" className="mt-1 gap-1 text-primary">
                  <Sparkles className="w-3.5 h-3.5" /> {t('publish.ai.desc', lang)}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('publish.price.label', lang)}</Label>
                  <Input type="number" className="mt-1" value={form.price} onChange={(e) => setPublishForm({ ...form, price: e.target.value })} placeholder="75000000" />
                </div>
                <div>
                  <Label>{t('publish.surface.label', lang)}</Label>
                  <Input type="number" className="mt-1" value={form.surfaceM2} onChange={(e) => setPublishForm({ ...form, surfaceM2: e.target.value })} placeholder="200" />
                </div>
              </div>
              <div>
                <Label>{t('publish.rooms.label', lang)}</Label>
                <Input type="number" className="mt-1" value={form.rooms} onChange={(e) => setPublishForm({ ...form, rooms: e.target.value })} placeholder="4" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form.priceNegotiable} onCheckedChange={(v) => setPublishForm({ ...form, priceNegotiable: !!v })} />
                  <span className="text-sm">{t('publish.negotiable', lang)}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form.titleFoncier} onCheckedChange={(v) => setPublishForm({ ...form, titleFoncier: !!v })} />
                  <span className="text-sm">{t('publish.foncier', lang)}</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('publish.step3', lang)}</h3>
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground mb-2">{t('publish.photos', lang)}</p>
                <Button variant="outline" size="sm">Choisir des fichiers</Button>
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP. Max 5MB par photo.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('publish.step4', lang)}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>{t('publish.region.label', lang)}</Label>
                  <Select value={form.region} onValueChange={(v) => setPublishForm({ ...form, region: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('publish.city.label', lang)}</Label>
                  <Input className="mt-1" value={form.city} onChange={(e) => setPublishForm({ ...form, city: e.target.value })} placeholder="Dakar" />
                </div>
                <div>
                  <Label>{t('publish.quartier.label', lang)}</Label>
                  <Input className="mt-1" value={form.quartier} onChange={(e) => setPublishForm({ ...form, quartier: e.target.value })} placeholder="Almadies" />
                </div>
              </div>
              <div className="mt-4">
                <Label className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-primary" /> {lang === 'fr' ? 'Localisation GPS' : 'GPS Bee'}</Label>
                <GpsPicker
                  lat={form.lat ? parseFloat(form.lat) : null}
                  lng={form.lng ? parseFloat(form.lng) : null}
                  onSelect={(lat, lng) => setPublishForm({ ...form, lat: String(lat), lng: String(lng) })}
                  lang={lang}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => step > 1 ? setPublishStep(step - 1) : setView('home')}>
              {step > 1 ? <ChevronLeft className="w-4 h-4 mr-1" /> : null}
              {step > 1 ? '' : t('common.cancel', lang)}
            </Button>
            {step < 4 ? (
              <Button onClick={() => setPublishStep(step + 1)}>
                {t('common.save', lang)} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={publishing} className="gap-2">
                <Zap className="w-4 h-4" />
                {t('publish.submit', lang)}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  };

  /* ─── DASHBOARD VIEW ─── */
  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold">{t('dashboard.title', lang)}</h1>
      </div>

      {/* Stats cards */}
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

      {/* Payment history */}
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

      {/* My properties */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('dashboard.myProperties', lang)}</h2>
          <Button size="sm" onClick={() => setView('publish')} className="gap-1"><Plus className="w-4 h-4" /> {t('nav.publish', lang)}</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.slice(0, 6).map(renderPropertyCard)}
        </div>
      </div>

      {/* Recent messages */}
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

  /* ─── ADMIN VIEW ─── */
  const renderAdmin = () => {
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

      {/* Admin stats */}
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

      {/* Properties by type */}
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

      {/* Top properties */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Top annonces</h2>
        <div className="space-y-3">
          {(stats?.recentProperties || []).map((p: any, i: number) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground">{t(`filter.${p.type}`, lang)} · {formatPrice(p.price, lang)}</div>
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
  };

  /* ─── COMPARE VIEW ─── */
  const renderCompare = () => {
    const compareProperties = properties.filter((p) => compareIds.includes(p.id));
    if (compareIds.length < 2) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <ArrowUpDown className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('compare.title', lang)}</h2>
          <p className="text-muted-foreground">{t('compare.empty', lang)}</p>
        </div>
      );
    }
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('compare.title', lang)}</h1>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-3 text-left w-40" />
                {compareProperties.map((p) => (
                  <th key={p.id} className="p-3 text-left min-w-[250px]">
                    <img src={p.images[0]} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />
                    <div className="font-semibold">{p.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Prix', render: (p: Property) => formatPrice(p.price, lang) },
                { label: 'Type', render: (p: Property) => t(`filter.${p.type}`, lang) },
                { label: 'Surface', render: (p: Property) => p.surfaceM2 ? `${p.surfaceM2} m²` : '—' },
                { label: 'Pièces', render: (p: Property) => p.rooms || '—' },
                { label: 'Région', render: (p: Property) => p.region },
                { label: 'Quartier', render: (p: Property) => p.quartier },
                { label: 'Titre foncier', render: (p: Property) => p.titleFoncier ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-400" /> },
                { label: 'Négociable', render: (p: Property) => p.priceNegotiable ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-400" /> },
                { label: 'Vues', render: (p: Property) => p.viewsCount },
                { label: 'Premium', render: (p: Property) => p.isPremium ? <Crown className="w-5 h-5 text-amber-500" /> : <X className="w-5 h-5 text-muted-foreground" /> },
              ].map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="p-3 font-medium text-sm text-muted-foreground">{row.label}</td>
                  {compareProperties.map((p) => (
                    <td key={p.id} className="p-3 text-sm">{row.render(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ─── CHATBOT ─── */
  const renderChatbot = () => (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-[360px] max-h-[500px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">{t('chatbot.title', lang)}</div>
                <div className="text-xs text-primary-foreground/70">Assistant SADEKH</div>
              </div>
              <button onClick={() => setShowChatbot(false)} className="ml-auto w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ScrollArea className="flex-1 p-4 max-h-[350px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                placeholder={t('chatbot.placeholder', lang)}
                className="flex-1 h-9 text-sm"
                disabled={chatLoading}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (!val) return;
                    const userMsg = { role: 'user' as const, content: val };
                    setChatMessages((prev) => [...prev, userMsg]);
                    (e.target as HTMLInputElement).value = '';
                    setChatLoading(true);
                    try {
                      const res = await fetch('/api/chatbot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: val, history: [...chatMessages, userMsg] }) });
                      const data = await res.json();
                      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.response || 'Désolé, une erreur est survenue.' }]);
                    } catch {
                      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Désolé, je suis temporairement indisponible. Réessayez dans un instant.' }]);
                    }
                    setChatLoading(false);
                  }
                }}
              />
              <Button size="icon" className="h-9 w-9" disabled={chatLoading}>{chatLoading ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Send className="w-4 h-4" />}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowChatbot(!showChatbot)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {showChatbot ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>
    </div>
  );

  /* ─── FOOTER ─── */
  const renderFooter = () => (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo-sadekh.png" alt="SADEKH BTP" className="h-8 w-8 rounded-full" />
              <span className="font-bold text-lg">SADEKH <span className="text-amber-600">BTP</span></span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              {t('footer.about.desc', lang)}
            </p>
            <div className="flex gap-3 mt-4">
              {['Wave', 'Orange Money'].map((m) => (
                <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.links', lang)}</h3>
            <div className="space-y-2">
              {['maison', 'appartement', 'terrain', 'plan'].map((type) => (
                <button key={type} onClick={() => { updateFilter('type', type); setView('listing'); }} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t(`filter.${type}`, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact', lang)}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Dakar, Sénégal</p>
              <p>contact@sadekhbtp.sn</p>
              <p>+221 77 123 45 67</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SADEKH BTP. {t('footer.rights', lang)}</p>
          <div className="flex gap-4">
            <button className="hover:text-foreground transition-colors">{t('footer.legal', lang)}</button>
            <button className="hover:text-foreground transition-colors">{t('footer.privacy', lang)}</button>
            <button className="hover:text-foreground transition-colors">{t('footer.terms', lang)}</button>
          </div>
        </div>
      </div>
    </footer>
  );

  /* ─── MAIN RENDER ─── */
  return (
    <div className="min-h-screen flex flex-col">
      {renderHeader()}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderHero()}
              {/* Featured properties */}
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
                    {properties.filter((p) => p.isPremium).slice(0, 3).map(renderPropertyCard)}
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
                    {properties.slice(0, 8).map(renderPropertyCard)}
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
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                          {step.icon}
                        </div>
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
              {renderListing()}
            </motion.div>
          )}

          {view === 'favorites' && (
            <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderFavorites()}
            </motion.div>
          )}

          {view === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderMessages()}
            </motion.div>
          )}

          {view === 'publish' && (
            <motion.div key="publish" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderPublish()}
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderDashboard()}
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderAdmin()}
            </motion.div>
          )}

          {view === 'compare' && (
            <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderCompare()}
            </motion.div>
          )}

          {view === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapIcon className="w-7 h-7 text-primary" />
                  <h1 className="text-2xl font-bold">{lang === 'fr' ? 'Vue carte' : 'Kaart'}</h1>
                  <Badge variant="secondary">{properties.filter(p => p.lat && p.lng).length} biens géolocalisés</Badge>
                </div>
                <div className="rounded-xl overflow-hidden border border-border shadow-lg" style={{ height: 'calc(100vh - 200px)' }}>
                  <MapView properties={properties} lang={lang} onPropertyClick={openProperty} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {renderFooter()}
      {renderPropertyDetail()}
      {renderChatbot()}

      {/* Payment Modal */}
      {paymentProperty && (
        <PaymentModal
          property={paymentProperty}
          lang={lang}
          open={true}
          onClose={() => setPaymentProperty(null)}
          type={paymentType}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        lang={lang}
        onLogin={setCurrentUser}
      />

      {/* Alert Panel */}
      {showAlertPanel && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-20 right-4 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> {lang === 'fr' ? 'Alertes immobilier' : 'Alart immobiliér'}</h3>
            <button onClick={() => setShowAlertPanel(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            {currentUser ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newAlert.type} onValueChange={(v) => setNewAlert({ ...newAlert, type: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="maison">Maisons</SelectItem>
                      <SelectItem value="appartement">Apparts</SelectItem>
                      <SelectItem value="terrain">Terrains</SelectItem>
                      <SelectItem value="plan">Plans</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newAlert.region} onValueChange={(v) => setNewAlert({ ...newAlert, region: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input type="number" placeholder="Budget max (FCFA)" className="h-8 text-xs" value={newAlert.maxPrice} onChange={(e) => setNewAlert({ ...newAlert, maxPrice: e.target.value })} />
                <Button size="sm" className="w-full h-8 text-xs" disabled={alertCreating} onClick={async () => {
                  setAlertCreating(true);
                  try {
                    await fetch('/api/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', ...newAlert }) });
                  } catch {}
                  setAlertCreating(false);
                }}>
                  <Bell className="w-3 h-3 mr-1" /> {lang === 'fr' ? 'Créer l\'alerte' : 'Sos alart bi'}
                </Button>
                <div className="text-xs text-muted-foreground">{lang === 'fr' ? 'Vous recevrez une notification pour chaque nouveau bien correspondant à vos critères.' : 'Dangay jott ndax sax biir bu nocci seen kaalaan.'}</div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {lang === 'fr' ? 'Connectez-vous pour créer des alertes' : 'Seet ngir sos alart'}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Mode hors ligne
        </div>
      )}

      {/* Compare banner */}
      {compareIds.length >= 2 && view !== 'compare' && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4"
        >
          <span className="text-sm font-medium">{compareIds.length} biens sélectionnés</span>
          <Button size="sm" onClick={() => setView('compare')} className="gap-1">
            <ArrowUpDown className="w-4 h-4" /> {t('nav.compare', lang)}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCompareIds([])}>
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function SadekhPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SadekhApp />
    </QueryClientProvider>
  );
}
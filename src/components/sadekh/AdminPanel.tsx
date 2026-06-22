'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  BarChart3,
  Building2,
  Home,
  FileText,
  MapPin,
  MessageSquare,
  Users,
  Settings,
  ArrowLeft,
  Search,
  Plus,
  Pencil,
  Trash2,
  Crown,
  Eye,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MessageCircle,
  Send,
  Menu,
  ChevronRight,
  TrendingUp,
  Home as HomeIcon,
  Check,
  X,
  Globe,
  Palette,
  Sparkles,
  CircleDollarSign,
  Shield,
  ShieldCheck,
  Reply,
  MailOpen,
  Inbox,
  Star,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const REGIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque',
  'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou',
];

const PROPERTY_TYPES = ['maison', 'appartement', 'terrain', 'plan'];

const TYPE_LABELS: Record<string, string> = {
  maison: 'Maison',
  appartement: 'Appartement',
  terrain: 'Terrain',
  plan: 'Plan archi.',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  pending: 'secondary',
  sold: 'destructive',
  archived: 'outline',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  sold: 'Vendu',
  archived: 'Archivé',
};

const DEFAULT_SETTINGS = {
  siteName: 'SADEKH BTP',
  siteSlogan: 'La première marketplace immobilière du Sénégal',
  logoUrl: '/logo-sadekh.png',
  faviconUrl: '/favicon.ico',
  primaryColor: '#1B5E20',
  accentColor: '#C8A951',
  contactEmail: 'contact@sadekhbtp.sn',
  contactPhone: '+221 77 123 45 67',
  contactWhatsapp: '+221 77 123 45 67',
  contactAddress: 'Dakar, Sénégal',
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  tiktok: '',
  seoTitle: 'SADEKH BTP - Marketplace Immobilière Sénégal',
  seoDescription: 'Découvrez les meilleures offres immobilières au Sénégal sur SADEKH BTP.',
  seoKeywords: 'immobilier, Sénégal, Dakar, maison, appartement, terrain',
  heroTitleFr: 'Trouvez votre bien idéal au Sénégal',
  heroSubtitleFr: 'Des milliers de biens immobiliers vous attendent',
  heroTitleWo: 'Jëf jëf ndax biir Sénégal',
  heroSubtitleWo: 'Immobilier bu baax, bu am solo',
  footerAboutFr: 'SADEKH BTP est la première marketplace immobilière du Sénégal.',
  footerAboutWo: 'SADEKH BTP mooy marketplace bu njëkk bi ci Sénégal.',
  boostPrice: '2500',
  premiumPrice: '5000',
  currency: 'FCFA',
  currencySymbol: 'F',
};

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const formatPrice = (price: number | string) => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
};

const formatDate = (date: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateTime = (date: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface AdminPanelProps {
  onBack: () => void;
  siteSettings: any;
  onSettingsSaved: (settings: any) => void;
}

type TabId = 'dashboard' | 'properties' | 'messages' | 'users' | 'settings';

interface PropertyForm {
  type: string;
  status: string;
  title: string;
  description: string;
  price: string;
  surface: string;
  rooms: string;
  region: string;
  city: string;
  quartier: string;
}

const emptyProperty: PropertyForm = {
  type: 'maison',
  status: 'active',
  title: '',
  description: '',
  price: '',
  surface: '',
  rooms: '',
  region: '',
  city: '',
  quartier: '',
};

interface UserForm {
  fullName: string;
  phone: string;
  agencyName: string;
}

const emptyUser: UserForm = {
  fullName: '',
  phone: '',
  agencyName: '',
};

/* ------------------------------------------------------------------ */
/*  SIDERBAR TABS CONFIG                                               */
/* ------------------------------------------------------------------ */

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'properties', label: 'Biens', icon: <Building2 className="h-5 w-5" /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" /> },
  { id: 'users', label: 'Utilisateurs', icon: <Users className="h-5 w-5" /> },
  { id: 'settings', label: 'Paramètres', icon: <Settings className="h-5 w-5" /> },
];

/* ------------------------------------------------------------------ */
/*  API HELPERS                                                        */
/* ------------------------------------------------------------------ */

const fetchApi = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
};

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export default function AdminPanel({ onBack, siteSettings, onSettingsSaved }: AdminPanelProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  /* --- Auth check ------------------------------------------------- */
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['admin-session'],
    queryFn: () => fetchApi('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'session' }) }),
  });

  useEffect(() => {
    if (sessionData) {
      setIsAdmin(sessionData?.user?.profile?.role === 'admin');
    }
  }, [sessionData]);

  /* --- Properties state ------------------------------------------- */
  const [propSearch, setPropSearch] = useState('');
  const [propTypeFilter, setPropTypeFilter] = useState('all');
  const [propStatusFilter, setPropStatusFilter] = useState('all');
  const [propRegionFilter, setPropRegionFilter] = useState('all');
  const [propDialogOpen, setPropDialogOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<any>(null);
  const [propForm, setPropForm] = useState<PropertyForm>(emptyProperty);
  const [deletePropId, setDeletePropId] = useState<string | null>(null);
  const [deletePropDialogOpen, setDeletePropDialogOpen] = useState(false);

  /* --- Messages state --------------------------------------------- */
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  /* --- Users state ------------------------------------------------ */
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState<UserForm>(emptyUser);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  /* --- Settings state --------------------------------------------- */
  const [settingsForm, setSettingsForm] = useState<any>({ ...DEFAULT_SETTINGS, ...siteSettings });

  useEffect(() => {
    if (siteSettings) {
      setSettingsForm({ ...DEFAULT_SETTINGS, ...siteSettings });
    }
  }, [siteSettings]);

  /* ================================================================ */
  /*  QUERIES                                                         */
  /* ================================================================ */

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetchApi('/api/stats'),
    enabled: isAdmin === true,
  });

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => fetchApi('/api/admin/properties'),
    enabled: isAdmin === true,
  });

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => fetchApi('/api/admin/messages'),
    enabled: isAdmin === true,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetchApi('/api/admin/users'),
    enabled: isAdmin === true,
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => fetchApi('/api/admin/settings'),
    enabled: isAdmin === true,
  });

  useEffect(() => {
    if (settingsData) {
      setSettingsForm({ ...DEFAULT_SETTINGS, ...settingsData });
    }
  }, [settingsData]);

  /* ================================================================ */
  /*  MUTATIONS                                                       */
  /* ================================================================ */

  /* -- Property mutations ------------------------------------------ */
  const createProperty = useMutation({
    mutationFn: (data: any) => fetchApi('/api/admin/properties', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Bien créé avec succès');
      setPropDialogOpen(false);
      setPropForm(emptyProperty);
    },
    onError: () => toast.error("Erreur lors de la création du bien"),
  });

  const updateProperty = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchApi(`/api/admin/properties`, { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Bien mis à jour');
      setPropDialogOpen(false);
      setEditingProp(null);
      setPropForm(emptyProperty);
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteProperty = useMutation({
    mutationFn: (id: string) => fetchApi(`/api/admin/properties`, { method: 'DELETE', body: JSON.stringify({ id }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Bien supprimé');
      setDeletePropDialogOpen(false);
      setDeletePropId(null);
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const togglePremium = useMutation({
    mutationFn: ({ id, premium }: { id: string; premium: boolean }) =>
      fetchApi(`/api/admin/properties`, { method: 'PUT', body: JSON.stringify({ id, isPremium: premium }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Statut premium modifié');
    },
    onError: () => toast.error("Erreur lors de la modification"),
  });

  /* -- Message mutations ------------------------------------------- */
  const markAsRead = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/admin/messages`, { method: 'PUT', body: JSON.stringify({ id, read: true }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/admin/messages`, { method: 'DELETE', body: JSON.stringify({ id }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('Message supprimé');
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const replyToMessage = useMutation({
    mutationFn: ({ propertyId, content, toEmail }: { propertyId: string; content: string; toEmail: string }) =>
      fetchApi('/api/messages', { method: 'POST', body: JSON.stringify({ propertyId, content, toEmail }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('Réponse envoyée');
      setReplyTexts((prev: any) => ({ ...prev, [expandedMsgId || '']: '' }));
    },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });

  /* -- User mutations ---------------------------------------------- */
  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchApi(`/api/admin/users`, { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Utilisateur mis à jour');
      setUserDialogOpen(false);
      setEditingUser(null);
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const toggleVerified = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      fetchApi(`/api/admin/users`, { method: 'PUT', body: JSON.stringify({ id, verified }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Statut vérifié modifié');
    },
    onError: () => toast.error("Erreur lors de la modification"),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      fetchApi(`/api/admin/users`, { method: 'PUT', body: JSON.stringify({ id, role }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Rôle modifié');
    },
    onError: () => toast.error("Erreur lors de la modification du rôle"),
  });

  /* -- Settings mutation ------------------------------------------- */
  const saveSettings = useMutation({
    mutationFn: (data: any) => fetchApi('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      onSettingsSaved(data);
      toast.success('Paramètres sauvegardés');
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  /* ================================================================ */
  /*  HANDLERS                                                        */
  /* ================================================================ */

  const openNewPropDialog = () => {
    setEditingProp(null);
    setPropForm(emptyProperty);
    setPropDialogOpen(true);
  };

  const openEditPropDialog = (prop: any) => {
    setEditingProp(prop);
    setPropForm({
      type: prop.type || 'maison',
      status: prop.status || 'active',
      title: prop.title || '',
      description: prop.description || '',
      price: prop.price?.toString() || '',
      surface: prop.surface?.toString() || '',
      rooms: prop.rooms?.toString() || '',
      region: prop.region || '',
      city: prop.city || '',
      quartier: prop.quartier || '',
    });
    setPropDialogOpen(true);
  };

  const handleSaveProperty = () => {
    if (editingProp) {
      updateProperty.mutate({ id: editingProp.id, data: propForm });
    } else {
      createProperty.mutate(propForm);
    }
  };

  const handleDeleteProp = (id: string) => {
    setDeletePropId(id);
    setDeletePropDialogOpen(true);
  };

  const openEditUserDialog = (user: any) => {
    setEditingUser(user);
    setUserForm({
      fullName: user.fullName || user.name || '',
      phone: user.phone || '',
      agencyName: user.agencyName || user.agency || '',
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, data: userForm });
    }
  };

  const handleSaveSettings = () => {
    saveSettings.mutate(settingsForm);
  };

  const updateSetting = (key: string, value: string) => {
    setSettingsForm((prev: any) => ({ ...prev, [key]: value }));
  };

  /* --- Filtered properties ---------------------------------------- */
  const filteredProperties = (properties || [])?.filter((p: any) => {
    const matchSearch = p.title?.toLowerCase().includes(propSearch.toLowerCase());
    const matchType = propTypeFilter === 'all' || p.type === propTypeFilter;
    const matchStatus = propStatusFilter === 'all' || p.status === propStatusFilter;
    const matchRegion = propRegionFilter === 'all' || p.region === propRegionFilter;
    return matchSearch && matchType && matchStatus && matchRegion;
  });

  const filteredUsers = (users || [])?.filter((u: any) =>
    (u.fullName || u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  /* ================================================================ */
  /*  AUTH GUARD                                                      */
  /* ================================================================ */

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <Shield className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold">Accès restreint</h2>
        <p className="text-muted-foreground text-center">
          Vous n'avez pas les permissions nécessaires pour accéder au panneau d'administration.
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  /* ================================================================ */
  /*  SIDEBAR CONTENT (shared between desktop & mobile sheet)         */
  /* ================================================================ */

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800 w-full justify-start mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au site
        </Button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-green-700 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Administrateur</span>
        </div>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  TAB: DASHBOARD                                                  */
  /* ================================================================ */

  const DashboardTab = () => {
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

        {statsLoading ? (
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
                          {card.isPrice ? formatPrice(card.value) : (card.value as number).toLocaleString('fr-FR')}
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
  };

  /* ================================================================ */
  /*  TAB: PROPERTIES                                                 */
  /* ================================================================ */

  const PropertiesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Biens immobiliers</h1>
          <p className="text-muted-foreground">Gérez vos annonces</p>
        </div>
        <Button onClick={openNewPropDialog} style={{ backgroundColor: '#1B5E20' }} className="text-white hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bien
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={propSearch} onChange={(e) => setPropSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={propTypeFilter} onValueChange={setPropTypeFilter}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={propStatusFilter} onValueChange={setPropStatusFilter}>
          <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={propRegionFilter} onValueChange={setPropRegionFilter}>
          <SelectTrigger><SelectValue placeholder="Région" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les régions</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {propsLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun bien trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProperties?.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{p.title || '—'}</TableCell>
                        <TableCell>{TYPE_LABELS[p.type] || p.type}</TableCell>
                        <TableCell>{p.price ? formatPrice(p.price) : '—'}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[p.status] || 'outline'}>
                            {STATUS_LABELS[p.status] || p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.views || 0}</span>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => togglePremium.mutate({ id: p.id, premium: !p.isPremium })}>
                            {p.isPremium ? <Crown className="h-4 w-4 text-yellow-500" /> : <Crown className="h-4 w-4 text-gray-300" />}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(p.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditPropDialog(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProp(p.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={propDialogOpen} onOpenChange={setPropDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProp ? 'Modifier le bien' : 'Ajouter un bien'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={propForm.type} onValueChange={(v) => setPropForm({ ...propForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={propForm.status} onValueChange={(v) => setPropForm({ ...propForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Titre</Label>
              <Input value={propForm.title} onChange={(e) => setPropForm({ ...propForm, title: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={propForm.description} onChange={(e) => setPropForm({ ...propForm, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Prix (FCFA)</Label>
              <Input type="number" value={propForm.price} onChange={(e) => setPropForm({ ...propForm, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Surface (m²)</Label>
              <Input type="number" value={propForm.surface} onChange={(e) => setPropForm({ ...propForm, surface: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Pièces</Label>
              <Input type="number" value={propForm.rooms} onChange={(e) => setPropForm({ ...propForm, rooms: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Région</Label>
              <Select value={propForm.region} onValueChange={(v) => setPropForm({ ...propForm, region: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input value={propForm.city} onChange={(e) => setPropForm({ ...propForm, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Quartier</Label>
              <Input value={propForm.quartier} onChange={(e) => setPropForm({ ...propForm, quartier: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              onClick={handleSaveProperty}
              style={{ backgroundColor: '#1B5E20' }}
              className="text-white hover:opacity-90"
              disabled={createProperty.isPending || updateProperty.isPending}
            >
              {createProperty.isPending || updateProperty.isPending ? 'Enregistrement...' : editingProp ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deletePropDialogOpen} onOpenChange={setDeletePropDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => deletePropId && deleteProperty.mutate(deletePropId)} disabled={deleteProperty.isPending}>
              {deleteProperty.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  /* ================================================================ */
  /*  TAB: MESSAGES                                                   */
  /* ================================================================ */

  const MessagesTab = () => (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Gérez les demandes de contact</p>
      </div>

      {msgsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (!messages || messages.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucun message reçu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => (
            <Card key={msg.id} className={`overflow-hidden ${!msg.read ? 'border-l-4 border-l-green-600' : ''}`}>
              <CardContent className="p-4">
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => {
                    if (!msg.read) markAsRead.mutate(msg.id);
                    setExpandedMsgId(expandedMsgId === msg.id ? null : msg.id);
                  }}
                >
                  <div className={`mt-0.5 ${!msg.read ? 'text-green-600' : 'text-gray-400'}`}>
                    {!msg.read ? <Mail className="h-5 w-5" /> : <MailOpen className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{msg.name || msg.senderName || 'Anonyme'}</span>
                        {!msg.read && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {msg.subject || msg.message || 'Sans objet'}
                    </p>
                    {msg.propertyId && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        <HomeIcon className="h-3 w-3 mr-1" />
                        Bien lié
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${expandedMsgId === msg.id ? 'rotate-90' : ''}`} />
                </div>

                <AnimatePresence>
                  {expandedMsgId === msg.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Separator className="my-3" />
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {msg.email && (
                            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{msg.email}</span>
                          )}
                          {msg.phone && (
                            <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{msg.phone}</span>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message || msg.content}</p>

                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Écrire une réponse..."
                            value={replyTexts[msg.id] || ''}
                            onChange={(e) => setReplyTexts((prev: any) => ({ ...prev, [msg.id]: e.target.value }))}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && replyTexts[msg.id]?.trim()) {
                                replyToMessage.mutate({
                                  propertyId: msg.propertyId || '',
                                  content: replyTexts[msg.id],
                                  toEmail: msg.email || '',
                                });
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            style={{ backgroundColor: '#1B5E20' }}
                            className="text-white hover:opacity-90 shrink-0"
                            onClick={() => replyToMessage.mutate({
                              propertyId: msg.propertyId || '',
                              content: replyTexts[msg.id],
                              toEmail: msg.email || '',
                            })}
                            disabled={!replyTexts[msg.id]?.trim() || replyToMessage.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead.mutate(msg.id)}
                            disabled={msg.read}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Marquer comme lu
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => deleteMessage.mutate(msg.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  /* ================================================================ */
  /*  TAB: USERS                                                      */
  /* ================================================================ */

  const UsersTab = () => (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground">Gérez les comptes utilisateurs</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un utilisateur..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Vérifié</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers?.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.fullName || u.name || '—'}</TableCell>
                        <TableCell className="text-sm">{u.email || '—'}</TableCell>
                        <TableCell className="text-sm">{u.phone || '—'}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role || 'user'}
                            onValueChange={(v) => changeRole.mutate({ id: u.id, role: v })}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Utilisateur</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => toggleVerified.mutate({ id: u.id, verified: !u.verified })}>
                            {u.verified ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-300" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">{u.agencyName || u.agency || '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => openEditUserDialog(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nom de l'agence</Label>
              <Input value={userForm.agencyName} onChange={(e) => setUserForm({ ...userForm, agencyName: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              onClick={handleSaveUser}
              style={{ backgroundColor: '#1B5E20' }}
              className="text-white hover:opacity-90"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  /* ================================================================ */
  /*  TAB: SETTINGS                                                   */
  /* ================================================================ */

  const SettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configuration générale du site</p>
      </div>

      {settingsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Identité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Identité du site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du site</Label>
                  <Input value={settingsForm.siteName} onChange={(e) => updateSetting('siteName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input value={settingsForm.siteSlogan} onChange={(e) => updateSetting('siteSlogan', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>URL du logo</Label>
                  <Input value={settingsForm.logoUrl} onChange={(e) => updateSetting('logoUrl', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>URL du favicon</Label>
                  <Input value={settingsForm.faviconUrl} onChange={(e) => updateSetting('faviconUrl', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Couleurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Couleurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Couleur principale</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsForm.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border"
                    />
                    <Input value={settingsForm.primaryColor} onChange={(e) => updateSetting('primaryColor', e.target.value)} className="flex-1" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Aperçu :</span>
                    <div className="h-6 w-24 rounded" style={{ backgroundColor: settingsForm.primaryColor }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Couleur d'accentuation</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsForm.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border"
                    />
                    <Input value={settingsForm.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} className="flex-1" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Aperçu :</span>
                    <div className="h-6 w-24 rounded" style={{ backgroundColor: settingsForm.accentColor }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={settingsForm.contactEmail} onChange={(e) => updateSetting('contactEmail', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={settingsForm.contactPhone} onChange={(e) => updateSetting('contactPhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={settingsForm.contactWhatsapp} onChange={(e) => updateSetting('contactWhatsapp', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input value={settingsForm.contactAddress} onChange={(e) => updateSetting('contactAddress', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Réseaux sociaux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Réseaux sociaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input value={settingsForm.facebook} onChange={(e) => updateSetting('facebook', e.target.value)} placeholder="https://facebook.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={settingsForm.instagram} onChange={(e) => updateSetting('instagram', e.target.value)} placeholder="https://instagram.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input value={settingsForm.twitter} onChange={(e) => updateSetting('twitter', e.target.value)} placeholder="https://twitter.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>YouTube</Label>
                  <Input value={settingsForm.youtube} onChange={(e) => updateSetting('youtube', e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>TikTok</Label>
                  <Input value={settingsForm.tiktok} onChange={(e) => updateSetting('tiktok', e.target.value)} placeholder="https://tiktok.com/..." />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Titre SEO</Label>
                <Input value={settingsForm.seoTitle} onChange={(e) => updateSetting('seoTitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description SEO</Label>
                <Textarea value={settingsForm.seoDescription} onChange={(e) => updateSetting('seoDescription', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Mots-clés SEO</Label>
                <Input value={settingsForm.seoKeywords} onChange={(e) => updateSetting('seoKeywords', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Contenu Français */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Contenu en Français</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Titre principal (FR)</Label>
                <Input value={settingsForm.heroTitleFr} onChange={(e) => updateSetting('heroTitleFr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Sous-titre principal (FR)</Label>
                <Input value={settingsForm.heroSubtitleFr} onChange={(e) => updateSetting('heroSubtitleFr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>À propos du pied de page (FR)</Label>
                <Textarea value={settingsForm.footerAboutFr} onChange={(e) => updateSetting('footerAboutFr', e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Contenu Wolof */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Contenu en Wolof</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Titre principal (WO)</Label>
                <Input value={settingsForm.heroTitleWo} onChange={(e) => updateSetting('heroTitleWo', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Sous-titre principal (WO)</Label>
                <Input value={settingsForm.heroSubtitleWo} onChange={(e) => updateSetting('heroSubtitleWo', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>À propos du pied de page (WO)</Label>
                <Textarea value={settingsForm.footerAboutWo} onChange={(e) => updateSetting('footerAboutWo', e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Tarifs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5" /> Tarifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Prix du boost (FCFA)</Label>
                  <Input type="number" value={settingsForm.boostPrice} onChange={(e) => updateSetting('boostPrice', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prix premium (FCFA)</Label>
                  <Input type="number" value={settingsForm.premiumPrice} onChange={(e) => updateSetting('premiumPrice', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Input value={settingsForm.currency} onChange={(e) => updateSetting('currency', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Symbole de devise</Label>
                  <Input value={settingsForm.currencySymbol} onChange={(e) => updateSetting('currencySymbol', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              style={{ backgroundColor: '#1B5E20' }}
              className="text-white hover:opacity-90 px-8"
              disabled={saveSettings.isPending}
            >
              {saveSettings.isPending ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  /* ================================================================ */
  /*  MAIN LAYOUT                                                     */
  /* ================================================================ */

  const tabContent: Record<TabId, React.ReactNode> = {
    dashboard: <DashboardTab />,
    properties: <PropertiesTab />,
    messages: <MessagesTab />,
    users: <UsersTab />,
    settings: <SettingsTab />,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            SADEKH BTP
          </h2>
          <p className="text-xs text-gray-400 mt-1">Administration</p>
        </div>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-gray-900 text-white">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    SADEKH BTP
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Administration</p>
                </div>
                <ScrollArea className="h-full">{sidebarContent}</ScrollArea>
              </SheetContent>
            </Sheet>
            <span className="font-semibold">Admin</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {TABS.find((t) => t.id === activeTab)?.label}
          </Badge>
        </div>

        {/* Tab Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
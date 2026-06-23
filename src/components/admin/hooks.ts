import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const fetchApi = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return null; }
  } catch (e) {
    console.warn('fetchApi error:', url, e);
    return null;
  }
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

const emptyProperty = {
  type: 'maison', status: 'active', title: '', description: '',
  price: '', surface: '', rooms: '', region: '', city: '', quartier: '',
};

const emptyUser = { fullName: '', phone: '', agencyName: '' };

export function useAdmin(onBack: () => void, siteSettings: any, onSettingsSaved: (s: any) => void) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['admin-session'],
    queryFn: () => fetchApi('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'session' }) }),
    retry: false,
  });

  useEffect(() => {
    if (sessionLoading) return;
    if (!sessionData || !sessionData.user) {
      setIsAdmin(false);
    } else {
      setIsAdmin(sessionData.user?.profile?.role === 'admin');
    }
  }, [sessionData, sessionLoading]);

  /* -- Properties state -- */
  const [propSearch, setPropSearch] = useState('');
  const [propTypeFilter, setPropTypeFilter] = useState('all');
  const [propStatusFilter, setPropStatusFilter] = useState('all');
  const [propRegionFilter, setPropRegionFilter] = useState('all');
  const [propDialogOpen, setPropDialogOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<any>(null);
  const [propForm, setPropForm] = useState(emptyProperty);
  const [deletePropId, setDeletePropId] = useState<string | null>(null);
  const [deletePropDialogOpen, setDeletePropDialogOpen] = useState(false);

  /* -- Messages state -- */
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  /* -- Users state -- */
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  /* -- Settings state -- */
  const [settingsForm, setSettingsForm] = useState({ ...DEFAULT_SETTINGS, ...siteSettings });

  useEffect(() => {
    if (siteSettings) setSettingsForm({ ...DEFAULT_SETTINGS, ...siteSettings });
  }, [siteSettings]);

  /* ===== Queries ===== */
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
    if (settingsData) setSettingsForm({ ...DEFAULT_SETTINGS, ...settingsData });
  }, [settingsData]);

  /* ===== Mutations ===== */
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

  const markAsRead = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/admin/messages`, { method: 'PUT', body: JSON.stringify({ id, read: true }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
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
      setReplyTexts((prev) => ({ ...prev, [expandedMsgId || '']: '' }));
    },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });

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

  const saveSettings = useMutation({
    mutationFn: (data: any) => fetchApi('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      onSettingsSaved(data);
      toast.success('Paramètres sauvegardés');
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  /* ===== Handlers ===== */
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

  return {
    /* auth */
    sessionLoading, isAdmin, activeTab, setActiveTab,
    /* properties */
    propSearch, setPropSearch,
    propTypeFilter, setPropTypeFilter,
    propStatusFilter, setPropStatusFilter,
    propRegionFilter, setPropRegionFilter,
    propDialogOpen, setPropDialogOpen,
    editingProp, propForm, setPropForm,
    deletePropDialogOpen, setDeletePropDialogOpen,
    deletePropId,
    filteredProperties, propsLoading, properties,
    openNewPropDialog, openEditPropDialog, handleSaveProperty, handleDeleteProp,
    deleteProperty, togglePremium,
    createProperty, updateProperty,
    /* messages */
    messages, msgsLoading,
    expandedMsgId, setExpandedMsgId,
    replyTexts, setReplyTexts,
    markAsRead, deleteMessage, replyToMessage,
    /* users */
    userSearch, setUserSearch,
    filteredUsers, usersLoading,
    userDialogOpen, setUserDialogOpen,
    userForm, setUserForm,
    editingUser,
    openEditUserDialog, handleSaveUser,
    updateUser, toggleVerified, changeRole,
    /* settings */
    settingsForm, setSettingsForm, settingsLoading,
    updateSetting, handleSaveSettings, saveSettings,
    /* general */
    onBack, DEFAULT_SETTINGS,
  };
}

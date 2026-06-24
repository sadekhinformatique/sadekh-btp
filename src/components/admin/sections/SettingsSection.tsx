'use client';

import { useEffect, useState } from 'react';
import { Save, Globe2, Palette, Phone, Share2, Search, FileText, Coins, Settings2 } from 'lucide-react';

const DEFAULTS = {
  siteName: 'SADEKH BTP',
  siteSlogan: 'La première marketplace immobilière du Sénégal',
  logoUrl: '/logo-sadekh.png',
  faviconUrl: '/favicon.ico',
  primaryColor: '#df2531',
  accentColor: '#000000',
  contactEmail: 'contact@sadekhbtp.sn',
  contactPhone: '+221 77 123 45 67',
  contactWhatsapp: '+221 77 123 45 67',
  contactAddress: 'Dakar, Sénégal',
  facebook: '', instagram: '', twitter: '', youtube: '', tiktok: '',
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

const GROUPS = [
  { key: 'identity', label: 'Identité du site', icon: Globe2, fields: [
    { key: 'siteName', label: 'Nom du site' },
    { key: 'siteSlogan', label: 'Slogan' },
    { key: 'logoUrl', label: 'Logo (URL)' },
    { key: 'faviconUrl', label: 'Favicon (URL)' },
  ]},
  { key: 'colors', label: 'Couleurs', icon: Palette, colorFields: [
    { key: 'primaryColor', label: 'Couleur primaire' },
    { key: 'accentColor', label: 'Couleur accent' },
  ]},
  { key: 'contact', label: 'Contact', icon: Phone, fields: [
    { key: 'contactEmail', label: 'Email' },
    { key: 'contactPhone', label: 'Téléphone' },
    { key: 'contactWhatsapp', label: 'WhatsApp' },
    { key: 'contactAddress', label: 'Adresse' },
  ]},
  { key: 'social', label: 'Réseaux sociaux', icon: Share2, fields: [
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'twitter', label: 'Twitter' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'tiktok', label: 'TikTok' },
  ]},
  { key: 'seo', label: 'SEO', icon: Search, fields: [
    { key: 'seoTitle', label: 'Titre SEO' },
    { key: 'seoDescription', label: 'Description SEO', textarea: true },
    { key: 'seoKeywords', label: 'Mots-clés SEO' },
  ]},
  { key: 'contentFr', label: 'Contenu — Français', icon: FileText, fields: [
    { key: 'heroTitleFr', label: 'Titre hero' },
    { key: 'heroSubtitleFr', label: 'Sous-titre hero' },
    { key: 'footerAboutFr', label: 'Footer à propos', textarea: true },
  ]},
  { key: 'contentWo', label: 'Contenu — Wolof', icon: FileText, fields: [
    { key: 'heroTitleWo', label: 'Titre hero' },
    { key: 'heroSubtitleWo', label: 'Sous-titre hero' },
    { key: 'footerAboutWo', label: 'Footer à propos', textarea: true },
  ]},
  { key: 'pricing', label: 'Tarifs', icon: Coins, fields: [
    { key: 'boostPrice', label: 'Prix boost' },
    { key: 'premiumPrice', label: 'Prix premium' },
    { key: 'currency', label: 'Devise' },
    { key: 'currencySymbol', label: 'Symbole devise' },
  ]},
];

export default function SettingsSection() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setForm({ ...DEFAULTS, ...data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Erreur');
      setMessage('Paramètres sauvegardés avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-gray-100/50 rounded-xl animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-600 mt-1">Configuration générale du site</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl text-sm font-medium hover:from-red-800 hover:to-red-700 transition-all disabled:opacity-50 shadow-md shadow-red-200">
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border shadow-sm ${
          message.includes('Erreur') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-primary/10 text-primary border-primary/20'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {GROUPS.map((group) => (
          <div key={group.key} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-50/30 border-b border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
                <group.icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{group.label}</h3>
            </div>
            <div className="p-4 space-y-3">
              {group.fields?.map((f: any) => (
                <Field key={f.key} label={f.label} value={(form as any)[f.key]} onChange={(v: string) => set(f.key, v)} isTextarea={f.textarea} />
              ))}
              {(group as any).colorFields?.map((f: any) => (
                <ColorField key={f.key} label={f.label} value={(form as any)[f.key]} onChange={(v: string) => set(f.key, v)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, isTextarea }: { label: string; value: string; onChange: (v: string) => void; isTextarea?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {isTextarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" />
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" />
      </div>
    </div>
  );
}

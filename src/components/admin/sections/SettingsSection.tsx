'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

const DEFAULTS = {
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
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Erreur');
      setMessage('Paramètres sauvegardés');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-500">Configuration du site</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.includes('Erreur') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <Card label="Identité du site">
          <Field label="Nom du site" value={form.siteName} onChange={(v) => set('siteName', v)} />
          <Field label="Slogan" value={form.siteSlogan} onChange={(v) => set('siteSlogan', v)} />
          <Field label="Logo (URL)" value={form.logoUrl} onChange={(v) => set('logoUrl', v)} />
          <Field label="Favicon (URL)" value={form.faviconUrl} onChange={(v) => set('faviconUrl', v)} />
        </Card>

        <Card label="Couleurs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField label="Couleur primaire" value={form.primaryColor} onChange={(v) => set('primaryColor', v)} />
            <ColorField label="Couleur accent" value={form.accentColor} onChange={(v) => set('accentColor', v)} />
          </div>
        </Card>

        <Card label="Contact">
          <Field label="Email" value={form.contactEmail} onChange={(v) => set('contactEmail', v)} />
          <Field label="Téléphone" value={form.contactPhone} onChange={(v) => set('contactPhone', v)} />
          <Field label="WhatsApp" value={form.contactWhatsapp} onChange={(v) => set('contactWhatsapp', v)} />
          <Field label="Adresse" value={form.contactAddress} onChange={(v) => set('contactAddress', v)} />
        </Card>

        <Card label="Réseaux sociaux">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Facebook" value={form.facebook} onChange={(v) => set('facebook', v)} />
            <Field label="Instagram" value={form.instagram} onChange={(v) => set('instagram', v)} />
            <Field label="Twitter" value={form.twitter} onChange={(v) => set('twitter', v)} />
            <Field label="YouTube" value={form.youtube} onChange={(v) => set('youtube', v)} />
            <Field label="TikTok" value={form.tiktok} onChange={(v) => set('tiktok', v)} />
          </div>
        </Card>

        <Card label="SEO">
          <Field label="Titre SEO" value={form.seoTitle} onChange={(v) => set('seoTitle', v)} />
          <Field label="Description SEO" value={form.seoDescription} onChange={(v) => set('seoDescription', v)} isTextarea />
          <Field label="Mots-clés SEO" value={form.seoKeywords} onChange={(v) => set('seoKeywords', v)} />
        </Card>

        <Card label="Contenu — Français">
          <Field label="Titre hero" value={form.heroTitleFr} onChange={(v) => set('heroTitleFr', v)} />
          <Field label="Sous-titre hero" value={form.heroSubtitleFr} onChange={(v) => set('heroSubtitleFr', v)} />
          <Field label="Footer à propos" value={form.footerAboutFr} onChange={(v) => set('footerAboutFr', v)} isTextarea />
        </Card>

        <Card label="Contenu — Wolof">
          <Field label="Titre hero" value={form.heroTitleWo} onChange={(v) => set('heroTitleWo', v)} />
          <Field label="Sous-titre hero" value={form.heroSubtitleWo} onChange={(v) => set('heroSubtitleWo', v)} />
          <Field label="Footer à propos" value={form.footerAboutWo} onChange={(v) => set('footerAboutWo', v)} isTextarea />
        </Card>

        <Card label="Tarifs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Prix boost" value={form.boostPrice} onChange={(v) => set('boostPrice', v)} />
            <Field label="Prix premium" value={form.premiumPrice} onChange={(v) => set('premiumPrice', v)} />
            <Field label="Devise" value={form.currency} onChange={(v) => set('currency', v)} />
            <Field label="Symbole devise" value={form.currencySymbol} onChange={(v) => set('currencySymbol', v)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">{label}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, isTextarea }: { label: string; value: string; onChange: (v: string) => void; isTextarea?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      {isTextarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
    </div>
  );
}

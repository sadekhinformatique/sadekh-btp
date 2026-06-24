'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Check, ChevronLeft, ChevronRight, Zap, ImageIcon, MapPin, Sparkles, Home, Building2, MapPin as MapPinIcon, FileText, Upload, Loader2, Trash2 } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import dynamic from 'next/dynamic';

const GpsPicker = dynamic(() => import('@/components/sadekh/GpsPicker'), { ssr: false, loading: () => <div className="h-[350px] bg-muted animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Chargement de la carte...</div> });

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou'];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  maison: <Home className="w-5 h-5" />,
  appartement: <Building2 className="w-5 h-5" />,
  terrain: <MapPinIcon className="w-5 h-5" />,
  plan: <FileText className="w-5 h-5" />,
};

export default function PublishForm() {
  const {
    lang, publishStep, setPublishStep, publishForm, setPublishForm,
    publishing, setPublishing, publishSuccess, setPublishSuccess,
    setView,
  } = useStore();

  const form = publishForm;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const body = new FormData();
      for (const f of files) body.append('files', f, (f as File).name);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      if (data.urls && data.urls.length > 0) {
        setPublishForm({ ...form, images: [...form.images, ...data.urls] });
      }
    } catch (e) {
      alert(`Erreur lors de l'upload : ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    setPublishForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

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
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
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

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
              publishStep >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>{s}</div>
            {s < 4 && <div className={`flex-1 h-0.5 ${publishStep > s ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {publishStep === 1 && (
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

        {publishStep === 2 && (
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

        {publishStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('publish.step3', lang)}</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all"
            >
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground mb-2">{t('publish.photos', lang)}</p>
              <Button variant="outline" size="sm" type="button" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Upload...' : 'Choisir des fichiers'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP. Max 5MB par photo.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ''; }}
              />
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {form.images.map((url, i) => (
                  <div key={url} className="relative group rounded-xl overflow-hidden border border-border aspect-[4/3]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className={`w-4 h-4 ${form.images.length > 0 ? 'text-green-600' : 'text-muted-foreground/40'}`} />
              {form.images.length > 0
                ? `${form.images.length} image${form.images.length > 1 ? 's' : ''} sélectionnée${form.images.length > 1 ? 's' : ''}`
                : 'Aucune image sélectionnée'}
            </div>
          </div>
        )}

        {publishStep === 4 && (
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

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => publishStep > 1 ? setPublishStep(publishStep - 1) : setView('home')}>
            {publishStep > 1 ? <ChevronLeft className="w-4 h-4 mr-1" /> : null}
            {publishStep > 1 ? '' : t('common.cancel', lang)}
          </Button>
          {publishStep < 4 ? (
            <Button onClick={() => setPublishStep(publishStep + 1)}>
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
}

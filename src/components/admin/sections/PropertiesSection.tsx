'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Plus, Pencil, Trash2, Crown, Eye, X, Filter, Upload, Loader2, Trash2 as TrashIcon, ImageIcon } from 'lucide-react';

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou'];
const PROPERTY_TYPES = ['maison', 'appartement', 'terrain', 'plan'];
const STATUSES = ['draft', 'active', 'sold', 'suspended'];
const TYPE_LABELS: Record<string, string> = { maison: 'Maison', appartement: 'Appartement', terrain: 'Terrain', plan: 'Plan' };
const STATUS_LABELS: Record<string, string> = { draft: 'Brouillon', active: 'Active', sold: 'Vendue', suspended: 'Suspendue' };
const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  active: 'bg-red-50 text-red-700 border-red-200',
  sold: 'bg-gray-100 text-gray-600 border-gray-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
};

const EMPTY_FORM = { type: 'maison', status: 'active', title: '', description: '', price: '', surface: '', rooms: '', region: 'Dakar', city: '', quartier: '' };

function fmtPrice(n: number) { return n?.toLocaleString('fr-FR'); }
function fmtDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PropertiesSection() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/properties')
      .then((r) => r.json())
      .then((data) => setProperties(data.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = properties.filter((p) => {
    const ms = p.title?.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === 'all' || p.type === typeFilter;
    const msf = statusFilter === 'all' || p.status === statusFilter;
    return ms && mt && msf;
  });

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setImages([]); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      type: p.type || 'maison', status: p.status || 'active', title: p.title || '',
      description: p.description || '', price: String(p.price || ''),
      surface: String(p.surfaceM2 || ''), rooms: String(p.rooms || ''),
      region: p.region || 'Dakar', city: p.city || '', quartier: p.quartier || '',
    });
    setImages(p.images || []);
    setDialogOpen(true);
  };

  const uploadImage = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadingImg(true);
    try {
      const body = new FormData();
      for (const f of files) body.append('files', f);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (data.urls) setImages((prev) => [...prev, ...data.urls]);
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploadingImg(false);
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      surface: parseFloat(form.surface) || null,
      rooms: parseInt(form.rooms) || null,
      images,
    };
    try {
      const res = await fetch('/api/admin/properties', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });
      if (!res.ok) throw new Error('Erreur');
      setDialogOpen(false);
      load();
    } catch { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const deleteProp = async (id: string) => {
    if (!confirm('Supprimer définitivement ce bien ?')) return;
    try {
      const res = await fetch('/api/admin/properties', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Erreur');
      load();
    } catch { alert('Erreur lors de la suppression'); }
  };

  const togglePremium = async (id: string, premium: boolean) => {
    await fetch('/api/admin/properties', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isPremium: premium }) });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biens immobiliers</h1>
          <p className="text-sm text-gray-600 mt-1">{properties.length} annonce{properties.length > 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl text-sm font-medium hover:from-red-800 hover:to-red-700 transition-all shadow-md shadow-red-200">
          <Plus className="w-4 h-4" />
          Ajouter un bien
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un bien..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="w-4 h-4" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer">
            <option value="all">Tous types</option>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer">
            <option value="all">Tous statuts</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Building2Icon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Aucun bien trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50/50">
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Titre</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-right px-4 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Prix</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Statut</th>
                  <th className="text-center px-4 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Vues</th>
                  <th className="text-center px-4 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Premium</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-center px-4 py-3.5 font-semibold text-gray-700 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-red-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Building2Icon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{p.title || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-medium">{TYPE_LABELS[p.type] || p.type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-800">{p.price ? `${fmtPrice(p.price)} F` : '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_STYLES[p.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="flex items-center justify-center gap-1.5 text-gray-500 text-xs font-medium">
                        <Eye className="w-3.5 h-3.5" />{p.viewsCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => togglePremium(p.id, !p.isPremium)}
                        className={`p-1.5 rounded-lg transition-all ${p.isPremium ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}>
                        <Crown className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{fmtDate(p.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(p)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-600" title="Modifier">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProp(p.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-500" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-10 pb-10 overflow-y-auto" onClick={() => setDialogOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-lg text-gray-900">{editing ? 'Modifier le bien' : 'Ajouter un bien'}</h2>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <Field label="Type" select options={PROPERTY_TYPES.map((t) => ({ v: t, l: TYPE_LABELS[t] }))} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
              <Field label="Statut" select options={STATUSES.map((s) => ({ v: s, l: STATUS_LABELS[s] }))} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
              <Field label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} span={2} />
              <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea span={2} />
              <Field label="Prix (FCFA)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
              <Field label="Surface (m²)" type="number" value={form.surface} onChange={(v) => setForm({ ...form, surface: v })} />
              <Field label="Pièces" type="number" value={form.rooms} onChange={(v) => setForm({ ...form, rooms: v })} />
              <Field label="Région" select options={REGIONS.map((r) => ({ v: r, l: r }))} value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
              <Field label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <Field label="Quartier" value={form.quartier} onChange={(v) => setForm({ ...form, quartier: v })} />

              {/* Images */}
              <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Images</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all"
                >
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">Cliquez pour ajouter des photos</p>
                  <p className="text-xs text-gray-400">JPG, PNG, WebP — 5 Mo max</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files) uploadImage(e.target.files); e.target.value = ''; }}
                  />
                </div>
                {uploadingImg && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Upload en cours...
                  </div>
                )}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {images.map((url, i) => (
                      <div key={url} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[4/3]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50/30 rounded-b-2xl">
              <button onClick={() => setDialogOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-white rounded-xl transition-colors border border-gray-200">
                Annuler
              </button>
              <button onClick={save} disabled={saving}
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl hover:from-red-800 hover:to-red-700 transition-all disabled:opacity-50 shadow-md shadow-red-200 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer le bien'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Building2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M3 7v14M21 7v14M6 11h4v4H6zM14 11h4v4h-4zM9 3h6v4H9z" />
    </svg>
  );
}

function Field({ label, value, onChange, type, select, options, textarea, span }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; select?: boolean; options?: { v: string; l: string }[]; textarea?: boolean; span?: number;
}) {
  const cls = `w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${span ? 'col-span-2' : ''}`;
  return (
    <div className={`space-y-1.5 ${span === 2 ? 'col-span-2' : ''}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {select ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
          {options?.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

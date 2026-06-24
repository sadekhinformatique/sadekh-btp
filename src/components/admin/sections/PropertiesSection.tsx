'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Crown, Eye, X } from 'lucide-react';

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou'];
const PROPERTY_TYPES = ['maison', 'appartement', 'terrain', 'plan'];
const STATUSES = ['draft', 'active', 'sold', 'suspended'];
const TYPE_LABELS: Record<string, string> = { maison: 'Maison', appartement: 'Appartement', terrain: 'Terrain', plan: 'Plan' };
const STATUS_LABELS: Record<string, string> = { draft: 'Brouillon', active: 'Active', sold: 'Vendue', suspended: 'Suspendue' };
const STATUS_VARIANTS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-100 text-emerald-700',
  sold: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
};

const EMPTY_FORM = { type: 'maison', status: 'active', title: '', description: '', price: '', surface: '', rooms: '', region: 'Dakar', city: '', quartier: '' };

function formatPrice(n: number) { return n?.toLocaleString('fr-FR'); }
function formatDate(d: string) {
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
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      type: p.type || 'maison',
      status: p.status || 'active',
      title: p.title || '',
      description: p.description || '',
      price: String(p.price || ''),
      surface: String(p.surfaceM2 || ''),
      rooms: String(p.rooms || ''),
      region: p.region || 'Dakar',
      city: p.city || '',
      quartier: p.quartier || '',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const body = { ...form, price: parseFloat(form.price) || 0, surface: parseFloat(form.surface) || null, rooms: parseInt(form.rooms) || null };
    const url = editing ? '/api/admin/properties' : '/api/admin/properties';
    const method = editing ? 'PUT' : 'POST';
    const payload = editing ? { id: editing.id, data: body } : body;

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Erreur');
      setDialogOpen(false);
      load();
    } catch (e: any) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteProp = async (id: string) => {
    if (!confirm('Supprimer ce bien ?')) return;
    try {
      const res = await fetch('/api/admin/properties', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Erreur');
      load();
    } catch { alert('Erreur lors de la suppression'); }
  };

  const togglePremium = async (id: string, premium: boolean) => {
    try {
      await fetch('/api/admin/properties', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isPremium: premium }) });
      load();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biens immobiliers</h1>
          <p className="text-sm text-gray-500">{properties.length} annonces</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800">
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="all">Tous types</option>
          {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="all">Tous statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Aucun bien trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Titre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Prix</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Vues</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Premium</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{p.title || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{TYPE_LABELS[p.type] || p.type}</td>
                    <td className="px-4 py-3 text-right">{p.price ? `${formatPrice(p.price)} F` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_VARIANTS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-gray-500">
                        <Eye className="w-3.5 h-3.5" />{p.viewsCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => togglePremium(p.id, !p.isPremium)} className="p-1 hover:bg-gray-100 rounded">
                        {p.isPremium ? <Crown className="w-4 h-4 text-amber-500" /> : <Crown className="w-4 h-4 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded" title="Modifier"><Pencil className="w-4 h-4 text-gray-500" /></button>
                        <button onClick={() => deleteProp(p.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Supprimer"><Trash2 className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">{editing ? 'Modifier le bien' : 'Ajouter un bien'}</h2>
              <button onClick={() => setDialogOpen(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Statut</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-700">Titre</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Prix (FCFA)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Surface (m²)</label>
                <input type="number" value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Pièces</label>
                <input type="number" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Région</label>
                <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Ville</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Quartier</label>
                <input value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 disabled:opacity-50">
                {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Search, Pencil, CheckCircle2, XCircle, Users as UsersIcon, Shield, ShieldCheck } from 'lucide-react';

export default function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) =>
    (u.fullName || u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = async (id: string, role: string) => {
    await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role }) });
    load();
  };

  const toggleVerified = async (id: string, verified: boolean) => {
    await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, verified }) });
    load();
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setEditForm({ fullName: u.fullName || u.name || '', phone: u.phone || '' });
    setEditDialog(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, fullName: editForm.fullName, phone: editForm.phone }) });
      setEditDialog(false);
      load();
    } catch { alert('Erreur'); }
    finally { setSaving(false); }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-50 text-purple-700 border-purple-200',
      agent: 'bg-blue-50 text-blue-700 border-blue-200',
      user: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return styles[role] || styles.user;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-green-900">Utilisateurs</h1>
        <p className="text-sm text-green-600 mt-1">{users.length} utilisateur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''}</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-green-200 rounded-xl text-sm text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-green-100/70 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-green-50 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <UsersIcon className="w-12 h-12 mx-auto text-green-300 mb-3" />
            <p className="text-green-500 font-medium">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-100 bg-gradient-to-r from-green-50 to-green-50/50">
                  <th className="text-left px-4 py-3.5 font-semibold text-green-700 text-xs uppercase tracking-wider">Nom</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-green-700 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-green-700 text-xs uppercase tracking-wider">Rôle</th>
                  <th className="text-center px-4 py-3.5 font-semibold text-green-700 text-xs uppercase tracking-wider">Vérifié</th>
                  <th className="text-center px-4 py-3.5 font-semibold text-green-700 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-green-50 hover:bg-green-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                          {(u.fullName || u.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-green-900">{u.fullName || u.name || '—'}</p>
                          {u.phone && <p className="text-xs text-green-500">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-green-600">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 ${roleBadge(u.role || 'user')}`}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => toggleVerified(u.id, !u.verified)}
                        className={`p-1.5 rounded-lg transition-all ${u.verified ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        {u.verified
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <XCircle className="w-5 h-5 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => openEdit(u)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-green-500 hover:text-blue-600">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editDialog && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-green-100" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-green-100">
              <h2 className="font-bold text-lg text-green-900">Modifier l'utilisateur</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-green-700">Nom complet</label>
                <input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-green-200 rounded-xl text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-green-700">Téléphone</label>
                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-green-200 rounded-xl text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-green-100 bg-green-50/30">
              <button onClick={() => setEditDialog(false)}
                className="px-5 py-2.5 text-sm font-medium text-green-700 hover:bg-white rounded-xl transition-colors border border-green-200">
                Annuler
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl hover:from-green-800 hover:to-green-700 transition-all disabled:opacity-50 shadow-md shadow-green-200">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

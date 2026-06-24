'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Building2, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Identifiants invalides');

      const role = data.user?.profile?.role;
      if (role !== 'admin') {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' }),
        });
        throw new Error('Ce compte n\'a pas les droits d\'administration.');
      }

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0000] via-[#1a0000] to-[#2a0000] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-700 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-500/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Administration</h1>
          <p className="text-red-200/60 text-sm mt-1">SADEKH BTP</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-red-100">Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sadekhbtp.com"
              required
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-red-200/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-red-100">Mot de passe</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-red-200/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-200/50 hover:text-red-200 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl font-medium hover:from-red-800 hover:to-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          <p className="text-center text-red-200/40 text-xs">
            Accès réservé aux administrateurs
          </p>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-red-200/50 hover:text-red-200 text-sm transition-colors">
            &larr; Retour au site
          </a>
        </div>
      </div>
    </div>
  );
}

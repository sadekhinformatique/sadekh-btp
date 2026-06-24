'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminPage() {
  const [session, setSession] = useState<{ user: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'session' }),
    })
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        if (data?.user?.profile?.role !== 'admin') setLoading(false);
        else setLoading(false);
      })
      .catch(() => setLoading(null));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session?.user?.profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
          <p className="text-gray-500 mb-6">Seuls les administrateurs peuvent accéder à cette page.</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800"
          >
            Retour au site
          </a>
        </div>
      </div>
    );
  }

  return <AdminLayout user={session.user} />;
}

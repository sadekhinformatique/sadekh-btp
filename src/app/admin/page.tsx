'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'denied' | 'ok'>('loading');

  useEffect(() => {
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'session' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.profile?.role === 'admin') {
          setUser(data.user);
          setStatus('ok');
        } else {
          setStatus('denied');
          router.push('/admin/login');
        }
      })
      .catch(() => {
        setStatus('denied');
        router.push('/admin/login');
      });
  }, [router]);

  if (status !== 'ok') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0000] via-[#1a0000] to-[#2a0000]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-red-200/60">Vérification...</p>
        </div>
      </div>
    );
  }

  return <AdminLayout user={user} />;
}

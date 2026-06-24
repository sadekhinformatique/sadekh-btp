'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'session' }),
    })
      .then((r) => r.json())
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  return <AdminLayout user={user} />;
}

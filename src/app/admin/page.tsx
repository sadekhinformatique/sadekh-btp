'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

const AdminPanel = dynamic(() => import('@/components/sadekh/AdminPanel'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

export default function AdminPage() {
  const [settings, setSettings] = useState<any>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminPanel
        onBack={() => { window.location.href = '/'; }}
        siteSettings={settings}
        onSettingsSaved={(s) => setSettings(s)}
      />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
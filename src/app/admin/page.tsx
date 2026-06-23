'use client';

import React, { Component, ReactNode } from 'react';
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

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Erreur de chargement</h1>
            <p className="text-muted-foreground mb-4 max-w-md">
              Une erreur inattendue est survenue dans le panneau d&apos;administration.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
              >
                Réessayer
              </button>
              <a
                href="/"
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted"
              >
                Retour au site
              </a>
            </div>
          </div>
        }
      >
        <AdminPanel
          onBack={() => { window.location.href = '/'; }}
          siteSettings={null}
          onSettingsSaved={() => {}}
        />
      </ErrorBoundary>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

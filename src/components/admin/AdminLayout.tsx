'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, MessageSquare, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import OverviewSection from './sections/OverviewSection';
import PropertiesSection from './sections/PropertiesSection';
import MessagesSection from './sections/MessagesSection';
import UsersSection from './sections/UsersSection';
import SettingsSection from './sections/SettingsSection';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard, comp: OverviewSection },
  { id: 'properties', label: 'Biens immobiliers', icon: Building2, comp: PropertiesSection },
  { id: 'messages', label: 'Messages', icon: MessageSquare, comp: MessagesSection },
  { id: 'users', label: 'Utilisateurs', icon: Users, comp: UsersSection },
  { id: 'settings', label: 'Paramètres', icon: Settings, comp: SettingsSection },
] as const;

type TabId = typeof TABS[number]['id'];

export default function AdminLayout({ user }: { user: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActiveSection = TABS.find((t) => t.id === activeTab)!.comp;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/60 to-red-50/20 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
        flex flex-col transition-transform duration-300 shadow-lg md:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="relative">
          <div className="h-1 bg-gradient-to-r from-red-700 via-black to-red-700" />
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-700 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                SB
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-tight">SADEKH BTP</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Administration</p>
              </div>
            </a>
            <button className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider pt-2 pb-1">Navigation</p>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-700 text-white shadow-md shadow-red-200'
                    : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-300' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 bg-gray-50/30">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              {user?.profile?.fullName?.[0] || user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.profile?.fullName || user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-1">
            <a
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-white hover:text-red-700 transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Site</span>
            </a>
            <button
              onClick={async () => {
                await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
                router.push('/admin/login');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3 shadow-sm sticky top-0 z-30">
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-700 to-red-600 flex items-center justify-center text-white font-bold text-[10px]">SB</div>
            <span className="font-bold text-gray-900 text-sm">{TABS.find((t) => t.id === activeTab)?.label}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <ActiveSection />
        </main>

        <footer className="border-t border-gray-200 bg-white px-6 py-3 text-center text-xs text-gray-500">
          SADEKH BTP &copy; {new Date().getFullYear()} &mdash; Panneau d'administration
        </footer>
      </div>
    </div>
  );
}

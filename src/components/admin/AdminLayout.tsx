'use client';

import { useState } from 'react';
import { LayoutDashboard, Building2, MessageSquare, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import OverviewSection from './sections/OverviewSection';
import PropertiesSection from './sections/PropertiesSection';
import MessagesSection from './sections/MessagesSection';
import UsersSection from './sections/UsersSection';
import SettingsSection from './sections/SettingsSection';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'properties', label: 'Biens', icon: Building2 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'settings', label: 'Paramètres', icon: Settings },
] as const;

type TabId = typeof TABS[number]['id'];

export default function AdminLayout({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveSection = {
    overview: OverviewSection,
    properties: PropertiesSection,
    messages: MessagesSection,
    users: UsersSection,
    settings: SettingsSection,
  }[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo-sadekh.png" alt="SADEKH BTP" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-emerald-800">SADEKH BTP</span>
          </a>
          <button className="md:hidden p-1 hover:bg-gray-100 rounded" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {user?.profile?.fullName?.[0] || user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.profile?.fullName || user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 mt-1"
          >
            <LogOut className="w-4 h-4" />
            Retour au site
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3">
          <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-emerald-800">{TABS.find((t) => t.id === activeTab)?.label}</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <ActiveSection />
        </main>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  BarChart3, Building2, Home, MessageSquare, Users, Settings,
  ArrowLeft, Menu, Shield, ShieldCheck, Crown,
} from 'lucide-react';
import { useAdmin } from '@/components/admin/hooks';
import DashboardTab from '@/components/admin/DashboardTab';
import PropertiesTab from '@/components/admin/PropertiesTab';
import MessagesTab from '@/components/admin/MessagesTab';
import UsersTab from '@/components/admin/UsersTab';
import SettingsTab from '@/components/admin/SettingsTab';

interface Props {
  onBack: () => void;
  siteSettings: any;
  onSettingsSaved: (s: any) => void;
}

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'properties', label: 'Biens', icon: <Building2 className="h-5 w-5" /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" /> },
  { id: 'users', label: 'Utilisateurs', icon: <Users className="h-5 w-5" /> },
  { id: 'settings', label: 'Paramètres', icon: <Settings className="h-5 w-5" /> },
];

export default function AdminPanel(props: Props) {
  const a = useAdmin(props.onBack, props.siteSettings, props.onSettingsSaved);

  if (a.sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (a.isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <Shield className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold">Accès restreint</h2>
        <p className="text-muted-foreground text-center">
          Vous n'avez pas les permissions nécessaires pour accéder au panneau d'administration.
        </p>
        <Button onClick={a.onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <Button variant="ghost" onClick={a.onBack} className="text-white hover:bg-gray-800 w-full justify-start mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au site
        </Button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => a.setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              a.activeTab === tab.id
                ? 'bg-green-700 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Administrateur</span>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<string, React.ReactNode> = {
    dashboard: (
      <DashboardTab
        stats={a.stats}
        isLoading={a.statsLoading}
      />
    ),
    properties: (
      <PropertiesTab
        filteredProperties={a.filteredProperties}
        propsLoading={a.propsLoading}
        propSearch={a.propSearch}
        setPropSearch={a.setPropSearch}
        propTypeFilter={a.propTypeFilter}
        setPropTypeFilter={a.setPropTypeFilter}
        propStatusFilter={a.propStatusFilter}
        setPropStatusFilter={a.setPropStatusFilter}
        propRegionFilter={a.propRegionFilter}
        setPropRegionFilter={a.setPropRegionFilter}
        propDialogOpen={a.propDialogOpen}
        setPropDialogOpen={a.setPropDialogOpen}
        deletePropDialogOpen={a.deletePropDialogOpen}
        setDeletePropDialogOpen={a.setDeletePropDialogOpen}
        deletePropId={a.deletePropId}
        propForm={a.propForm}
        setPropForm={a.setPropForm}
        editingProp={a.editingProp}
        openNewPropDialog={a.openNewPropDialog}
        openEditPropDialog={a.openEditPropDialog}
        handleSaveProperty={a.handleSaveProperty}
        handleDeleteProp={a.handleDeleteProp}
        deleteProperty={a.deleteProperty}
        togglePremium={a.togglePremium}
        createProperty={a.createProperty}
        updateProperty={a.updateProperty}
      />
    ),
    messages: (
      <MessagesTab
        messages={a.messages}
        msgsLoading={a.msgsLoading}
        expandedMsgId={a.expandedMsgId}
        setExpandedMsgId={a.setExpandedMsgId}
        replyTexts={a.replyTexts}
        setReplyTexts={a.setReplyTexts}
        markAsRead={a.markAsRead}
        deleteMessage={a.deleteMessage}
        replyToMessage={a.replyToMessage}
      />
    ),
    users: (
      <UsersTab
        filteredUsers={a.filteredUsers}
        usersLoading={a.usersLoading}
        userSearch={a.userSearch}
        setUserSearch={a.setUserSearch}
        userDialogOpen={a.userDialogOpen}
        setUserDialogOpen={a.setUserDialogOpen}
        userForm={a.userForm}
        setUserForm={a.setUserForm}
        editingUser={a.editingUser}
        openEditUserDialog={a.openEditUserDialog}
        handleSaveUser={a.handleSaveUser}
        updateUser={a.updateUser}
        toggleVerified={a.toggleVerified}
        changeRole={a.changeRole}
      />
    ),
    settings: (
      <SettingsTab
        settingsForm={a.settingsForm}
        settingsLoading={a.settingsLoading}
        updateSetting={a.updateSetting}
        handleSaveSettings={a.handleSaveSettings}
        saveSettings={a.saveSettings}
      />
    ),
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Crown className="h-5 w-5" />
            SADEKH BTP
          </h2>
          <p className="text-xs text-gray-400 mt-1">Administration</p>
        </div>
        {sidebarContent}
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-gray-900 text-white">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    SADEKH BTP
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Administration</p>
                </div>
                <ScrollArea className="h-full">{sidebarContent}</ScrollArea>
              </SheetContent>
            </Sheet>
            <span className="font-semibold">Admin</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {TABS.find((t) => t.id === a.activeTab)?.label}
          </Badge>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={a.activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tabContent[a.activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

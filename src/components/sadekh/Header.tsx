'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Home, Building2, MapPin, FileText, Heart, MessageCircle, Plus, Menu, Bell, LogOut,
  LogIn, Globe, Shield, BarChart3, MapIcon
} from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import type { View } from '@/lib/types';

export default function Header() {
  const {
    lang, view, setView, setLang, currentUser, setCurrentUser, setShowAuth,
    setShowAlertPanel, showAlertPanel, mobileMenu, setMobileMenu, siteSettings,
    resetView, updateFilter,
  } = useStore();

  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'nav.home', icon: <Home className="w-4 h-4" /> },
    { id: 'listing', label: 'nav.properties', icon: <Building2 className="w-4 h-4" /> },
    { id: 'map', label: 'Vue carte', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'plans', label: 'nav.plans', icon: <FileText className="w-4 h-4" /> },
    { id: 'favorites', label: 'nav.favorites', icon: <Heart className="w-4 h-4" /> },
    { id: 'messages', label: 'nav.messages', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'dashboard', label: 'nav.dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const mobileNav: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'nav.home', icon: <Home className="w-5 h-5" /> },
    { id: 'listing', label: 'nav.properties', icon: <Building2 className="w-5 h-5" /> },
    { id: 'plans', label: 'nav.plans', icon: <FileText className="w-5 h-5" /> },
    { id: 'favorites', label: 'nav.favorites', icon: <Heart className="w-5 h-5" /> },
    { id: 'messages', label: 'nav.messages', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'publish', label: 'nav.publish', icon: <Plus className="w-5 h-5" /> },
    { id: 'dashboard', label: 'nav.dashboard', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: View) => {
    if (id === 'plans') { updateFilter('type', 'plan'); setView('listing'); }
    else if (id === 'listing' || id === 'map') { updateFilter('type', 'all'); setView(id); }
    else { setView(id); }
  };

  const handleMobileNavClick = (id: View) => {
    handleNavClick(id);
    setMobileMenu(false);
  };

  const handleLogout = async () => {
    try { await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }); } catch {}
    setCurrentUser(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-border">
      <div className="senegal-stripe" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={resetView} className="flex items-center gap-2 shrink-0">
            <img src={siteSettings?.logoUrl || '/logo-sadekh.png'} alt={siteSettings?.siteName || 'SADEKH BTP'} className="h-9 w-9 rounded-full object-cover" />
            <span className="font-bold text-lg tracking-tight text-primary hidden sm:block">{siteSettings?.siteName || 'SADEKH BTP'}</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={view === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavClick(item.id)}
                className="gap-1.5 text-sm"
              >
                {item.icon}
                {t(item.label, lang)}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" onClick={() => setShowAlertPanel(!showAlertPanel)}>
                    <Bell className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{lang === 'fr' ? 'Alertes' : 'Alart'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {currentUser ? (
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                  {currentUser.profile?.fullName?.[0] || currentUser.name?.[0] || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.profile?.fullName || currentUser.name}</span>
                {currentUser.profile?.role === 'admin' && (
                  <Badge variant="default" className="text-[9px] px-1 h-4 cursor-pointer hover:opacity-80" onClick={() => window.location.href = '/admin'}>Admin</Badge>
                )}
                <LogOut className="w-3 h-3" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAuth(true)} className="gap-1.5">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.login', lang)}</span>
              </Button>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setLang(lang === 'fr' ? 'wo' : 'fr')} className="gap-1 text-xs font-bold">
                    <Globe className="w-3.5 h-3.5" />
                    {lang === 'fr' ? 'Wolof' : 'FR'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{lang === 'fr' ? 'Wax ci Wolof' : 'Switch to French'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button size="sm" onClick={() => setView('publish')} className="gap-1.5 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.publish', lang)}</span>
            </Button>

            <Sheet open={mobileMenu} onOpenChange={setMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src={siteSettings?.logoUrl || '/logo-sadekh.png'} alt={siteSettings?.siteName || 'SADEKH BTP'} className="h-8 w-8 rounded-full" />
                    {siteSettings?.siteName || 'SADEKH BTP'}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  {mobileNav.map((item) => (
                    <Button
                      key={item.id}
                      variant={view === item.id ? 'secondary' : 'ghost'}
                      className="justify-start gap-3 h-12 text-base"
                      onClick={() => handleMobileNavClick(item.id)}
                    >
                      {item.icon}
                      {t(item.label, lang)}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

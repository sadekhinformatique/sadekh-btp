'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t, type Lang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogIn, Mail, Lock, User, Eye, EyeOff, Globe, Loader2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  onLogin: (user: any) => void;
}

export default function AuthModal({ open, onClose, lang, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session' }),
      });
      const data = await res.json();
      if (data.user) {
        onLogin(data.user);
        onClose();
      }
    } catch {}
  };

  // Check for existing session on mount
  useEffect(() => {
    if (open) checkSession();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const action = mode === 'login' ? 'login' : 'register';
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email, password, fullName }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        setError('');
        setLoading(false);
        setMode('login');
        setPassword('');
        return;
      }

      if (data.user) {
        onLogin(data.user);
        setLoading(false);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'google' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Google auth non configuré');
        setLoading(false);
      }
    } catch {
      setError('Erreur Google Auth');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <LogIn className="w-4 h-4 text-primary-foreground" />
            </div>
            {mode === 'login' ? t('nav.login', lang) : 'Créer un compte'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <Label>Nom complet</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Amadou Diallo"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <Label>Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="votre@email.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label>Mot de passe</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {mode === 'login' ? t('nav.login', lang) : 'Créer mon compte'}
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">ou</span>
          </div>

          <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleAuth} disabled={loading}>
            <Globe className="w-4 h-4" />
            Continuer avec Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? 'Pas de compte ?' : 'Déjà un compte ?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'login' ? 'Créer un compte' : t('nav.login', lang)}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
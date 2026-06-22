'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, X } from 'lucide-react';
import { useStore } from '@/lib/store';

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Louga', 'Diourbel', 'Tambacounda', 'Kolda', 'Sédhiou', 'Kédougou'];

export default function AlertPanel() {
  const { lang, showAlertPanel, setShowAlertPanel, currentUser, newAlert, setNewAlert, alertCreating, setAlertCreating } = useStore();

  const handleCreate = async () => {
    setAlertCreating(true);
    try {
      await fetch('/api/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', ...newAlert }) });
    } catch {}
    setAlertCreating(false);
  };

  if (!showAlertPanel) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed top-20 right-4 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> {lang === 'fr' ? 'Alertes immobilier' : 'Alart immobiliér'}</h3>
        <button onClick={() => setShowAlertPanel(false)}><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        {currentUser ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Select value={newAlert.type} onValueChange={(v) => setNewAlert({ ...newAlert, type: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="maison">Maisons</SelectItem>
                  <SelectItem value="appartement">Apparts</SelectItem>
                  <SelectItem value="terrain">Terrains</SelectItem>
                  <SelectItem value="plan">Plans</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newAlert.region} onValueChange={(v) => setNewAlert({ ...newAlert, region: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input type="number" placeholder="Budget max (FCFA)" className="h-8 text-xs" value={newAlert.maxPrice} onChange={(e) => setNewAlert({ ...newAlert, maxPrice: e.target.value })} />
            <Button size="sm" className="w-full h-8 text-xs" disabled={alertCreating} onClick={handleCreate}>
              <Bell className="w-3 h-3 mr-1" /> {lang === 'fr' ? "Créer l'alerte" : 'Sos alart bi'}
            </Button>
            <div className="text-xs text-muted-foreground">{lang === 'fr' ? 'Vous recevrez une notification pour chaque nouveau bien correspondant à vos critères.' : 'Dangay jott ndax sax biir bu nocci seen kaalaan.'}</div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {lang === 'fr' ? 'Connectez-vous pour créer des alertes' : 'Seet ngir sos alart'}
          </p>
        )}
      </div>
    </motion.div>
  );
}

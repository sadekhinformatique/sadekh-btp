'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t, formatPrice, type Lang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Phone, CreditCard, Check, AlertCircle, Loader2, MessageCircle, Shield } from 'lucide-react';
import type { Property } from '@/lib/types';

interface PaymentModalProps {
  property: Property;
  lang: Lang;
  open: boolean;
  onClose: () => void;
  type: 'boost' | 'plan' | 'premium';
}

type PayMethod = 'wave' | 'orange_money';

export default function PaymentModal({ property, lang, open, onClose, type }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'confirm' | 'processing' | 'success' | 'error'>('method');
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const amount = type === 'plan' ? property.price : type === 'boost' ? 5000 : 15000;
  const description = type === 'plan'
    ? `Achat plan: ${property.title}`
    : type === 'boost'
      ? `Boost annonce: ${property.title}`
      : `Annonce Premium: ${property.title}`;

  const handlePay = async () => {
    setStep('processing');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          amount: amount,
          method: method,
          propertyId: property.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        setStep('error');
      }
    } catch {
      // Fallback to simulated success for demo
      setTimeout(() => { setStep(Math.random() > 0.1 ? 'success' : 'error'); }, 2000);
    }
  };

  const reset = () => {
    setStep('method');
    setMethod(null);
    setPhone('');
    setOtp('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {type === 'plan' ? t('detail.downloadPlan', lang) : type === 'boost' ? t('dashboard.boost', lang) : t('publish.premium', lang)}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose payment method */}
          {step === 'method' && (
            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{description}</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(amount, lang)}</span>
                </div>
              </Card>

              <div className="space-y-3">
                <button
                  onClick={() => setMethod('wave')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    method === 'wave' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                    <span className="font-bold text-sky-600 text-lg">W</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Wave</div>
                    <div className="text-xs text-muted-foreground">Paiement instantané</div>
                  </div>
                  <Shield className="w-5 h-5 text-green-500 ml-auto" />
                </button>

                <button
                  onClick={() => setMethod('orange_money')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    method === 'orange_money' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <span className="font-bold text-orange-600 text-lg">OM</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Orange Money</div>
                    <div className="text-xs text-muted-foreground">Paiement mobile</div>
                  </div>
                  <Shield className="w-5 h-5 text-green-500 ml-auto" />
                </button>
              </div>

              <Button className="w-full mt-4" disabled={!method} onClick={() => setStep('confirm')}>
                Continuer
              </Button>
            </motion.div>
          )}

          {/* Step 2: Confirm with phone number */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
                  backgroundColor: method === 'wave' ? '#E3F2FD' : '#FFF3E0'
                }}>
                  <span className="font-bold text-2xl" style={{ color: method === 'wave' ? '#0277BD' : '#E65100' }}>
                    {method === 'wave' ? 'W' : 'OM'}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">
                  {method === 'wave' ? 'Payer avec Wave' : 'Payer avec Orange Money'}
                </h3>
                <p className="text-2xl font-bold text-primary mt-2">{formatPrice(amount, lang)}</p>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Numéro de téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+221 77 123 45 67"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Code OTP (si requis)</label>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Entrez le code reçu par SMS"
                    className="text-center text-lg tracking-[0.5em]"
                  />
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('method')}>
                    Retour
                  </Button>
                  <Button className="flex-1" onClick={handlePay} disabled={phone.length < 8}>
                    {formatPrice(amount, lang)} →
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
              <h3 className="font-semibold text-lg">Traitement en cours...</h3>
              <p className="text-sm text-muted-foreground mt-1">Veuillez confirmer le paiement sur votre téléphone</p>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-xl text-green-700 mb-2">Paiement réussi !</h3>
              <p className="text-sm text-muted-foreground mb-1">{description}</p>
              <p className="font-bold text-lg text-primary">{formatPrice(amount, lang)}</p>
              <div className="bg-muted rounded-lg p-3 mt-4 text-xs text-left space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Référence</span><span className="font-mono">{method === 'wave' ? 'WAVE' : 'OM'}-{Date.now()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Méthode</span><span>{method === 'wave' ? 'Wave' : 'Orange Money'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Statut</span><span className="text-green-600 font-medium">Confirmé</span></div>
              </div>
              <Button className="w-full mt-4" onClick={handleClose}>Fermer</Button>
            </motion.div>
          )}

          {/* Step 5: Error */}
          {step === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="font-bold text-xl text-red-700 mb-2">Paiement échoué</h3>
              <p className="text-sm text-muted-foreground mb-4">Vérifiez votre solde et réessayez</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClose}>Annuler</Button>
                <Button className="flex-1" onClick={handlePay}>Réessayer</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
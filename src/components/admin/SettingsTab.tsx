'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText, Globe, Palette, Phone, MessageCircle, Sparkles, CircleDollarSign, Building2,
} from 'lucide-react';

interface Props {
  settingsForm: any;
  settingsLoading: boolean;
  updateSetting: (key: string, value: string) => void;
  handleSaveSettings: () => void;
  saveSettings: any;
}

export default function SettingsTab(props: Props) {
  const { settingsForm, settingsLoading, updateSetting, handleSaveSettings, saveSettings } = props;

  if (settingsLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configuration générale du site</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Identité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom du site</Label>
              <Input value={settingsForm.siteName} onChange={(e) => updateSetting('siteName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slogan</Label>
              <Input value={settingsForm.siteSlogan} onChange={(e) => updateSetting('siteSlogan', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>URL du logo</Label>
              <Input value={settingsForm.logoUrl} onChange={(e) => updateSetting('logoUrl', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>URL du favicon</Label>
              <Input value={settingsForm.faviconUrl} onChange={(e) => updateSetting('faviconUrl', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Couleurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Couleur principale</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settingsForm.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input value={settingsForm.primaryColor} onChange={(e) => updateSetting('primaryColor', e.target.value)} className="flex-1" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Aperçu :</span>
                <div className="h-6 w-24 rounded" style={{ backgroundColor: settingsForm.primaryColor }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Couleur d'accentuation</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settingsForm.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input value={settingsForm.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} className="flex-1" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Aperçu :</span>
                <div className="h-6 w-24 rounded" style={{ backgroundColor: settingsForm.accentColor }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={settingsForm.contactEmail} onChange={(e) => updateSetting('contactEmail', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={settingsForm.contactPhone} onChange={(e) => updateSetting('contactPhone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={settingsForm.contactWhatsapp} onChange={(e) => updateSetting('contactWhatsapp', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={settingsForm.contactAddress} onChange={(e) => updateSetting('contactAddress', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input value={settingsForm.facebook} onChange={(e) => updateSetting('facebook', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={settingsForm.instagram} onChange={(e) => updateSetting('instagram', e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Twitter / X</Label>
              <Input value={settingsForm.twitter} onChange={(e) => updateSetting('twitter', e.target.value)} placeholder="https://twitter.com/..." />
            </div>
            <div className="space-y-2">
              <Label>YouTube</Label>
              <Input value={settingsForm.youtube} onChange={(e) => updateSetting('youtube', e.target.value)} placeholder="https://youtube.com/..." />
            </div>
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input value={settingsForm.tiktok} onChange={(e) => updateSetting('tiktok', e.target.value)} placeholder="https://tiktok.com/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Titre SEO</Label>
            <Input value={settingsForm.seoTitle} onChange={(e) => updateSetting('seoTitle', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description SEO</Label>
            <Textarea value={settingsForm.seoDescription} onChange={(e) => updateSetting('seoDescription', e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Mots-clés SEO</Label>
            <Input value={settingsForm.seoKeywords} onChange={(e) => updateSetting('seoKeywords', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Contenu en Français</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Titre principal (FR)</Label>
            <Input value={settingsForm.heroTitleFr} onChange={(e) => updateSetting('heroTitleFr', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Sous-titre principal (FR)</Label>
            <Input value={settingsForm.heroSubtitleFr} onChange={(e) => updateSetting('heroSubtitleFr', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>À propos du pied de page (FR)</Label>
            <Textarea value={settingsForm.footerAboutFr} onChange={(e) => updateSetting('footerAboutFr', e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Contenu en Wolof</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Titre principal (WO)</Label>
            <Input value={settingsForm.heroTitleWo} onChange={(e) => updateSetting('heroTitleWo', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Sous-titre principal (WO)</Label>
            <Input value={settingsForm.heroSubtitleWo} onChange={(e) => updateSetting('heroSubtitleWo', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>À propos du pied de page (WO)</Label>
            <Textarea value={settingsForm.footerAboutWo} onChange={(e) => updateSetting('footerAboutWo', e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5" /> Tarifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Prix du boost (FCFA)</Label>
              <Input type="number" value={settingsForm.boostPrice} onChange={(e) => updateSetting('boostPrice', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Prix premium (FCFA)</Label>
              <Input type="number" value={settingsForm.premiumPrice} onChange={(e) => updateSetting('premiumPrice', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Devise</Label>
              <Input value={settingsForm.currency} onChange={(e) => updateSetting('currency', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Symbole de devise</Label>
              <Input value={settingsForm.currencySymbol} onChange={(e) => updateSetting('currencySymbol', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          style={{ backgroundColor: '#1B5E20' }}
          className="text-white hover:opacity-90 px-8"
          disabled={saveSettings.isPending}
        >
          {saveSettings.isPending ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
        </Button>
      </div>
    </div>
  );
}

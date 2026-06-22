'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';

export default function Footer() {
  const { lang, siteSettings, updateFilter, setView } = useStore();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={siteSettings?.logoUrl || '/logo-sadekh.png'} alt={siteSettings?.siteName || 'SADEKH BTP'} className="h-8 w-8 rounded-full" />
              <span className="font-bold text-lg">{siteSettings?.siteName || 'SADEKH BTP'}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              {lang === 'wo'
                ? (siteSettings?.footerAboutWo || t('footer.about.desc', lang))
                : (siteSettings?.footerAboutFr || t('footer.about.desc', lang))}
            </p>
            <div className="flex gap-3 mt-4">
              {['Wave', 'Orange Money'].map((m) => (
                <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.links', lang)}</h3>
            <div className="space-y-2">
              {['maison', 'appartement', 'terrain', 'plan'].map((type) => (
                <button key={type} onClick={() => { updateFilter('type', type); setView('listing'); }} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t(`filter.${type}`, lang)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact', lang)}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Dakar, Sénégal</p>
              <p>contact@sadekhbtp.sn</p>
              <p>+221 77 123 45 67</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteSettings?.siteName || 'SADEKH BTP'}. {t('footer.rights', lang)}</p>
          <div className="flex gap-4">
            <button className="hover:text-foreground transition-colors">{t('footer.legal', lang)}</button>
            <button className="hover:text-foreground transition-colors">{t('footer.privacy', lang)}</button>
            <button className="hover:text-foreground transition-colors">{t('footer.terms', lang)}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

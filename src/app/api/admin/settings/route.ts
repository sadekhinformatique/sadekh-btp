import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

const KEY_MAP: Record<string, string> = {
  siteName: 'site_name',
  siteSlogan: 'site_tagline',
  logoUrl: 'logo_url',
  faviconUrl: 'favicon_url',
  primaryColor: 'primary_color',
  accentColor: 'accent_color',
  contactEmail: 'contact_email',
  contactPhone: 'contact_phone',
  contactWhatsapp: 'contact_whatsapp',
  contactAddress: 'contact_address',
  facebook: 'facebook_url',
  instagram: 'instagram_url',
  twitter: 'twitter_url',
  youtube: 'youtube_url',
  tiktok: 'tiktok_url',
  seoTitle: 'seo_title',
  seoDescription: 'seo_description',
  seoKeywords: 'seo_keywords',
  heroTitleFr: 'hero_title_fr',
  heroSubtitleFr: 'hero_subtitle_fr',
  heroTitleWo: 'hero_title_wo',
  heroSubtitleWo: 'hero_subtitle_wo',
  footerAboutFr: 'footer_about_fr',
  footerAboutWo: 'footer_about_wo',
  boostPrice: 'boost_price',
  premiumPrice: 'premium_price',
  currency: 'currency',
  currencySymbol: 'currency_symbol',
};

const NUMERIC_COLUMNS = new Set(['boost_price', 'premium_price']);

export async function GET() {
  try {
    // Crée la ligne par défaut si elle n'existe pas
    await pool.query(
      `INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`
    );
    const result = await pool.query(`SELECT * FROM site_settings WHERE id = 1`);
    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [camelKey, dbCol] of Object.entries(KEY_MAP)) {
      if (body[camelKey] !== undefined) {
        const val = body[camelKey];
        setClauses.push(`${dbCol} = $${idx++}`);
        values.push(NUMERIC_COLUMNS.has(dbCol) ? (parseFloat(val) || 0) : String(val));
      }
    }

    if (setClauses.length === 0) return NextResponse.json({ error: 'Aucun champ' }, { status: 400 });

    // UPSERT : crée la ligne si elle n'existe pas (id=1)
    await pool.query(
      `INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`
    );

    const result = await pool.query(
      `UPDATE site_settings SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = 1 RETURNING *`,
      values
    );

    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Échec de la sauvegarde' }, { status: 500 });
  }
}
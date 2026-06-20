import { pool } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = 'https://sadekhbtp.sn';
    const properties = await pool.query(
      `SELECT id, title, type, region, updated_at FROM properties WHERE status = 'active' ORDER BY updated_at DESC LIMIT 500`
    );

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
    ];

    const propertyPages = properties.rows.map((p: any) => ({
      url: `/?property=${p.id}`,
      priority: '0.8',
      changefreq: 'weekly',
    }));

    const allPages = [...staticPages, ...propertyPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages
    .map(
      (page) => `<url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    // Fallback sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://sadekhbtp.sn/</loc><priority>1.0</priority></url>
</urlset>`;
    return new NextResponse(sitemap, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
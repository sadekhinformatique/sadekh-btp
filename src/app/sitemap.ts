import { MetadataRoute } from 'next';
import { pool } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sadekhbtp.sn';

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const { rows } = await pool.query(
      `SELECT id, updated_at FROM properties WHERE status = 'active' ORDER BY updated_at DESC LIMIT 500`
    );

    const propertyEntries: MetadataRoute.Sitemap = rows.map(
      (p: { id: string; updated_at: string }) => ({
        url: `${baseUrl}/property/${p.id}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })
    );

    return [...staticEntries, ...propertyEntries];
  } catch {
    return staticEntries;
  }
}
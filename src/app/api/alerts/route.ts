import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// GET: List user's alerts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let profileId = userId;
    if (!profileId) {
      const user = await pool.query(`SELECT id FROM profiles WHERE email = 'acheteur@sadekh.sn'`);
      profileId = user.rows[0]?.id;
    }
    if (!profileId) return NextResponse.json([]);

    const result = await pool.query(
      `SELECT * FROM property_alerts WHERE user_id = $1 ORDER BY created_at DESC`,
      [profileId]
    );
    return NextResponse.json(result.rows.map(toCamelCase));
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST: Create alert or check for new matches
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, type, region, maxPrice, minSurface } = body;

    let profileId = userId;
    if (!profileId) {
      const user = await pool.query(`SELECT id FROM profiles WHERE email = 'acheteur@sadekh.sn'`);
      profileId = user.rows[0]?.id;
    }
    if (!profileId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    if (action === 'create') {
      const result = await pool.query(
        `INSERT INTO property_alerts (user_id, type, region, max_price, min_surface) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [profileId, type || 'all', region || null, maxPrice ? parseFloat(maxPrice) : null, minSurface ? parseInt(minSurface) : null]
      );
      return NextResponse.json(toCamelCase(result.rows[0]), { status: 201 });
    }

    if (action === 'delete') {
      await pool.query(`DELETE FROM property_alerts WHERE id = $1 AND user_id = $2`, [body.alertId, profileId]);
      return NextResponse.json({ success: true });
    }

    if (action === 'check') {
      // Find matching properties for all user's alerts
      const alerts = await pool.query(`SELECT * FROM property_alerts WHERE user_id = $1 AND active = true`, [profileId]);
      const matches: any[] = [];

      for (const alert of alerts.rows) {
        const conditions: string[] = ["p.status = 'active'"];
        const params: any[] = [];
        let idx = 1;

        if (alert.type && alert.type !== 'all') {
          conditions.push(`p.type = $${idx++}`);
          params.push(alert.type);
        }
        if (alert.region) {
          conditions.push(`p.region = $${idx++}`);
          params.push(alert.region);
        }
        if (alert.max_price) {
          conditions.push(`p.price <= $${idx++}`);
          params.push(parseFloat(alert.max_price));
        }
        if (alert.min_surface) {
          conditions.push(`p.surface_m2 >= $${idx++}`);
          params.push(parseInt(alert.min_surface));
        }

        conditions.push(`p.created_at > NOW() - INTERVAL '7 days'`);

        const matchResult = await pool.query(
          `SELECT p.id, p.title, p.type, p.price, p.region, p.quartier, p.images
           FROM properties p WHERE ${conditions.join(' AND ')} ORDER BY p.created_at DESC LIMIT 10`,
          params
        );

        if (matchResult.rows.length > 0) {
          matches.push({ alert, properties: matchResult.rows.map(toCamelCase) });
        }
      }

      return NextResponse.json({ matches, totalNew: matches.reduce((sum: number, m: any) => sum + m.properties.length, 0) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Alerts error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
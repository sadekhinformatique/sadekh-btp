import { pool, rowsToCamelCase, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Find buyer profile
    let profileId = userId;
    if (!userId) {
      const buyer = await pool.query(`SELECT id FROM profiles WHERE email = 'acheteur@sadekh.sn'`);
      profileId = buyer.rows[0]?.id;
    }

    if (!profileId) {
      return NextResponse.json([]);
    }

    const result = await pool.query(
      `SELECT f.*, json_build_object(
        'id', p.id, 'userId', p.user_id, 'type', p.type, 'title', p.title, 'description', p.description,
        'price', p.price, 'priceNegotiable', p.price_negotiable, 'surfaceM2', p.surface_m2, 'rooms', p.rooms,
        'region', p.region, 'city', p.city, 'quartier', p.quartier, 'lat', p.lat, 'lng', p.lng,
        'images', p.images, 'titleFoncier', p.title_foncier, 'status', p.status, 'isPremium', p.is_premium,
        'viewsCount', p.views_count, 'planPdfUrl', p.plan_pdf_url, 'planPrice', p.plan_price, 'planDownloads', p.plan_downloads,
        'createdAt', p.created_at, 'updatedAt', p.updated_at,
        'user', json_build_object('id', pr.id, 'name', pr.email, 'email', pr.email, 'profile', json_build_object(
          'fullName', pr.full_name, 'phone', pr.phone, 'whatsapp', pr.whatsapp, 'agencyName', pr.agency_name, 'verified', pr.verified, 'avatar', pr.avatar
        ))
       ) as property
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       LEFT JOIN profiles pr ON p.user_id = pr.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [profileId]
    );

    return NextResponse.json(result.rows.map((row: any) => toCamelCase(row)));
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { propertyId, userId } = await request.json();

    // Find user profile
    let profileId = userId;
    if (!profileId) {
      const buyer = await pool.query(`SELECT id FROM profiles WHERE email = 'acheteur@sadekh.sn'`);
      profileId = buyer.rows[0]?.id;
    }
    if (!profileId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Check existing
    const existing = await pool.query(
      `SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2`,
      [profileId, propertyId]
    );

    if (existing.rows[0]) {
      await pool.query(`DELETE FROM favorites WHERE id = $1`, [existing.rows[0].id]);
      return NextResponse.json({ favorited: false });
    } else {
      await pool.query(
        `INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)`,
        [profileId, propertyId]
      );
      return NextResponse.json({ favorited: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
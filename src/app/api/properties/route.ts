import { pool, rowsToCamelCase, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const region = searchParams.get('region') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minSurface = searchParams.get('minSurface');
    const rooms = searchParams.get('rooms');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    const conditions: string[] = ["p.status = 'active'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (type && type !== 'all') {
      conditions.push(`p.type = $${paramIndex++}`);
      params.push(type);
    }
    if (region && region !== 'all') {
      conditions.push(`p.region = $${paramIndex++}`);
      params.push(region);
    }
    if (minPrice) {
      conditions.push(`p.price >= $${paramIndex++}`);
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      conditions.push(`p.price <= $${paramIndex++}`);
      params.push(parseFloat(maxPrice));
    }
    if (minSurface) {
      conditions.push(`p.surface_m2 >= $${paramIndex++}`);
      params.push(parseInt(minSurface));
    }
    if (rooms) {
      conditions.push(`p.rooms >= $${paramIndex++}`);
      params.push(parseInt(rooms));
    }
    if (search) {
      conditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.quartier ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    let orderBy = 'p.created_at DESC';
    if (sort === 'priceAsc') orderBy = 'p.price ASC';
    else if (sort === 'priceDesc') orderBy = 'p.price DESC';
    else if (sort === 'views') orderBy = 'p.views_count DESC';

    const [properties, countResult] = await Promise.all([
      pool.query(
        `SELECT p.*, pr.id as "profileId", pr.full_name as "profileFullName", pr.phone as "profilePhone",
                pr.whatsapp as "profileWhatsapp", pr.agency_name as "profileAgencyName", pr.verified as "profileVerified",
                pr.avatar as "profileAvatar", pr.email as "userEmail", pr.email as "userName",
                json_build_object(
                  'id', pr.id,
                  'fullName', pr.full_name,
                  'phone', pr.phone,
                  'whatsapp', pr.whatsapp,
                  'agencyName', pr.agency_name,
                  'verified', pr.verified,
                  'avatar', pr.avatar
                ) as user
         FROM properties p
         LEFT JOIN profiles pr ON p.user_id = pr.id
         WHERE ${whereClause}
         ORDER BY ${orderBy}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM properties p WHERE ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(countResult.rows[0]?.total || '0');
    const mapped = properties.rows.map((row: any) => ({
      ...toCamelCase(row),
      images: row.images || [],
      price: parseFloat(row.price),
      user: row.user || { profile: null },
    }));

    return NextResponse.json({
      properties: mapped,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Properties GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, title, description, price, priceNegotiable, surfaceM2, rooms, region, city, quartier, lat, lng, images, titleFoncier } = body;

    const result = await pool.query(
      `INSERT INTO properties (user_id, type, title, description, price, price_negotiable, surface_m2, rooms, region, city, quartier, lat, lng, images, title_foncier, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, 'active')
       RETURNING *`,
      [userId || '00000000-0000-0000-0000-000000000000', type || 'maison', title, description, parseFloat(price), !!priceNegotiable,
       surfaceM2 ? parseInt(surfaceM2) : null, rooms ? parseInt(rooms) : null, region || 'Dakar', city || '', quartier || '',
       lat ? parseFloat(lat) : null, lng ? parseFloat(lng) : null, JSON.stringify(images || []), !!titleFoncier]
    );

    const property = toCamelCase(result.rows[0]);
    return NextResponse.json({ ...property, images: property.images || [] }, { status: 201 });
  } catch (error) {
    console.error('Properties POST error:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
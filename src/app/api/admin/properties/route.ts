import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT p.*,
        json_build_object(
          'id', pr.id, 'name', pr.email, 'email', pr.email,
          'profile', json_build_object(
            'fullName', pr.full_name, 'phone', pr.phone,
            'whatsapp', pr.whatsapp, 'agencyName', pr.agency_name,
            'verified', pr.verified, 'avatar', pr.avatar
          )
        ) as user
       FROM properties p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       ORDER BY p.created_at DESC
       LIMIT 200`
    );

    const properties = result.rows.map((row: any) => ({
      ...toCamelCase(row),
      images: row.images || [],
      price: parseFloat(row.price),
      user: row.user || { profile: null },
    }));

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Admin Properties GET error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, description, price, surface, rooms, region, city, quartier, status, images } = body;

    // Résoudre user_id depuis un profil admin
    const admin = await pool.query(`SELECT id FROM profiles WHERE role = 'admin' LIMIT 1`);
    const userId = admin.rows[0]?.id || '00000000-0000-0000-0000-000000000000';

    const result = await pool.query(
      `INSERT INTO properties (user_id, type, title, description, price, price_negotiable, surface_m2, rooms, region, city, quartier, images, title_foncier, status, is_premium)
       VALUES ($11, $1, $2, $3, $4, false, $5, $6, $7, $8, $9, $12::jsonb, false, $10, false)
       RETURNING *`,
      [type || 'maison', title, description || '', parseFloat(price) || 0,
       surface ? parseInt(surface) : null, rooms ? parseInt(rooms) : null,
       region || 'Dakar', city || '', quartier || '', status || 'active',
       userId, JSON.stringify(images || [])]
    );

    const property = toCamelCase(result.rows[0]);
    return NextResponse.json({ ...property, images: property.images || [], price: parseFloat(result.rows[0].price) }, { status: 201 });
  } catch (error) {
    console.error('Admin Properties POST error:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (fields.title !== undefined) { setClauses.push(`title = $${paramIdx++}`); values.push(fields.title); }
    if (fields.type !== undefined) { setClauses.push(`type = $${paramIdx++}`); values.push(fields.type); }
    if (fields.description !== undefined) { setClauses.push(`description = $${paramIdx++}`); values.push(fields.description); }
    if (fields.price !== undefined) { setClauses.push(`price = $${paramIdx++}`); values.push(parseFloat(fields.price)); }
    if (fields.surface !== undefined) { setClauses.push(`surface_m2 = $${paramIdx++}`); values.push(fields.surface ? parseInt(fields.surface) : null); }
    if (fields.rooms !== undefined) { setClauses.push(`rooms = $${paramIdx++}`); values.push(fields.rooms ? parseInt(fields.rooms) : null); }
    if (fields.region !== undefined) { setClauses.push(`region = $${paramIdx++}`); values.push(fields.region); }
    if (fields.city !== undefined) { setClauses.push(`city = $${paramIdx++}`); values.push(fields.city); }
    if (fields.quartier !== undefined) { setClauses.push(`quartier = $${paramIdx++}`); values.push(fields.quartier); }
    if (fields.status !== undefined) { setClauses.push(`status = $${paramIdx++}`); values.push(fields.status); }
    if (fields.isPremium !== undefined) { setClauses.push(`is_premium = $${paramIdx++}`); values.push(fields.isPremium); }
    if (fields.images !== undefined) { setClauses.push(`images = $${paramIdx++}::jsonb`); values.push(JSON.stringify(fields.images)); }

    if (setClauses.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    values.push(id);
    const result = await pool.query(
      `UPDATE properties SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Admin Properties PUT error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await pool.query(`DELETE FROM properties WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Properties DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
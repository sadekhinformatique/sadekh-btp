import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT p.*, json_build_object(
        'id', pr.id,
        'fullName', pr.full_name,
        'phone', pr.phone,
        'whatsapp', pr.whatsapp,
        'agencyName', pr.agency_name,
        'verified', pr.verified,
        'avatar', pr.avatar,
        'email', pr.email,
        'name', pr.email
       ) as user
       FROM properties p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       WHERE p.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Increment views
    await pool.query(`UPDATE properties SET views_count = views_count + 1 WHERE id = $1`, [id]);

    const property = toCamelCase(result.rows[0]);
    return NextResponse.json({ ...property, images: property.images || [] });
  } catch (error) {
    console.error('Property GET error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
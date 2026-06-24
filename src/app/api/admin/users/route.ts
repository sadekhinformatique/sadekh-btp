import { pool, toCamelCase } from '@/lib/supabase-server';
import { checkAdmin } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const result = await pool.query(
      `SELECT id, email, full_name as "fullName", phone, whatsapp, agency_name as "agencyName",
              role, verified, avatar, created_at as "createdAt"
       FROM profiles
       ORDER BY created_at DESC
       LIMIT 200`
    );

    const users = result.rows.map((row: any) => toCamelCase(row));
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin Users GET error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (fields.role !== undefined) { setClauses.push(`role = $${paramIdx++}`); values.push(fields.role); }
    if (fields.verified !== undefined) { setClauses.push(`verified = $${paramIdx++}`); values.push(fields.verified); }
    if (fields.fullName !== undefined) { setClauses.push(`full_name = $${paramIdx++}`); values.push(fields.fullName); }
    if (fields.phone !== undefined) { setClauses.push(`phone = $${paramIdx++}`); values.push(fields.phone); }
    if (fields.agencyName !== undefined) { setClauses.push(`agency_name = $${paramIdx++}`); values.push(fields.agencyName); }

    if (setClauses.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    values.push(id);
    const result = await pool.query(
      `UPDATE profiles SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING id, email, full_name, phone, whatsapp, agency_name, role, verified, avatar, created_at`,
      values
    );

    if (result.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Admin Users PUT error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
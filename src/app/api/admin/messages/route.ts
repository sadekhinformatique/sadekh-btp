import { pool, toCamelCase } from '@/lib/supabase-server';
import { checkAdmin } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const result = await pool.query(
      `SELECT m.*,
        json_build_object('id', s.id, 'name', s.email, 'profile', json_build_object('fullName', s.full_name, 'avatar', s.avatar)) as sender,
        json_build_object('id', r.id, 'name', r.email, 'profile', json_build_object('fullName', r.full_name, 'avatar', r.avatar)) as receiver,
        CASE WHEN m.property_id IS NOT NULL THEN json_build_object('id', p.id, 'title', p.title, 'images', p.images) ELSE NULL END as property
       FROM messages m
       LEFT JOIN profiles s ON m.sender_id = s.id
       LEFT JOIN profiles r ON m.receiver_id = r.id
       LEFT JOIN properties p ON m.property_id = p.id
       ORDER BY m.created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ messages: result.rows.map((row: any) => toCamelCase(row)) });
  } catch (error) {
    console.error('Admin Messages GET error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const { id, read } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const result = await pool.query(
      `UPDATE messages SET read_at = $1 WHERE id = $2 RETURNING *`,
      [read ? new Date().toISOString() : null, id]
    );

    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Admin Messages PUT error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await pool.query(`DELETE FROM messages WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Messages DELETE error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
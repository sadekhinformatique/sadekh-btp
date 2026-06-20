import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
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
       LIMIT 50`
    );

    return NextResponse.json(result.rows.map((row: any) => toCamelCase(row)));
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { senderId, receiverId, propertyId, content } = await request.json();

    // Resolve sender from email if needed
    let actualSenderId = senderId;
    if (!actualSenderId) {
      const sender = await pool.query(`SELECT id FROM profiles WHERE email = 'acheteur@sadekh.sn'`);
      actualSenderId = sender.rows[0]?.id;
    }
    if (!actualSenderId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, property_id, content) VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [actualSenderId, receiverId, propertyId || null, content]
    );

    const message = toCamelCase(result.rows[0]);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
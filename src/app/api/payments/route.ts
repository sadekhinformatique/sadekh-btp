import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, amount, method, propertyId } = body;

    // Find user profile
    let profileId = userId;
    if (!profileId) {
      const buyer = await pool.query(`SELECT id FROM profiles WHERE email = 'amadou@sadekh.sn'`);
      profileId = buyer.rows[0]?.id;
    }
    if (!profileId) profileId = '00000000-0000-0000-0000-000000000000';

    const result = await pool.query(
      `INSERT INTO payments (user_id, type, amount, method, status, ref_wave, property_id)
       VALUES ($1, $2, $3, $4, 'completed', $5, $6) RETURNING *`,
      [profileId, type || 'boost', parseFloat(amount) || 5000, method || 'wave',
       `${method || 'wave'}-${Date.now()}`, propertyId || null]
    );

    // If premium, update property
    if (propertyId && (type === 'premium' || type === 'boost')) {
      await pool.query(`UPDATE properties SET is_premium = true WHERE id = $1`, [propertyId]);
    }

    const payment = toCamelCase(result.rows[0]);
    return NextResponse.json({ success: true, payment: { ...payment, amount: parseFloat(payment.amount) }, message: 'Paiement traité avec succès' }, { status: 201 });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let profileId = userId;
    if (!profileId) {
      const user = await pool.query(`SELECT id FROM profiles WHERE email = 'amadou@sadekh.sn'`);
      profileId = user.rows[0]?.id;
    }
    if (!profileId) return NextResponse.json([]);

    const result = await pool.query(
      `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
      [profileId]
    );

    return NextResponse.json(result.rows.map((r: any) => ({ ...toCamelCase(r), amount: parseFloat(r.amount) })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

const VALID_TYPES = ['boost', 'plan', 'premium'];
const VALID_METHODS = ['wave', 'orange_money'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, amount, method, propertyId, phone } = body;

    // Validate inputs
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Type de paiement invalide' }, { status: 400 });
    }
    if (!VALID_METHODS.includes(method)) {
      return NextResponse.json({ error: 'Méthode de paiement invalide' }, { status: 400 });
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Resolve user profile
    let profileId = userId;
    if (!profileId) {
      const buyer = await pool.query(`SELECT id FROM profiles WHERE email = 'amadou@sadekh.sn'`);
      profileId = buyer.rows[0]?.id;
    }
    if (!profileId) profileId = '00000000-0000-0000-0000-000000000000';

    const reference = `${method === 'wave' ? 'WAVE' : 'OM'}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO payments (user_id, type, amount, method, status, ref_wave, property_id)
       VALUES ($1, $2, $3, $4, 'completed', $5, $6) RETURNING *`,
      [profileId, type, numAmount, method, reference, propertyId || null]
    );

    // If premium or boost, update property
    if (propertyId && (type === 'premium' || type === 'boost')) {
      await pool.query(`UPDATE properties SET is_premium = true WHERE id = $1`, [propertyId]);
    }

    const payment = toCamelCase(result.rows[0]);
    return NextResponse.json({
      success: true,
      payment: { ...payment, amount: parseFloat(payment.amount) },
      message: 'Paiement traité avec succès',
    }, { status: 201 });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Échec du paiement' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let profileId = userId;
    if (!profileId) {
      const user = await pool.query(`SELECT id FROM profiles WHERE email = 'amadou@sadekh.sn'`);
      profileId = user.rows[0]?.id;
    }
    if (!profileId) return NextResponse.json([]);

    let queryStr = `SELECT * FROM payments WHERE user_id = $1`;
    const params: any[] = [profileId];

    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      queryStr += ` AND status = $2`;
      params.push(status);
    }

    queryStr += ` ORDER BY created_at DESC`;

    const result = await pool.query(queryStr, params);
    return NextResponse.json(result.rows.map((r: any) => ({ ...toCamelCase(r), amount: parseFloat(r.amount) })));
  } catch (error) {
    return NextResponse.json({ error: 'Échec' }, { status: 500 });
  }
}
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, amount, method, propertyId } = body;

    // Create payment record
    const payment = await db.payment.create({
      data: {
        userId: userId || 'demo-user',
        type: type || 'boost', // boost, plan, premium
        amount: parseFloat(amount) || 5000,
        method: method || 'wave', // wave, orange_money
        status: 'completed',
        refWave: `${method || 'wave'}-${Date.now()}`,
      },
    });

    // If boost/premium, update property
    if (propertyId && (type === 'boost' || type === 'premium')) {
      await db.property.update({
        where: { id: propertyId },
        data: {
          isPremium: type === 'premium' || true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      payment: { ...payment, amount: parseFloat(payment.amount as any) },
      message: 'Paiement traité avec succès',
    }, { status: 201 });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    const user = await db.user.findFirst({ where: { email: 'amadou@sadekh.sn' } });
    const actualUserId = user?.id || userId;

    const payments = await db.payment.findMany({
      where: { userId: actualUserId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments.map((p: any) => ({ ...p, amount: parseFloat(p.amount) })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
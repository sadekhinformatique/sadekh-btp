import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-buyer';

    const user = await db.user.findFirst({ where: { email: 'acheteur@sadekh.sn' } });
    const actualUserId = user?.id || userId;

    const favorites = await db.favorite.findMany({
      where: { userId: actualUserId },
      include: {
        property: {
          include: { user: { include: { profile: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      favorites.map((f) => ({
        ...f,
        property: { ...f.property, images: JSON.parse(f.property.images || '[]') },
      }))
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { propertyId } = await request.json();
    const user = await db.user.findFirst({ where: { email: 'acheteur@sadekh.sn' } });
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const existing = await db.favorite.findFirst({
      where: { userId: user.id, propertyId },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    } else {
      await db.favorite.create({ data: { userId: user.id, propertyId } });
      return NextResponse.json({ favorited: true }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
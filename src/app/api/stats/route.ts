import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalProperties, activeProperties, totalUsers, totalViews, premiumProperties, propertiesByType, recentProperties] = await Promise.all([
      db.property.count(),
      db.property.count({ where: { status: 'active' } }),
      db.user.count(),
      db.property.aggregate({ _sum: { viewsCount: true } }),
      db.property.count({ where: { isPremium: true } }),
      db.property.groupBy({ by: ['type'], _count: { id: true } }),
      db.property.findMany({
        where: { status: 'active' },
        orderBy: { viewsCount: 'desc' },
        take: 5,
        select: { id: true, title: true, type: true, price: true, viewsCount: true },
      }),
    ]);

    const totalMessages = await db.message.count();
    const totalFavorites = await db.favorite.count();

    return NextResponse.json({
      totalProperties,
      activeProperties,
      totalUsers,
      totalViews: totalViews._sum.viewsCount || 0,
      premiumProperties,
      totalMessages,
      totalFavorites,
      propertiesByType,
      recentProperties,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
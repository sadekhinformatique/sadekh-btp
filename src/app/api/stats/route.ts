import { pool } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalProps, activeProps, totalUsers, totalViews, premiumProps, byType, topProps, totalMsgs, totalFavs] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total FROM properties`),
      pool.query(`SELECT COUNT(*) as total FROM properties WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) as total FROM profiles`),
      pool.query(`SELECT COALESCE(SUM(views_count), 0) as total FROM properties`),
      pool.query(`SELECT COUNT(*) as total FROM properties WHERE is_premium = true`),
      pool.query(`SELECT type, COUNT(*) as count FROM properties GROUP BY type`),
      pool.query(`SELECT id, title, type, price, views_count FROM properties WHERE status = 'active' ORDER BY views_count DESC LIMIT 5`),
      pool.query(`SELECT COUNT(*) as total FROM messages`),
      pool.query(`SELECT COUNT(*) as total FROM favorites`),
    ]);

    return NextResponse.json({
      totalProperties: parseInt(totalProps.rows[0].total),
      activeProperties: parseInt(activeProps.rows[0].total),
      totalUsers: parseInt(totalUsers.rows[0].total),
      totalViews: parseInt(totalViews.rows[0].total),
      premiumProperties: parseInt(premiumProps.rows[0].total),
      totalMessages: parseInt(totalMsgs.rows[0].total),
      totalFavorites: parseInt(totalFavs.rows[0].total),
      propertiesByType: byType.rows.map((r: any) => ({ type: r.type, _count: { id: parseInt(r.count) } })),
      recentProperties: topProps.rows.map((r: any) => ({
        id: r.id, title: r.title, type: r.type,
        price: parseFloat(r.price), viewsCount: parseInt(r.views_count),
      })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
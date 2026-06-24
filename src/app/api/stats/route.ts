import { pool } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalProps, activeProps, totalUsers, totalViews, premiumProps, byType, topProps, totalMsgs, totalFavs, pendingProps, totalRevenue] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total FROM properties`),
      pool.query(`SELECT COUNT(*) as total FROM properties WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) as total FROM profiles`),
      pool.query(`SELECT COALESCE(SUM(views_count), 0) as total FROM properties`),
      pool.query(`SELECT COUNT(*) as total FROM properties WHERE is_premium = true`),
      pool.query(`SELECT type, COUNT(*) as count FROM properties GROUP BY type`),
      pool.query(`SELECT id, title, type, price, views_count FROM properties WHERE status = 'active' ORDER BY views_count DESC LIMIT 5`),
      pool.query(`SELECT COUNT(*) as total FROM messages`),
      pool.query(`SELECT COUNT(*) as total FROM favorites`),
      pool.query(`SELECT COUNT(*) as total FROM properties WHERE status = 'pending'`),
      pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`),
    ]);

    const byTypeMap: Record<string, number> = {};
    for (const row of byType.rows) {
      byTypeMap[row.type] = parseInt(row.count);
    }

    return NextResponse.json({
      totalProperties: parseInt(totalProps.rows[0].total),
      activeProperties: parseInt(activeProps.rows[0].total),
      totalUsers: parseInt(totalUsers.rows[0].total),
      totalViews: parseInt(totalViews.rows[0].total),
      premiumProperties: parseInt(premiumProps.rows[0].total),
      totalMessages: parseInt(totalMsgs.rows[0].total),
      totalFavorites: parseInt(totalFavs.rows[0].total),
      pendingProperties: parseInt(pendingProps.rows[0].total),
      estimatedRevenue: parseFloat(totalRevenue.rows[0].total),
      /* compat DashboardTab (utilise ces noms de champs) */
      byType: byTypeMap,
      topAnnonces: topProps.rows.map((r: any) => ({
        id: r.id, title: r.title, type: r.type,
        price: parseFloat(r.price), views: parseInt(r.views_count),
      })),
      /* legacy noms */
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
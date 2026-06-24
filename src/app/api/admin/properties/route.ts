import { pool, toCamelCase } from '@/lib/supabase-server';
import { checkAdmin } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const userId = await checkAdmin(request);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  try {
    const result = await pool.query(
      `SELECT p.*,
        json_build_object(
          'id', pr.id, 'name', pr.email, 'email', pr.email,
          'profile', json_build_object(
            'fullName', pr.full_name, 'phone', pr.phone,
            'whatsapp', pr.whatsapp, 'agencyName', pr.agency_name,
            'verified', pr.verified, 'avatar', pr.avatar
          )
        ) as user
       FROM properties p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       ORDER BY p.created_at DESC
       LIMIT 200`
    );

    const properties = result.rows.map((row: any) => ({
      ...toCamelCase(row),
      images: row.images || [],
      price: parseFloat(row.price),
      user: row.user || { profile: null },
    }));

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Admin Properties GET error:', error);
    return NextResponse.json({ error: 'Erreur de chargement' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await checkAdmin(request);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  try {
    const body = await request.json();
    const { type, title, description, price, surface, rooms, region, city, quartier, status, images } = body;

    const result = await pool.query(
      `INSERT INTO properties (user_id, type, title, description, price, price_negotiable, surface_m2, rooms, region, city, quartier, images, title_foncier, status, is_premium)
       VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8, $9, $10, $11::jsonb, false, $12, false)
       RETURNING *`,
      [userId, type || 'maison', title, description || '', parseFloat(price) || 0,
       surface ? parseInt(surface) : null, rooms ? parseInt(rooms) : null,
       region || 'Dakar', city || '', quartier || '', JSON.stringify(images || []), status || 'active']
    );

    const property = toCamelCase(result.rows[0]);
    return NextResponse.json({ ...property, images: property.images || [], price: parseFloat(result.rows[0].price) }, { status: 201 });
  } catch (error) {
    console.error('Admin Properties POST error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await checkAdmin(request);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  try {
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'ID du bien manquant' }, { status: 400 });

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (fields.title !== undefined) { setClauses.push(`title = $${paramIdx++}`); values.push(fields.title); }
    if (fields.type !== undefined) { setClauses.push(`type = $${paramIdx++}`); values.push(fields.type); }
    if (fields.description !== undefined) { setClauses.push(`description = $${paramIdx++}`); values.push(fields.description); }
    if (fields.price !== undefined) { setClauses.push(`price = $${paramIdx++}`); values.push(parseFloat(fields.price)); }
    if (fields.surface !== undefined) { setClauses.push(`surface_m2 = $${paramIdx++}`); values.push(fields.surface ? parseInt(fields.surface) : null); }
    if (fields.rooms !== undefined) { setClauses.push(`rooms = $${paramIdx++}`); values.push(fields.rooms ? parseInt(fields.rooms) : null); }
    if (fields.region !== undefined) { setClauses.push(`region = $${paramIdx++}`); values.push(fields.region); }
    if (fields.city !== undefined) { setClauses.push(`city = $${paramIdx++}`); values.push(fields.city); }
    if (fields.quartier !== undefined) { setClauses.push(`quartier = $${paramIdx++}`); values.push(fields.quartier); }
    if (fields.status !== undefined) { setClauses.push(`status = $${paramIdx++}`); values.push(fields.status); }
    if (fields.isPremium !== undefined) { setClauses.push(`is_premium = $${paramIdx++}`); values.push(fields.isPremium); }
    if (fields.images !== undefined) { setClauses.push(`images = $${paramIdx++}::jsonb`); values.push(JSON.stringify(fields.images)); }

    if (setClauses.length === 0) return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });

    values.push(id);
    const result = await pool.query(
      `UPDATE properties SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return NextResponse.json({ error: 'Bien non trouvé' }, { status: 404 });
    return NextResponse.json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Admin Properties PUT error:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await checkAdmin(request);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID du bien manquant' }, { status: 400 });

    // La contrainte ON DELETE CASCADE supprime automatiquement les favoris et signalements
    // La contrainte ON DELETE SET NULL met automatiquement property_id = NULL sur les messages et paiements
    const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Bien non trouvé ou déjà supprimé' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Properties DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: `Échec de la suppression : ${message}` }, { status: 500 });
  }
}

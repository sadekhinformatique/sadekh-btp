import { supabase } from '@/lib/supabase';
import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { action, email, password, fullName } = await request.json();

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return NextResponse.json({ error: error.message }, { status: 401 });

      // Get or create profile
      let profile = await pool.query(`SELECT * FROM profiles WHERE email = $1`, [email]);
      if (!profile.rows[0]) {
        await pool.query(
          `INSERT INTO profiles (email, full_name) VALUES ($1, $2)`,
          [email, fullName || email.split('@')[0]]
        );
        profile = await pool.query(`SELECT * FROM profiles WHERE email = $1`, [email]);
      }

      return NextResponse.json({
        user: { ...data.user, profile: toCamelCase(profile.rows[0]) },
        session: data.session,
      });
    }

    if (action === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      // Create profile
      await pool.query(
        `INSERT INTO profiles (email, full_name, user_id) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING`,
        [email, fullName, data.user?.id]
      );

      return NextResponse.json({ user: data.user, message: 'Vérifiez votre email pour confirmer votre compte' });
    }

    if (action === 'google') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/` },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ url: data.url });
    }

    if (action === 'logout') {
      await supabase.auth.signOut();
      return NextResponse.json({ success: true });
    }

    if (action === 'session') {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return NextResponse.json({ user: null });

      const profile = await pool.query(`SELECT * FROM profiles WHERE email = $1`, [session.user.email]);
      return NextResponse.json({
        user: { ...session.user, profile: toCamelCase(profile.rows[0] || null) },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: error.message || 'Auth failed' }, { status: 500 });
  }
}
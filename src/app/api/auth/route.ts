import { supabase } from '@/lib/supabase';
import { pool, toCamelCase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

function getAccessTokenFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const tokenCookie = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('sb-') && c.includes('-auth-token'));
  if (!tokenCookie) return null;
  const value = tokenCookie.split('=').slice(1).join('=');
  if (!value) return null;
  try {
    const raw = decodeURIComponent(value);
    const parsed = JSON.parse(raw);
    return parsed.access_token || parsed.accessToken || null;
  } catch {
    try {
      let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const parsed = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
      return parsed.access_token || parsed.accessToken || null;
    } catch {
      return null;
    }
  }
}

function setAuthCookie(response: NextResponse, session: any): void {
  const value = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: session.user,
  });
  response.headers.set(
    'Set-Cookie',
    `sb-bqqkuxehwaaxkgqqsrnq-auth-token=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=2592000; HttpOnly`
  );
}

function clearAuthCookie(response: NextResponse): void {
  response.headers.set(
    'Set-Cookie',
    `sb-bqqkuxehwaaxkgqqsrnq-auth-token=; Path=/; SameSite=Lax; Max-Age=0; HttpOnly`
  );
}

async function getUserFromSession(accessToken: string | null) {
  if (!accessToken) return null;
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.email) return null;
  return user;
}

export async function POST(request: Request) {
  try {
    const { action, email, password, fullName } = await request.json();

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return NextResponse.json({ error: error.message }, { status: 401 });

      let profile = await pool.query(`SELECT * FROM profiles WHERE email = $1`, [email]);
      if (!profile.rows[0]) {
        await pool.query(
          `INSERT INTO profiles (email, full_name, role) VALUES ($1, $2, $3)`,
          [email, fullName || email.split('@')[0], 'user']
        );
        profile = await pool.query(`SELECT * FROM profiles WHERE email = $1`, [email]);
      }

      const loadedProfile = toCamelCase(profile.rows[0]);
      if (loadedProfile && !loadedProfile.role) loadedProfile.role = 'user';

      const response = NextResponse.json({
        user: { ...data.user, profile: loadedProfile },
        session: data.session,
      });
      setAuthCookie(response, data.session);
      return response;
    }

    if (action === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      await pool.query(
        `INSERT INTO profiles (email, full_name, user_id, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
        [email, fullName, data.user?.id, 'user']
      );

      return NextResponse.json({ user: data.user, message: 'Vérifiez votre email pour confirmer votre compte' });
    }

    if (action === 'google') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/` },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ url: data.url });
    }

    if (action === 'logout') {
      await supabase.auth.signOut();
      const response = NextResponse.json({ success: true });
      clearAuthCookie(response);
      return response;
    }

    if (action === 'session') {
      const accessToken = getAccessTokenFromCookie(request);
      const user = await getUserFromSession(accessToken);
      if (!user) return NextResponse.json({ user: null });

      const profile = await pool.query(`SELECT * FROM profiles WHERE email = $1`, [user.email]);
      const loadedProfile = toCamelCase(profile.rows[0] || null);
      if (loadedProfile && !loadedProfile.role) loadedProfile.role = 'user';
      return NextResponse.json({
        user: { ...user, profile: loadedProfile },
      });
    }

    if (action === 'check-session') {
      const accessToken = getAccessTokenFromCookie(request);
      const user = await getUserFromSession(accessToken);
      if (!user) return NextResponse.json({ authenticated: false });

      const profile = await pool.query(`SELECT * FROM profiles WHERE email = $1`, [user.email]);
      const loadedProfile = toCamelCase(profile.rows[0] || null);

      return NextResponse.json({
        authenticated: true,
        isAdmin: loadedProfile?.role === 'admin',
        user: { ...user, profile: loadedProfile },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: error.message || 'Auth failed' }, { status: 500 });
  }
}

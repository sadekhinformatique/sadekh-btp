import { supabase } from './supabase';
import { pool, toCamelCase } from './supabase-server';

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

export async function checkAdmin(request: Request): Promise<string | false> {
  try {
    const accessToken = getAccessTokenFromCookie(request);
    if (!accessToken) {
      console.log('checkAdmin: no auth token in cookie');
      return false;
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.email) {
      console.log('checkAdmin: getUser failed', error?.message);
      return false;
    }

    const result = await pool.query(`SELECT role FROM profiles WHERE email = $1`, [user.email]);
    const profile = toCamelCase(result.rows[0] || null);

    if (profile?.role === 'admin') {
      console.log(`checkAdmin: granted for ${user.email}`);
      return user.id;
    }

    console.log(`checkAdmin: denied for ${user.email}, role=${profile?.role || 'none'}`);
    return false;
  } catch (err) {
    console.error('checkAdmin error:', err);
    return false;
  }
}

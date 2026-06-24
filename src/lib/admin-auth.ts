export async function checkAdmin(request: Request): Promise<string | false> {
  try {
    const cookie = request.headers.get('cookie') || '';
    const res = await fetch(new URL('/api/auth', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ action: 'session' }),
    });
    const data = await res.json();
    if (data.user?.profile?.role === 'admin') return data.user.id;
    return false;
  } catch {
    return false;
  }
}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqqkuxehwaaxkgqqsrnq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcWt1eGVod2FheGtncXFzcm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5Mzg4OTYsImV4cCI6MjA5NzUxNDg5Nn0.NilEF_V1R0He6yoFwGO-MTLQ7CeyzhQQKfRENMKPQEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper: Upload image to Supabase Storage
export async function uploadImage(file: File, bucket: string = 'properties'): Promise<string | null> {
  try {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (err) {
    console.error('Upload exception:', err);
    return null;
  }
}

// Helper: Sign in with email/password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Helper: Sign in with Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}` },
  });
  return { data, error };
}

// Helper: Sign up
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  return { data, error };
}

// Helper: Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Helper: Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper: Initiate Wave payment
export async function initiateWavePayment(amount: number, description: string, phone: string) {
  // Wave API requires a merchant account. This simulates the payment flow.
  // In production, integrate with Wave's checkout API.
  return {
    paymentUrl: `https://pay.wave.com/checkout/${btoa(JSON.stringify({ amount, description, phone, timestamp: Date.now() }))}`,
    reference: `WAVE-${Date.now()}`,
    status: 'pending',
  };
}

// Helper: Initiate Orange Money payment
export async function initiateOrangePayment(phone: string, amount: number, description: string) {
  // Orange Money API requires merchant account. Simulates the payment flow.
  return {
    paymentUrl: null,
    reference: `OM-${Date.now()}`,
    status: 'pending',
    message: `Un OTP sera envoyé au ${phone} pour confirmer le paiement de ${amount.toLocaleString('fr-FR')} FCFA`,
  };
}
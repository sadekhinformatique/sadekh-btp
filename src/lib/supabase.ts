import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqqkuxehwaaxkgqqsrnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcWt1eGVod2FheGtncXFzcm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5Mzg4OTYsImV4cCI6MjA5NzUxNDg5Nn0.NilEF_V1R0He6yoFwGO-MTLQ7CeyzhQQKfRENMKPQEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Helper: Initiate Wave payment (placeholder - real integration needs merchant account)
export async function initiateWavePayment(amount: number, description: string) {
  // Wave API requires a merchant account. This is a placeholder for the payment flow.
  // In production, this would call the Wave API to create a payment link.
  return {
    paymentUrl: `https://pay.wave.com/checkout/${btoa(JSON.stringify({ amount, description, timestamp: Date.now() }))}`,
    reference: `WAVE-${Date.now()}`,
    status: 'pending',
  };
}

// Helper: Initiate Orange Money payment (placeholder)
export async function initiateOrangePayment(phone: string, amount: number, description: string) {
  // Orange Money API requires merchant account. Placeholder for payment flow.
  return {
    paymentUrl: null,
    reference: `OM-${Date.now()}`,
    status: 'pending',
    message: `Un OTP sera envoyé au ${phone} pour confirmer le paiement de ${amount.toLocaleString('fr-FR')} FCFA`,
  };
}
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET = 'properties';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier que le bucket existe, le créer si nécessaire
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET);
    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE,
      });
      if (createError) {
        return NextResponse.json({ error: `Impossible de créer le bucket: ${createError.message}` }, { status: 500 });
      }
    }

    const urls: string[] = [];

    for (const file of files) {
      // Validation du type MIME
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({
          error: `Type de fichier non accepté : ${file.type || 'inconnu'}. Formats acceptés : JPG, PNG, WebP.`,
        }, { status: 400 });
      }

      // Validation de la taille
      if (file.size > MAX_SIZE) {
        return NextResponse.json({
          error: `Le fichier ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} Mo) dépasse la limite de 5 Mo`,
        }, { status: 400 });
      }

      if (file.size === 0) {
        return NextResponse.json({ error: `Le fichier ${file.name} est vide` }, { status: 400 });
      }

      // Générer un nom de fichier unique
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;

      // Upload vers Supabase Storage
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return NextResponse.json({ error: `Erreur Supabase: ${error.message}` }, { status: 500 });
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

      urls.push(publicUrl);
    }

    return NextResponse.json({ urls, count: urls.length });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: `Échec de l'upload : ${message}` }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    await mkdir(uploadDir, { recursive: true });

    // Vérifier que le dossier est accessible en écriture
    try {
      await access(uploadDir);
    } catch {
      return NextResponse.json({ error: 'Le dossier d\'upload n\'est pas accessible' }, { status: 500 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({
          error: `Type de fichier non accepté : ${file.type || 'inconnu'}. Formats acceptés : JPG, PNG, WebP.`
        }, { status: 400 });
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `Le fichier ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} Mo) dépasse la limite de 5 Mo` }, { status: 400 });
      }

      if (file.size === 0) {
        return NextResponse.json({ error: `Le fichier ${file.name} est vide` }, { status: 400 });
      }

      // Sanitize extension
      const originalExt = path.extname(file.name).toLowerCase();
      const extMap: Record<string, string> = { '.jpeg': '.jpg', '.jpg': '.jpg', '.png': '.png', '.webp': '.webp' };
      const ext = extMap[originalExt] || '.jpg';
      const filename = `${uuidv4()}${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);
      urls.push(`/uploads/properties/${filename}`);
    }

    return NextResponse.json({ urls, count: urls.length });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: `Échec de l'upload : ${message}` }, { status: 500 });
  }
}

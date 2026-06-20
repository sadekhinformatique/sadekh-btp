import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await db.property.findUnique({
      where: { id },
      include: { user: { include: { profile: true } } },
    });

    if (!property) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.property.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json({ ...property, images: JSON.parse(property.images || '[]') });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
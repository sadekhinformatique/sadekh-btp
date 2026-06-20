import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const messages = await db.message.findMany({
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
        property: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      messages.map((m) => ({
        ...m,
        property: m.property ? { ...m.property, images: JSON.parse(m.property.images || '[]') } : null,
      }))
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { senderId, receiverId, propertyId, content } = await request.json();
    const message = await db.message.create({
      data: {
        senderId: senderId || 'demo-buyer',
        receiverId,
        propertyId: propertyId || null,
        content,
      },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
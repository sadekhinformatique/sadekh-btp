import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const region = searchParams.get('region') || '';
    const city = searchParams.get('city') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minSurface = searchParams.get('minSurface');
    const rooms = searchParams.get('rooms');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: any = { status: 'active' };
    if (type && type !== 'all') where.type = type;
    if (region && region !== 'all') where.region = region;
    if (city) where.city = city;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (minSurface) where.surfaceM2 = { gte: parseInt(minSurface) };
    if (rooms) where.rooms = { gte: parseInt(rooms) };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { quartier: { contains: search } },
      ];
    }

    const orderBy: any = {};
    if (sort === 'priceAsc') orderBy.price = 'asc';
    else if (sort === 'priceDesc') orderBy.price = 'desc';
    else if (sort === 'views') orderBy.viewsCount = 'desc';
    else orderBy.createdAt = 'desc';

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { include: { profile: true } },
        },
      }),
      db.property.count({ where }),
    ]);

    return NextResponse.json({
      properties: properties.map((p) => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        user: {
          ...p.user,
          profile: p.user.profile,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Properties GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, title, description, price, priceNegotiable, surfaceM2, rooms, region, city, quartier, lat, lng, images, titleFoncier } = body;

    const property = await db.property.create({
      data: {
        userId: userId || 'demo-user',
        type: type || 'maison',
        title,
        description,
        price: parseFloat(price),
        priceNegotiable: !!priceNegotiable,
        surfaceM2: surfaceM2 ? parseInt(surfaceM2) : null,
        rooms: rooms ? parseInt(rooms) : null,
        region: region || 'Dakar',
        city: city || '',
        quartier: quartier || '',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        images: JSON.stringify(images || []),
        titleFoncier: !!titleFoncier,
        status: 'active',
      },
      include: { user: { include: { profile: true } } },
    });

    return NextResponse.json({
      ...property,
      images: JSON.parse(property.images || '[]'),
    }, { status: 201 });
  } catch (error) {
    console.error('Properties POST error:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
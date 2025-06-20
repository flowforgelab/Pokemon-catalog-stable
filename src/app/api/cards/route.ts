import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CardsResponse } from '@/lib/types/index';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const types = searchParams.get('types')?.split(',').filter(Boolean) || [];
    const rarities = searchParams.get('rarities')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'name';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { setName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (types.length > 0) {
      where.types = { hasSome: types };
    }

    if (rarities.length > 0) {
      where.rarity = { in: rarities };
    }

    // Build orderBy
    let orderBy: any = { name: 'asc' };
    switch (sortBy) {
      case '-name': orderBy = { name: 'desc' }; break;
      case 'price': orderBy = { marketPrice: 'asc' }; break;
      case '-price': orderBy = { marketPrice: 'desc' }; break;
      case 'hp': orderBy = { hp: 'asc' }; break;
      case '-hp': orderBy = { hp: 'desc' }; break;
      case 'rarity': orderBy = { rarity: 'asc' }; break;
      case 'set': orderBy = { setName: 'asc' }; break;
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          attacks: true,
          abilities: true,
          weaknesses: true,
          resistances: true,
        }
      }),
      prisma.card.count({ where }),
    ]);

    const response: CardsResponse = {
      cards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
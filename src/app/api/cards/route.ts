import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CardsResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const rarity = searchParams.get('rarity') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { set: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.types = { has: type };
    }

    if (rarity) {
      where.rarity = rarity;
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
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
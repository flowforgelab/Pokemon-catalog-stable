import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const publicOnly = searchParams.get('public') === 'true';
    
    const where = publicOnly 
      ? { isPublic: true }
      : userId 
      ? { OR: [{ userId }, { isPublic: true }] }
      : { isPublic: true };

    const decks = await prisma.deck.findMany({
      where,
      include: {
        _count: {
          select: { cards: true }
        },
        analysis: {
          select: {
            overallScore: true,
            strategy: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, format, cards } = body;

    if (!name || !format) {
      return NextResponse.json(
        { error: 'Name and format are required' },
        { status: 400 }
      );
    }

    // Create deck
    const deck = await prisma.deck.create({
      data: {
        userId,
        name,
        description,
        format,
        cards: {
          create: cards?.map((card: any) => ({
            cardId: card.cardId,
            quantity: card.quantity
          })) || []
        }
      },
      include: {
        cards: {
          include: {
            card: true
          }
        }
      }
    });

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { BudgetOptimizer } from '@/lib/ai/budget-optimizer';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetBudget } = body;

    if (!targetBudget || targetBudget <= 0) {
      return NextResponse.json({ error: 'Invalid target budget' }, { status: 400 });
    }

    const deckId = params.id;

    // Get deck with cards
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: {
          include: {
            card: true
          }
        }
      }
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check if user owns the deck
    if (deck.userId !== userId && !deck.isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all cards for finding alternatives (limited to cards with prices)
    const allCards = await prisma.card.findMany({
      where: {
        marketPrice: { not: null },
        marketPrice: { gt: 0 }
      },
      take: 1000 // Limit for performance
    });

    // Run budget optimization
    const optimizer = new BudgetOptimizer(deck.cards);
    const optimization = await optimizer.optimize(targetBudget, allCards);

    return NextResponse.json(optimization);
  } catch (error) {
    console.error('Error optimizing deck:', error);
    return NextResponse.json(
      { error: 'Failed to optimize deck' },
      { status: 500 }
    );
  }
}
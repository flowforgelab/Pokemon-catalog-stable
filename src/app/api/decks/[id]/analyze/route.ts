import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { DeckAnalyzer } from '@/lib/ai/deck-analyzer';
import { DeckRecommender } from '@/lib/ai/recommender';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deckId = params.id;

    // Get deck with cards
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: {
          include: {
            card: {
              include: {
                attacks: true,
                abilities: true,
                weaknesses: true,
                resistances: true
              }
            }
          }
        }
      }
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check if user owns the deck or deck is public
    if (deck.userId !== userId && !deck.isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate deck has 60 cards
    const totalCards = deck.cards.reduce((sum, dc) => sum + dc.quantity, 0);
    if (totalCards !== 60) {
      return NextResponse.json({ 
        error: `Deck must contain exactly 60 cards (current: ${totalCards})` 
      }, { status: 400 });
    }

    // Run AI analysis
    const analyzer = new DeckAnalyzer(deck.cards);
    const analysis = analyzer.analyze();
    
    // Generate recommendations
    const recommender = new DeckRecommender(deck.cards);
    const allCards = await prisma.card.findMany({ take: 500 });
    const recommendations = recommender.generateRecommendations(allCards);
    const strategyGuide = recommender.generateNaturalLanguageGuide(analysis);

    // Save analysis to database
    const savedAnalysis = await prisma.deckAnalysis.upsert({
      where: { deckId },
      create: {
        deckId,
        ...analysis,
        energyCurve: analysis.energyCurve,
        typeDistribution: analysis.typeDistribution,
        trainerRatios: analysis.trainerRatios,
        attackCosts: analysis.attackCosts
      },
      update: {
        ...analysis,
        energyCurve: analysis.energyCurve,
        typeDistribution: analysis.typeDistribution,
        trainerRatios: analysis.trainerRatios,
        attackCosts: analysis.attackCosts
      }
    });

    return NextResponse.json({
      ...savedAnalysis,
      recommendations,
      strategyGuide
    });
  } catch (error) {
    console.error('Error analyzing deck:', error);
    return NextResponse.json(
      { error: 'Failed to analyze deck' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get total cards
    const totalCards = await prisma.card.count();
    
    // Get cards with game data
    const [
      cardsWithAttacks,
      cardsWithAbilities,
      cardsWithWeaknesses,
      cardsWithEvolution
    ] = await Promise.all([
      prisma.card.count({
        where: {
          attacks: {
            some: {}
          }
        }
      }),
      prisma.card.count({
        where: {
          abilities: {
            some: {}
          }
        }
      }),
      prisma.card.count({
        where: {
          weaknesses: {
            some: {}
          }
        }
      }),
      prisma.card.count({
        where: {
          evolvesFrom: {
            not: null
          }
        }
      })
    ]);

    // Calculate progress percentage based on cards with attacks (since most Pokemon have attacks)
    const progressPercentage = totalCards > 0 
      ? (cardsWithAttacks / totalCards) * 100 
      : 0;

    return NextResponse.json({
      totalCards,
      cardsWithAttacks,
      cardsWithAbilities,
      cardsWithWeaknesses,
      cardsWithEvolution,
      progressPercentage
    });
  } catch (error) {
    console.error('Error fetching import status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import status' },
      { status: 500 }
    );
  }
}
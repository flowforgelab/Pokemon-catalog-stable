import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalCards, sets] = await Promise.all([
      prisma.card.count(),
      prisma.card.groupBy({
        by: ['setName'],
        _count: true,
      })
    ]);

    return NextResponse.json({
      totalCards,
      totalSets: sets.length,
      totalUsers: 1250, // Placeholder for now
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
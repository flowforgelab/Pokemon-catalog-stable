import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const order = searchParams.get('order') || 'desc';

    const collections = await prisma.collection.findMany({
      where: { isPublic: true },
      include: {
        _count: {
          select: { cards: true }
        },
        cards: {
          include: {
            card: {
              select: {
                id: true,
                name: true,
                imageSmall: true,
                marketPrice: true
              }
            }
          },
          take: 4,
          orderBy: { createdAt: 'desc' }
        }
      },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: order }
    });

    // Get total count for pagination
    const total = await prisma.collection.count({
      where: { isPublic: true }
    });

    // Calculate values
    const collectionsWithValue = await Promise.all(
      collections.map(async (collection) => {
        const allCards = await prisma.collectionCard.findMany({
          where: { collectionId: collection.id },
          include: {
            card: {
              select: { marketPrice: true }
            }
          }
        });

        const totalValue = allCards.reduce((sum, item) => {
          return sum + (item.card.marketPrice || 0) * item.quantity;
        }, 0);

        // Get username (you might want to add a user table or use Clerk's API)
        return {
          ...collection,
          totalValue,
          username: 'Anonymous' // Placeholder - integrate with Clerk
        };
      })
    );

    return NextResponse.json({
      collections: collectionsWithValue,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching public collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public collections' },
      { status: 500 }
    );
  }
}
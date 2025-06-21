import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = await prisma.collection.findMany({
      where: { userId },
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
          take: 4, // Preview of first 4 cards
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Calculate total value for each collection
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

        return {
          ...collection,
          totalValue
        };
      })
    );

    return NextResponse.json(collectionsWithValue);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
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
    const { name, description, isPublic } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        userId,
        name,
        description,
        isPublic: isPublic || false
      }
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
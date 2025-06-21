import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const collectionId = params.id;

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        cards: {
          include: {
            card: true
          },
          orderBy: [
            { card: { name: 'asc' } }
          ]
        }
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check if user has access
    if (!collection.isPublic && collection.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Calculate collection value
    const totalValue = collection.cards.reduce((sum, item) => {
      return sum + (item.card.marketPrice || 0) * item.quantity;
    }, 0);

    const totalCards = collection.cards.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    return NextResponse.json({
      ...collection,
      totalValue,
      totalCards,
      uniqueCards: collection.cards.length
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collectionId = params.id;
    const body = await request.json();
    const { name, description, isPublic } = body;

    // Check ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId }
    });

    if (!collection || collection.userId !== userId) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic })
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collectionId = params.id;

    // Check ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId }
    });

    if (!collection || collection.userId !== userId) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    // Delete collection (cascade will delete collection cards)
    await prisma.collection.delete({
      where: { id: collectionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
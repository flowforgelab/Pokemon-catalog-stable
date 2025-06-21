import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const deckId = params.id;

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: {
          include: {
            card: true
          }
        },
        analysis: true
      }
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check if user has access
    if (!deck.isPublic && deck.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
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

    const deckId = params.id;
    const body = await request.json();
    const { name, description, format, cards, isPublic } = body;

    // Check ownership
    const deck = await prisma.deck.findUnique({
      where: { id: deckId }
    });

    if (!deck || deck.userId !== userId) {
      return NextResponse.json(
        { error: 'Deck not found or access denied' },
        { status: 404 }
      );
    }

    // Update deck in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Update deck metadata
      const updatedDeck = await tx.deck.update({
        where: { id: deckId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(format !== undefined && { format }),
          ...(isPublic !== undefined && { isPublic })
        }
      });

      // Update cards if provided
      if (cards) {
        // Delete existing cards
        await tx.deckCard.deleteMany({
          where: { deckId }
        });

        // Add new cards
        if (cards.length > 0) {
          await tx.deckCard.createMany({
            data: cards.map((card: any) => ({
              deckId,
              cardId: card.cardId,
              quantity: card.quantity
            }))
          });
        }
      }

      // Return updated deck with cards
      return await tx.deck.findUnique({
        where: { id: deckId },
        include: {
          cards: {
            include: {
              card: true
            }
          }
        }
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json(
      { error: 'Failed to update deck' },
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

    const deckId = params.id;

    // Check ownership
    const deck = await prisma.deck.findUnique({
      where: { id: deckId }
    });

    if (!deck || deck.userId !== userId) {
      return NextResponse.json(
        { error: 'Deck not found or access denied' },
        { status: 404 }
      );
    }

    // Delete deck (cascade will delete deck cards and analysis)
    await prisma.deck.delete({
      where: { id: deckId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    );
  }
}
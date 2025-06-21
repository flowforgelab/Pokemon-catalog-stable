import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
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
    const { cardId, quantity = 1, condition = 'NM', language = 'EN', notes } = body;

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }

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

    // Check if this exact combination already exists
    const existing = await prisma.collectionCard.findUnique({
      where: {
        collectionId_cardId_condition_language: {
          collectionId,
          cardId,
          condition,
          language
        }
      }
    });

    if (existing) {
      // Update quantity
      const updated = await prisma.collectionCard.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          notes
        },
        include: {
          card: true
        }
      });
      
      return NextResponse.json(updated);
    } else {
      // Create new entry
      const created = await prisma.collectionCard.create({
        data: {
          collectionId,
          cardId,
          quantity,
          condition,
          language,
          notes
        },
        include: {
          card: true
        }
      });

      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Error adding card to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add card to collection' },
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
    const { cardId, quantity, condition, language, notes } = body;

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }

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

    // Find the collection card entry
    const collectionCard = await prisma.collectionCard.findFirst({
      where: {
        collectionId,
        cardId,
        condition: condition || 'NM',
        language: language || 'EN'
      }
    });

    if (!collectionCard) {
      return NextResponse.json(
        { error: 'Card not found in collection' },
        { status: 404 }
      );
    }

    // Update the entry
    const updated = await prisma.collectionCard.update({
      where: { id: collectionCard.id },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(notes !== undefined && { notes })
      },
      include: {
        card: true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating collection card:', error);
    return NextResponse.json(
      { error: 'Failed to update collection card' },
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
    const searchParams = request.nextUrl.searchParams;
    const cardId = searchParams.get('cardId');
    const condition = searchParams.get('condition') || 'NM';
    const language = searchParams.get('language') || 'EN';

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }

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

    // Delete the specific card entry
    await prisma.collectionCard.deleteMany({
      where: {
        collectionId,
        cardId,
        condition,
        language
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing card from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove card from collection' },
      { status: 500 }
    );
  }
}
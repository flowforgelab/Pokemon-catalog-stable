import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

// Import the daily batch function
async function importGameDataBatch() {
  // Since we can't directly import the Node.js script, 
  // we'll implement a simplified version for Vercel
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';
  const API_KEY = process.env.POKEMON_TCG_API_KEY;
  const BATCH_SIZE = 1000; // Full daily limit - using separate API keys
  
  if (!API_KEY) {
    throw new Error('POKEMON_TCG_API_KEY not configured');
  }

  try {
    // Get cards needing game data
    const cardsNeedingData = await prisma.card.findMany({
      where: {
        supertype: 'Pokémon',
        attacks: { none: {} }
      },
      take: BATCH_SIZE,
      orderBy: [
        { setName: 'desc' },
        { number: 'asc' }
      ]
    });

    let processed = 0;
    let succeeded = 0;

    for (const card of cardsNeedingData) {
      try {
        // Fetch from Pokemon TCG API
        const response = await fetch(`${POKEMON_TCG_API}/cards/${card.pokemonTcgId}`, {
          headers: {
            'X-Api-Key': API_KEY,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) continue;

        const data = await response.json();
        const apiData = data.data;

        // Update card with game data
        await prisma.$transaction(async (tx) => {
          await tx.card.update({
            where: { id: card.id },
            data: {
              evolvesFrom: apiData.evolvesFrom || null,
              evolvesTo: apiData.evolvesTo || [],
              retreatCost: apiData.convertedRetreatCost || 0,
              regulationMark: apiData.regulationMark || null,
              rules: apiData.rules || [],
              standardLegal: apiData.legalities?.standard === 'Legal',
              expandedLegal: apiData.legalities?.expanded === 'Legal',
            }
          });

          // Add attacks
          if (apiData.attacks?.length > 0) {
            await tx.attack.createMany({
              data: apiData.attacks.map((attack: any) => ({
                cardId: card.id,
                name: attack.name,
                cost: attack.cost || [],
                damage: attack.damage || null,
                text: attack.text || null,
                convertedEnergyCost: attack.convertedEnergyCost || 0,
              }))
            });
          }

          // Add abilities
          if (apiData.abilities?.length > 0) {
            await tx.ability.createMany({
              data: apiData.abilities.map((ability: any) => ({
                cardId: card.id,
                name: ability.name,
                type: ability.type || 'Ability',
                text: ability.text || '',
              }))
            });
          }

          // Add weaknesses
          if (apiData.weaknesses?.length > 0) {
            await tx.weakness.createMany({
              data: apiData.weaknesses.map((weakness: any) => ({
                cardId: card.id,
                type: weakness.type,
                value: weakness.value,
              }))
            });
          }

          // Add resistances
          if (apiData.resistances?.length > 0) {
            await tx.resistance.createMany({
              data: apiData.resistances.map((resistance: any) => ({
                cardId: card.id,
                type: resistance.type,
                value: resistance.value,
              }))
            });
          }
        });

        succeeded++;
      } catch (error) {
        console.error(`Failed to import ${card.pokemonTcgId}:`, error);
      }

      processed++;
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      processed,
      succeeded,
      remaining: await prisma.card.count({
        where: {
          supertype: 'Pokémon',
          attacks: { none: {} }
        }
      })
    };

  } finally {
    await prisma.$disconnect();
  }
}

export const maxDuration = 300; // 5 minutes timeout for Pro plan, 10 seconds for Hobby

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const { userId } = await auth();
    const headersList = headers();
    const cronSecret = headersList.get('x-cron-secret');
    const searchParams = request.nextUrl.searchParams;
    
    // Allow either authenticated admin users or Vercel cron
    const isAdmin = userId === process.env.ADMIN_USER_ID;
    const isCron = process.env.CRON_SECRET ? cronSecret === process.env.CRON_SECRET : false;
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron') || false;
    
    // Temporary: Allow manual trigger for initial setup
    const isManualTrigger = searchParams.get('trigger') === 'manual';
    
    if (!isAdmin && !isCron && !isVercelCron && !isManualTrigger) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run import
    const result = await importGameDataBatch();
    
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const totalPokemon = await prisma.card.count({ 
        where: { supertype: 'Pokémon' } 
      });
      
      const pokemonWithAttacks = await prisma.card.count({
        where: {
          supertype: 'Pokémon',
          attacks: { some: {} }
        }
      });

      return NextResponse.json({
        totalPokemon,
        pokemonWithAttacks,
        percentage: ((pokemonWithAttacks / totalPokemon) * 100).toFixed(1),
        remaining: totalPokemon - pokemonWithAttacks
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
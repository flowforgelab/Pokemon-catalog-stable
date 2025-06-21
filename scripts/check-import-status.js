#\!/usr/bin/env node
// Quick script to check game data import status
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function checkStatus() {
  console.log('🔍 Pokemon TCG Game Data Import Status');
  console.log('=====================================\n');
  
  try {
    // Overall stats
    const totalCards = await prisma.card.count();
    const totalPokemon = await prisma.card.count({ where: { supertype: 'Pokémon' } });
    
    // Cards with game data
    const pokemonWithAttacks = await prisma.card.count({
      where: {
        supertype: 'Pokémon',
        attacks: { some: {} }
      }
    });
    
    const cardsWithAbilities = await prisma.card.count({
      where: {
        abilities: { some: {} }
      }
    });
    
    const cardsWithWeaknesses = await prisma.card.count({
      where: {
        weaknesses: { some: {} }
      }
    });
    
    // Progress file
    const progressFile = path.join(__dirname, 'import-progress-daily.json');
    let progress = null;
    try {
      const data = await fs.readFile(progressFile, 'utf8');
      progress = JSON.parse(data);
    } catch (e) {
      // Progress file might not exist yet
    }
    
    // Display results
    console.log('📊 Database Overview:');
    console.log(`Total cards: ${totalCards.toLocaleString()}`);
    console.log(`Pokemon cards: ${totalPokemon.toLocaleString()}`);
    console.log(`Trainer cards: ${(await prisma.card.count({ where: { supertype: 'Trainer' } })).toLocaleString()}`);
    console.log(`Energy cards: ${(await prisma.card.count({ where: { supertype: 'Energy' } })).toLocaleString()}`);
    
    console.log('\n🎮 Game Data Coverage:');
    console.log(`Pokemon with attacks: ${pokemonWithAttacks.toLocaleString()}/${totalPokemon.toLocaleString()} (${(pokemonWithAttacks/totalPokemon*100).toFixed(1)}%)`);
    console.log(`Cards with abilities: ${cardsWithAbilities.toLocaleString()}`);
    console.log(`Cards with weaknesses: ${cardsWithWeaknesses.toLocaleString()}`);
    
    if (progress) {
      console.log('\n📈 Import Progress:');
      console.log(`Last run: ${new Date(progress.lastRunDate).toLocaleString()}`);
      console.log(`Total processed: ${progress.totalProcessed.toLocaleString()}`);
      console.log(`Total successful: ${progress.totalSuccess.toLocaleString()}`);
      console.log(`Success rate: ${(progress.totalSuccess/progress.totalProcessed*100).toFixed(1)}%`);
      
      const remaining = totalPokemon - pokemonWithAttacks;
      const daysToComplete = Math.ceil(remaining / 950);
      console.log(`\n⏱️  Estimated completion: ${daysToComplete} days (${remaining.toLocaleString()} cards remaining)`);
    }
    
    // Sample recent imports
    const recentPokemon = await prisma.card.findMany({
      where: {
        supertype: 'Pokémon',
        attacks: { some: {} }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        attacks: true,
        _count: {
          select: { abilities: true, weaknesses: true }
        }
      }
    });
    
    if (recentPokemon.length > 0) {
      console.log('\n🎯 Recently Updated Pokemon:');
      recentPokemon.forEach(card => {
        console.log(`- ${card.name} (${card.setName}): ${card.attacks.length} attacks, ${card._count.abilities} abilities`);
      });
    }
    
  } catch (error) {
    console.error('Error checking status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
EOF < /dev/null
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function verifyCardCount() {
  try {
    console.log('🔍 Verifying Pokemon card migration...\n');
    
    // Get total count
    const totalCount = await prisma.card.count();
    console.log(`📊 Total cards in database: ${totalCount.toLocaleString()}`);
    
    // Get counts by supertype
    const supertypes = await prisma.card.groupBy({
      by: ['supertype'],
      _count: true,
      orderBy: { _count: { supertype: 'desc' } }
    });
    
    console.log('\n📋 Cards by supertype:');
    supertypes.forEach(type => {
      console.log(`   - ${type.supertype || 'Unknown'}: ${type._count.toLocaleString()}`);
    });
    
    // Get counts by rarity
    const rarities = await prisma.card.groupBy({
      by: ['rarity'],
      _count: true,
      orderBy: { _count: { rarity: 'desc' } },
      take: 10
    });
    
    console.log('\n💎 Top 10 rarities:');
    rarities.forEach(rarity => {
      console.log(`   - ${rarity.rarity || 'Unknown'}: ${rarity._count.toLocaleString()}`);
    });
    
    // Get sample of recent cards
    const recentCards = await prisma.card.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, rarity: true, setName: true }
    });
    
    console.log('\n🆕 Recently added cards:');
    recentCards.forEach(card => {
      console.log(`   - ${card.name} (${card.rarity}) from ${card.setName}`);
    });
    
    // Migration status
    const expectedTotal = 18555;
    const missingCards = expectedTotal - totalCount;
    
    console.log('\n📈 Migration Status:');
    console.log(`   - Expected total: ${expectedTotal.toLocaleString()}`);
    console.log(`   - Current total: ${totalCount.toLocaleString()}`);
    console.log(`   - Completion: ${((totalCount / expectedTotal) * 100).toFixed(1)}%`);
    
    if (missingCards > 0) {
      console.log(`   - Missing cards: ${missingCards} (likely from failed page 106)`);
    } else if (totalCount === expectedTotal) {
      console.log('   - ✅ Migration 100% complete!');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCardCount();
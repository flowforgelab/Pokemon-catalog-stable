const { PrismaClient } = require('../node_modules/@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Count tables
    const cardCount = await prisma.card.count();
    const collectionCount = await prisma.collection.count();
    const deckCount = await prisma.deck.count();
    
    console.log('\n📊 Database Statistics:');
    console.log(`- Cards: ${cardCount}`);
    console.log(`- Collections: ${collectionCount}`);
    console.log(`- Decks: ${deckCount}`);
    
    // Test query
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Tables in database:');
    tables.forEach(t => console.log(`- ${t.table_name}`));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
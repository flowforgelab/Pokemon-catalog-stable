// Test script for collections API
// Run with: node scripts/test-collections-api.js

const API_URL = 'http://localhost:3000/api';

// You'll need to get this from your browser after logging in
// Open DevTools > Application > Cookies and find __clerk_db_jwt
const AUTH_TOKEN = process.env.CLERK_AUTH_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  'Cookie': `__clerk_db_jwt=${AUTH_TOKEN}`
};

async function testCollectionsAPI() {
  console.log('🧪 Testing Collections API\n');

  if (!AUTH_TOKEN) {
    console.error('❌ Please set CLERK_AUTH_TOKEN environment variable');
    console.log('   1. Login to the app in your browser');
    console.log('   2. Open DevTools > Application > Cookies');
    console.log('   3. Copy the value of __clerk_db_jwt');
    console.log('   4. Run: CLERK_AUTH_TOKEN=your-token-here node scripts/test-collections-api.js');
    return;
  }

  try {
    // Test 1: Create a collection
    console.log('1️⃣ Creating a new collection...');
    const createRes = await fetch(`${API_URL}/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Test Collection',
        description: 'Testing the collections API',
        isPublic: false
      })
    });
    
    if (!createRes.ok) {
      throw new Error(`Create failed: ${createRes.status} ${await createRes.text()}`);
    }
    
    const collection = await createRes.json();
    console.log('✅ Created collection:', collection.id);

    // Test 2: Get all collections
    console.log('\n2️⃣ Fetching all collections...');
    const getRes = await fetch(`${API_URL}/collections`, { headers });
    
    if (!getRes.ok) {
      throw new Error(`Get failed: ${getRes.status}`);
    }
    
    const collections = await getRes.json();
    console.log(`✅ Found ${collections.length} collections`);

    // Test 3: Update collection
    console.log('\n3️⃣ Updating collection...');
    const updateRes = await fetch(`${API_URL}/collections/${collection.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Updated Test Collection',
        isPublic: true
      })
    });
    
    if (!updateRes.ok) {
      throw new Error(`Update failed: ${updateRes.status}`);
    }
    
    console.log('✅ Collection updated');

    // Test 4: Add a card (using a sample card ID)
    console.log('\n4️⃣ Adding a card to collection...');
    // First, get a card ID
    const cardsRes = await fetch(`${API_URL}/cards?limit=1`);
    const cardsData = await cardsRes.json();
    
    if (cardsData.cards && cardsData.cards.length > 0) {
      const cardId = cardsData.cards[0].id;
      
      const addCardRes = await fetch(`${API_URL}/collections/${collection.id}/cards`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cardId,
          quantity: 2,
          condition: 'NM',
          language: 'EN',
          notes: 'Test card'
        })
      });
      
      if (!addCardRes.ok) {
        throw new Error(`Add card failed: ${addCardRes.status}`);
      }
      
      console.log('✅ Card added to collection');
    } else {
      console.log('⚠️  No cards found to test with');
    }

    // Test 5: Get collection details
    console.log('\n5️⃣ Fetching collection details...');
    const detailRes = await fetch(`${API_URL}/collections/${collection.id}`, { headers });
    
    if (!detailRes.ok) {
      throw new Error(`Get details failed: ${detailRes.status}`);
    }
    
    const details = await detailRes.json();
    console.log('✅ Collection details:');
    console.log(`   - Name: ${details.name}`);
    console.log(`   - Cards: ${details.totalCards || 0}`);
    console.log(`   - Value: $${details.totalValue || 0}`);

    // Test 6: Get public collections
    console.log('\n6️⃣ Fetching public collections...');
    const publicRes = await fetch(`${API_URL}/collections/public`);
    
    if (!publicRes.ok) {
      throw new Error(`Get public failed: ${publicRes.status}`);
    }
    
    const publicData = await publicRes.json();
    console.log(`✅ Found ${publicData.total} public collections`);

    // Test 7: Delete collection
    console.log('\n7️⃣ Deleting test collection...');
    const deleteRes = await fetch(`${API_URL}/collections/${collection.id}`, {
      method: 'DELETE',
      headers
    });
    
    if (!deleteRes.ok) {
      throw new Error(`Delete failed: ${deleteRes.status}`);
    }
    
    console.log('✅ Collection deleted');

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run tests
testCollectionsAPI();
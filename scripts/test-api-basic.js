const https = require('https');

// Test basic API access without any libraries or API key
async function testBasicAPIAccess() {
  console.log('Testing Pokemon TCG API access with basic https module...\n');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pokemontcg.io',
      path: '/v2/cards?page=1&pageSize=1',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; PokemonCatalog/1.0)'
      }
    };

    console.log('Making request to:', `https://${options.hostname}${options.path}`);
    console.log('Headers:', options.headers);

    const req = https.get(options, (res) => {
      console.log('\nResponse Status:', res.statusCode);
      console.log('Response Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => { 
        data += chunk; 
      });
      
      res.on('end', () => {
        console.log('\nResponse Body (first 500 chars):');
        console.log(data.substring(0, 500));
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log('\n✅ SUCCESS! API is accessible');
            console.log('Total count:', parsed.totalCount);
            console.log('First card:', parsed.data[0]?.name);
            resolve(parsed);
          } catch (e) {
            console.log('\n❌ Failed to parse JSON:', e.message);
            reject(e);
          }
        } else {
          console.log('\n❌ API returned error status:', res.statusCode);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('\n❌ Request error:', err);
      reject(err);
    });

    req.end();
  });
}

// Run the test
testBasicAPIAccess().catch(console.error);